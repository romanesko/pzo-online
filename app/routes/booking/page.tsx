import {Alert, Card, Container, Flex, ScrollArea} from "@mantine/core";
import Calendar from "./calendar";
import React from "react";
import Record from "@/routes/booking/components/Record";
import {repo} from "@/database/repo";
import {calculateDaysBetween, formatDate} from "@/lib/common";
import type {ScheduleItemCombined} from "@/models";
import {useFetcher, useNavigate} from "react-router";
import RecordView from "@/routes/booking/components/RecordView";
import {IconCalendarClock} from "@tabler/icons-react";
import {session} from "@/lib/SessionStorage";
import type {Route} from "@/types/routes/booking/+types/page";
import {settingsRepo} from "@/database/repo/settings";
import RangeCalendar from "@/routes/booking/components/RangeCalendar";

export async function loader({request}: Route.LoaderArgs) {
  await session.userRequireRole(request, 'OPERATOR')

  const url = new URL(request.url);
  let clientId = url.searchParams.get('clientId') as any
  let moveFromBooking = url.searchParams.get('moveFromBooking') as any

  let fromDate = url.searchParams.get('from') as string
  let toDate = url.searchParams.get('to') as string

  const services = await repo.services.getAll()

  const settings = await settingsRepo.get()

  let startDate = new Date()
  let daysToShow = settings.DEFAULT_CALENDAR_DAYS;

  if (fromDate) {
    startDate = new Date(fromDate)
  }
  if (toDate) {
    daysToShow = calculateDaysBetween(startDate, new Date(toDate)) + 1
  }


  const dates = [] as { date: string, label: string }[]

  for (let i = 0; i < daysToShow; i++) {
    const d = {
      date: formatDate(startDate),
      label: startDate.toLocaleDateString('ru-RU', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})
    }
    dates.push(d)
    startDate.setDate(startDate.getDate() + 1)
  }


  let client = null

  if (clientId) {
    clientId = +clientId
    client = await repo.clients.getById(clientId)
  }


  if (moveFromBooking) {
    moveFromBooking = +moveFromBooking
  }

  const offices = await repo.offices.getAll()


  return {dates, services, client, offices, moveFromBooking, settings}

}


export default function Page({loaderData}: Route.ComponentProps) {

  let {dates, client, offices, services, moveFromBooking, settings} = loaderData;

  // const refreshKey = `${client?.id}_${officeId}_${date}_${time}`

  const [selectedSlot, setSelectedSlot] = React.useState<ScheduleItemCombined | null>(null)
  const [renderKey, setRenderKey] = React.useState(0)
  const fetcher = useFetcher()


  const navigate = useNavigate()

  function handleSlotClick({slot}: { slot: ScheduleItemCombined }) {

    if (!slot.booking) {
      const datetimeString = `${slot.schedule.date}T23:59:00`;
      const eventDate = new Date(datetimeString);
      const now = new Date();
      if (eventDate < now) {
        return alert('Слот недоступен (время прошло)')
      }
    }

    setSelectedSlot(slot)
    setRenderKey(renderKey + 1)
  }

  function handleCancelMove() {
    const url = new URL(window.location.href)
    url.searchParams.delete('moveFromBooking')
    navigate(url.pathname + url.search)
  }


  return (<>

        <Container mx={20} my={4} p={0} key={JSON.stringify(dates)}>
          <RangeCalendar dates={dates}/>
        </Container>

        {moveFromBooking && <>
          <Alert
            mx={20}
            my={10}
            variant="light"
            color="blue"
            title="Перенос записи"
            icon={<IconCalendarClock size={20}/>}
            withCloseButton
            closeButtonLabel="Dismiss"
            onClose={handleCancelMove}>
            Выберите любое доступное время в календаре для переноса
          </Alert>
        </>
        }

        <ScrollArea scrollbars={"x"} mx={20} my={0}>
          <Flex gap="md" justify="flex-start" align="flex-start" direction="row" wrap="nowrap">
            {dates.map(({label, date}, i) => (
                <Card key={i} style={{}} py={4} px={4} mb={40} shadow="lg" withBorder>
                  <div style={{fontSize: 12, textAlign: 'center', marginBottom: 10}}>{label}</div>
                  <Calendar offices={offices} settings={settings} date={date} onSlotClick={handleSlotClick}/>
                </Card>
            ))}
          </Flex>
        </ScrollArea>

        {selectedSlot &&
            (selectedSlot.booking ?
                <RecordView key={renderKey} slot={selectedSlot}/> :
                <Record
                    services={services}
                    key={renderKey}
                    client={client}
                    slot={selectedSlot.schedule}
                    moveFromBooking={moveFromBooking}/>)
        }


      </>
  )
}


