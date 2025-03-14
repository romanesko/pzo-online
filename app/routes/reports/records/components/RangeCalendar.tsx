import {Button, Container, Group, Modal, Stack, Text} from "@mantine/core";
import {formatDate} from "@/lib/common";
import {useDisclosure} from "@mantine/hooks";
import {DatePicker} from "@mantine/dates";
import {useState} from "react";
import {useNavigate} from "react-router";
import {alertError} from "@/lib/notify";

export interface RangeCalendarProps {
   firstDate: Date,
    lastDate: Date
}

function rangeDateFormat(date: string | Date | null){
  if (date == null) return ''
  if(typeof date == 'string') {
    date = new Date(date)
  }

  return date.toLocaleDateString('ru-RU', {  month: 'long', day: 'numeric'})
}

export default function RangeCalendar(props: RangeCalendarProps){

  const firstDate = props.firstDate
  const lastDate = props.lastDate

  const title = rangeDateFormat(firstDate) + ' — ' + rangeDateFormat(lastDate)
  const [opened, { open, close }] = useDisclosure(false);

  const [fromDate, setFromDate] = useState<Date | null>(new Date(firstDate));
  const [toDate, setToDate] = useState<Date | null>(new Date(lastDate));

  const navigate = useNavigate()

  function handleApplyClick(){
    if(fromDate == null || toDate == null){
      alertError('Не выбран диапазон дат')
      return
    }
    const strFrom = formatDate(fromDate)
    const strTo = formatDate(toDate)

    navigate('/reports/records?from=' + strFrom + '&to=' + strTo)
    close()

  }

  return <Container m={0} p={0}>
    <Button size={"xs"} variant="subtle" onClick={open}>{title}</Button>
    <Modal opened={opened} onClose={close} size="auto" title="Выберите диапазон дат">
      <Stack>
      <Group>
        <DatePicker value={fromDate} onChange={setFromDate} />
        <DatePicker value={toDate} onChange={setToDate} />
      </Group>
        <Group justify="center" gap={8}>
        <Text size={"sm"} c={"dimmed"}>с</Text>
        <Text>{rangeDateFormat(fromDate)}</Text>
        <Text size={"sm"} c={"dimmed"}>по</Text>
        <Text>{rangeDateFormat(toDate)}</Text>
        </Group>
        <Group justify="flex-end">
          <Button onClick={handleApplyClick}>Применить</Button>
        </Group>
      </Stack>


    </Modal>

  </Container>
}
