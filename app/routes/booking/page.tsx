import {Alert, Card, Flex, ScrollArea} from "@mantine/core";
import Calendar from "./calendar";
import React from "react";
import Record from "@/routes/booking/components/Record";
import {repo} from "@/database/repo";
import {formatDate} from "@/lib/common";
import type {Client, Office, ScheduleItemCombined} from "@/models";
import {useFetcher, useNavigate} from "react-router";
import RecordView from "@/routes/booking/components/RecordView";
import {IconCalendarClock} from "@tabler/icons-react";
import {session} from "@/lib/SessionStorage";


interface LoaderData {
  dates: [{ label: string, date: string }],
  client: Client | null,
  offices: Office[]
  officeId: BigInt | null,
  date: string | null,
  time: string | null,
  moveFromBooking: number | null
}


interface BookingProps {
  loaderData: LoaderData
}



export async function loader({request}: any) {
  await session.userRequireRole(request, 'OPERATOR')

  const url = new URL(request.url);
  let clientId = url.searchParams.get('clientId') as any
  let officeId = url.searchParams.get('officeId') as any
  let moveFromBooking = url.searchParams.get('moveFromBooking') as any
  const date = url.searchParams.get('date')
  const time = url.searchParams.get('time')


  const today = new Date()
  const dates = []

  for (let i = 0; i < 7; i++) {
    const d = {
      date: formatDate(today),
      label: today.toLocaleDateString('ru-RU', {weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'})
    }
    dates.push(d)
    today.setDate(today.getDate() + 1)
  }


  let client = null

  if (clientId) {
    clientId = +clientId
    client = await repo.clients.getById(clientId)
  }

  if (officeId) {
    officeId = +officeId
  }

  if(moveFromBooking){
    moveFromBooking = +moveFromBooking
  }

  const offices = await repo.offices.getAll()


  return {dates, client, offices, officeId, date, time,moveFromBooking}

}


export default function Page({loaderData}: BookingProps) {

  let {dates, client, offices, officeId, date, time,moveFromBooking} = loaderData;

  // const refreshKey = `${client?.id}_${officeId}_${date}_${time}`

  const [selectedSlot, setSelectedSlot] = React.useState<ScheduleItemCombined | null>(null)
  const [renderKey, setRenderKey] = React.useState(0)
  const fetcher = useFetcher()


  const navigate = useNavigate()

  function handleSlotClick({slot}: {slot: ScheduleItemCombined}) {

    setSelectedSlot(slot)
    setRenderKey(renderKey + 1)
  }

  function handleCancelMove(){
    const url = new URL(window.location.href)
    url.searchParams.delete('moveFromBooking')
    navigate(url.pathname + url.search)
  }



  return (<>

        {moveFromBooking && <>
          <Alert mx={20} my={10} variant="light" color="blue" title="Перенос записи" icon={<IconCalendarClock size={20}/>}
                 withCloseButton closeButtonLabel="Dismiss" onClose={handleCancelMove}
          >
            Выберите любое доступное время в календаре для переноса
          </Alert>
          </>
        }

        <ScrollArea scrollbars={"x"} m={20}>
          <Flex gap="md" justify="flex-start" align="flex-start" direction="row" wrap="nowrap">
            {dates.map(({label, date}, i) => (
                <Card key={i} style={{}} py={4} px={4} mb={40} shadow="lg" withBorder>
                  <div style={{fontSize: 12, textAlign: 'center', marginBottom: 10}}>{label}</div>
                  <Calendar offices={offices}  date={date} onSlotClick={handleSlotClick}/>
                </Card>
            ))}
          </Flex>
        </ScrollArea>

        {selectedSlot &&
            (selectedSlot.booking ?
            <RecordView key={renderKey} slot={selectedSlot}/>:
            <Record key={renderKey} client={client} slot={selectedSlot.schedule} moveFromBooking={moveFromBooking}/>)
        }

      </>
  )
}


