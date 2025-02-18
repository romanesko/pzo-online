import {ActionIcon, Button, Group, Modal, Text} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import React, {useEffect, useState} from "react";
import {useFetcher} from "react-router";
import {formatDate, formatDateFull} from "@/lib/common";
import {Calendar} from "@mantine/dates";
import {IconCopy} from "@tabler/icons-react";

const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

function isDateMatch(date: Date, targetDate: Date) {
  return date.getDate() == targetDate.getDate() && date.getMonth() == targetDate.getMonth() && date.getFullYear() == targetDate.getFullYear()
}


export default function WeekDay({num, date, width, officeId}: {
  num: number,
  date: string,
  width: number,
  officeId: number
}) {

  const [popoverOpened, setPopoverOpened] = useState(false)
  const [modalOpened, {open, close}] = useDisclosure(false);
  let tdInit = new Date(date)
  tdInit.setDate(tdInit.getDate() + 1)
  const [targetDate, setTargetDate] = useState(tdInit)

  const fetcher = useFetcher()


  async function doCopy() {


    return fetcher.submit({
      action: "copyScheduleDate",
      sourceDate: date,
      targetDate: formatDate(targetDate),
      officeId: officeId,
    }, {method: "post"})
  }

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) {
      return
    }

    if (fetcher.data.error) {
      alert(fetcher.data.error)
      return
    }

    close()


  }, [fetcher.state, fetcher.data]);

  function handleCopyClick() {
    setPopoverOpened(false)

    open()
  }


  function renderModal() {
    return <Modal opened={modalOpened} onClose={close} title="Скопировать расписание">
      <Group justify="center">
        <Text size={"sm"}>расписание <span style={{fontWeight: 'bold'}}>{formatDateFull(date)}</span> будет скопировано
          в</Text>
        <Calendar
            firstDayOfWeek={1} withCellSpacing={false} getDayProps={(date) => ({
          selected: isDateMatch(date, targetDate),
          onClick: () => setTargetDate(date),
        })
        }/>


        <Text mb={"xs"} size={"sm"}>Действие перезапишет все ранее созданные слоты</Text>
      </Group>
      <Group mt="lg" justify="flex-end">
        <Button onClick={close} variant="default">
          Cancel
        </Button>
        <Button
            onClick={() => {
              doCopy()
            }} color="red">
          Да
        </Button>
      </Group>
    </Modal>
  }


  return <>
    <Group gap={2} justify="center" align="center" style={{width: width}}>
      <div style={{width:24}}></div>
      <div
          style={{fontSize: 10,  textAlign: 'center', cursor: 'default'}}
          key={date}
          onClick={() => setPopoverOpened(true)}>
        {weekdays[num]}
        <div>{date}</div>
      </div>
      <ActionIcon
          variant="subtle"
          aria-label="Copy"
          onClick={handleCopyClick}
          loading={fetcher.state !== 'idle'}
          size={"sm"}>
        <IconCopy style={{width: '70%', height: '70%'}} stroke={1.5}/>
      </ActionIcon>
    </Group>


    {modalOpened && renderModal()}
  </>
}
