import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import React, {useEffect, useRef, useState} from "react";
import {Alert, Button, Group, Modal, NativeSelect, Stack, Table} from "@mantine/core";
import {useFetcher, useNavigate} from "react-router";
import type {Client, ScheduleItem, Service} from "@/models";
import ClientSearch from "@/routes/booking/components/ClientSearch";
import ClientAdd from "@/routes/booking/components/ClientAdd";
import {IconAlertCircle} from "@tabler/icons-react";
import {prettyPrintPhone, swrKeys} from "@/lib/common";
import {api} from "@/lib/api";
import {mutateForEveryone} from "@/lib/mutate";
import {swr} from "@/lib/swr-hooks";
import {alertError} from "@/lib/notify";


interface RecordProps {
  client: Client | null
  slot: ScheduleItem
  moveFromBooking: number | null
  services: Service[]
}

export default function Record({client: originalClient, slot, moveFromBooking, services}: RecordProps) {

  const [opened, {open, close}] = useDisclosure(true);
  const isMobile = useMediaQuery('(max-width: 50em)');
  const fetcher = useFetcher();

  const [client, setClient] = useState(originalClient);
  const [createNewClient, setCreateNewClient] = useState(false)

  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id)

  const [proposedPhone, setProposedPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  const {data: office} = swr.getOffice(slot.officeId)

  const sendingLock = useRef(false)
  const lockInterval = useRef<any>(null)

  function handleClientFound(client: Client) {
    setCreateNewClient(false)
    setClient(client)
  }

  function handleClientNotFound(client: { phone: string }) {
    setClient(null)
    setProposedPhone(client.phone)
    setCreateNewClient(true)
  }

  function handleChangeClient() {
    setClient(null)
  }

  function handleAddNewRecord() {
    if (!client || !client.id) {
      alertError('Клиент не указан')
      return
    }
    if (!slot || !slot.id) {
      alertError('Слот не указан')
      return
    }

    if(!selectedServiceId){
      alertError('Услуга не выбрана')
      return
    }

    setSubmitting(true)
    fetcher.submit({
      action: 'addRecord',
      clientId: client.id,
      slotId: slot.id,
      serviceId: selectedServiceId,
      moveFromBooking: moveFromBooking,
    }, {action: "/api/booking/record", method: "post"})
  }

  function removeExtraFromUrl() {
    const url = new URL(window.location.href)
    url.searchParams.delete('clientId')
    url.searchParams.delete('moveFromBooking')
    navigate(url.pathname + url.search)
  }

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        return
      }
      setSubmitting(false)
      close()
      removeExtraFromUrl()

    }
  }, [fetcher.data])


  function lockSlot() {
    if (!sendingLock.current) return Promise.resolve()
    return api.booking.lockSlot(slot.id!).then(res => {
      // console.log('lockSlot', res)
      return true;
    })
  }

  function unlockSlot() {
    return api.booking.unlockSlot(slot.id!).then(res => {
      console.log('unlockSlot', res)
      return true;
    })
  }

  useEffect(() => {
    if (lockInterval.current) {
      return
    }
    lockInterval.current = setInterval(() => {
      lockSlot()
    }, 1000);
    return () => {
      clearInterval(lockInterval.current)
      lockInterval.current = null
    }
  })

  useEffect(() => {

    if (sendingLock.current === opened) return

    sendingLock.current = opened

    if (opened) {
      console.log('starting locker')
      lockSlot().then(() => {
        mutateForEveryone(swrKeys.slotsForOfficeByDate(slot.officeId, slot.date))
      })

    }

    if (!opened) {
      console.log('stopping locker')
      unlockSlot().then(() => {

        if(moveFromBooking){
          api.booking.getById(moveFromBooking).then(res=>{
            mutateForEveryone(swrKeys.slotsForOfficeByDate(res.schedule.officeId, res.schedule.date))
          })
        }

        mutateForEveryone(swrKeys.slotsForOfficeByDate(slot.officeId, slot.date))
      })
    }




  }, [opened])


  return <Modal
      size="auto" opened={opened} onClose={close} title="Запись на приём" fullScreen={isMobile}
      // transitionProps={{ transition: 'fade', duration: 200 }}
  >
    <Stack style={{minWidth: 400}}>


      <Table variant="vertical" withTableBorder>

        <Table.Tbody>
          <Table.Tr>
            <Table.Th>Клиника</Table.Th>
            <Table.Td>{office?.name}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Дата</Table.Th>
            <Table.Td>{new Date(slot.date).toLocaleDateString('ru-RU', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Время</Table.Th>
            <Table.Td>{slot.startTime}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Сеанс</Table.Th>
            <Table.Td>{slot.duration} мин</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Услуга</Table.Th>
            <Table.Td py={0}><NativeSelect variant="unstyled"
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(+event.currentTarget.value)}
                data={services.map(service => ({value: service.id.toString(), label: service.name} ))}
            /></Table.Td>
          </Table.Tr>

          {client && <>
            <Table.Tr>
              <Table.Th>Клиент</Table.Th>
              <Table.Td>{client.lastName} {client.firstName} {client.middleName}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Телефон</Table.Th>
              <Table.Td>{prettyPrintPhone(client.phoneNumber)}</Table.Td>

            </Table.Tr>
          </>}


        </Table.Tbody>

      </Table>

      {Boolean(client) || <>
        {createNewClient ? <ClientAdd phone={proposedPhone} onClientAdded={handleClientFound}/> :
            <ClientSearch onFound={handleClientFound} onNotFound={handleClientNotFound}/>}
      </>}
      <Stack>
        {fetcher.data && fetcher.data.error &&
          <Alert variant="light" color="red" title="Ошибка" icon={<IconAlertCircle size={16}/>}>
            {fetcher.data.error}
          </Alert>}
        <Group mt="lg" justify="space-between">
          {moveFromBooking ? <>&nbsp;</> :
          <Button
              c="dimmed"
              variant="transparent"
              style={{opacity: Boolean(client) ? 1 : 0}}
              color="gray"
              size="xs"
              onClick={handleChangeClient}>другой клиент</Button> }
          <Button loading={submitting} disabled={!Boolean(client)} onClick={handleAddNewRecord}>
            {moveFromBooking ? <>Перенести запись</> : <>Записать на приём</>}
          </Button>
        </Group>
      </Stack>

    </Stack>
  </Modal>
}
