import type {ScheduleItemCombined} from "@/models";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {Alert, Button, Group, Modal, Stack, Table} from "@mantine/core";
import React, {useEffect} from "react";
import {swr} from "@/lib/swr-hooks";
import {useFetcher, useNavigate} from "react-router";
import {IconAlertCircle} from "@tabler/icons-react";
import {swrKeys} from "@/lib/common";
import {mutateForEveryone} from "@/lib/mutate";
import {alertError} from "@/lib/notify";

export interface RecordViewParams {
  slot: ScheduleItemCombined
}

function processAction(fetcher: any, actionName: string, params: any) {
  fetcher.submit({
    action: actionName,
    ...params
  }, {action: '/api/booking/update', method: 'post'}).catch((err: any) => {
    alertError(err)
  })
}

export default function RecordView({slot}: RecordViewParams) {

  const [opened, {open, close}] = useDisclosure(true);
  const isMobile = useMediaQuery('(max-width: 50em)');
  const navigate = useNavigate()


  const {data: client} = swr.clientById(slot.booking!.clientId)
  const {data: office} = swr.getOffice(slot.schedule!.officeId)

  const fetcher = useFetcher()

  function handleMoveClick() {
    navigate(`/booking?clientId=${slot.booking!.clientId}&moveFromBooking=${slot.booking!.id}`)
    close()
  }

  function handleCancelClick() {
    processAction(fetcher, 'cancel', {bookingId: slot.booking!.id})
  }

  async function handleConfirmClick() {
    processAction(fetcher, 'confirm', {bookingId: slot.booking!.id})
  }

  async function handleUnConfirmClick() {
    processAction(fetcher, 'unConfirm', {bookingId: slot.booking!.id})
  }


  useEffect(() => {
    if (!fetcher.data || fetcher.data?.error) {
      return
    }
    mutateForEveryone(swrKeys.slotsForOfficeByDate(slot.schedule!.officeId, slot.schedule!.date))
    close()
  }, [fetcher.data])


  return <Modal
      size="auto" opened={opened} onClose={close} title="Информация о записи" fullScreen={isMobile}
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
            <Table.Td>{new Date(slot.schedule.date).toLocaleDateString('ru-RU', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Время</Table.Th>
            <Table.Td>{slot.schedule.startTime}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Сеанс</Table.Th>
            <Table.Td>{slot.schedule.duration} мин</Table.Td>
          </Table.Tr>

          {client && <>
            <Table.Tr>
              <Table.Th>Клиент</Table.Th>
              <Table.Td>{client.lastName} {client.firstName} {client.middleName}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Телефон</Table.Th>
              <Table.Td>{client.phoneNumber}</Table.Td>

            </Table.Tr>
          </>}


        </Table.Tbody>

      </Table>

      {fetcher.data && fetcher.data.error &&
        <Alert variant="light" color="red" title="Ошибка" icon={<IconAlertCircle size={16}/>}>
          {fetcher.data.error}
        </Alert>}

      <Group mt="md" justify="space-between">

        <Button onClick={handleCancelClick} size="xs" color={"red"} variant="filled">
          Отменить запись
        </Button>
        <Button onClick={handleMoveClick} size="xs" variant="filled">
          Перенести запись
        </Button>
        {slot.booking!.state == 'pending' &&
          <Button onClick={handleConfirmClick} size="xs" variant="filled" color={"green"}>
            Подтвердить запись
          </Button>}
        {slot.booking!.state == 'confirmed' &&
          <Button onClick={handleUnConfirmClick} size="xs" variant="outline" color={"gray"}>
            Снять подтверждение
          </Button>}
      </Group>


    </Stack>
  </Modal>

}
