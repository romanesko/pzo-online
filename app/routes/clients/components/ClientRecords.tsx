import {Button, Stack, Table, Text} from "@mantine/core";
import type {Client, ScheduleItemCombined} from "@/models";
import {formatDateFull} from "@/lib/common";
import RecordView from "@/routes/booking/components/RecordView";
import {useState} from "react";
import {useNavigate} from "react-router";

export default function ClientRecords({client, bookings}: { client: Client, bookings: ScheduleItemCombined[] }) {

  const [schedule, setSchedule] = useState<ScheduleItemCombined | null>(null)
  const [renderCount, setRenderCount] = useState(0)
  const navigate = useNavigate()

  function handleRowClick(item: ScheduleItemCombined){
    setRenderCount(renderCount + 1)
    setSchedule(item)
  }

  function handleAddClick() {
    navigate('/booking?clientId=' + client.id)
  }

  return <Stack>

    {bookings.length ?
      <Stack>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center">Дата</Table.Th>
              <Table.Th ta="center">Время</Table.Th>
              <Table.Th>Место</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
          {bookings.map(({schedule, booking,offices}) => {
            return <Table.Tr style={{cursor:'pointer'}} key={schedule.id} onClick={()=>handleRowClick({schedule, booking, offices})}>
              <Table.Td ta="center">{formatDateFull(schedule.date)}</Table.Td>
              <Table.Td ta="center">{schedule.startTime}</Table.Td>
              <Table.Td >{offices?.name}</Table.Td>
            </Table.Tr>
          })}

          </Table.Tbody>
        </Table>
      </Stack>

        :<Text size="xs" c="dimmed">Записей пока нет</Text>}
      <Button onClick={handleAddClick}  variant="outline">Записать на приём</Button>


    {schedule && <RecordView key={renderCount} slot={schedule}/>}

  </Stack>
}
