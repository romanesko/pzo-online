// app/page.tsx

import DayColumn from "@/routes/booking/components/DayColumn";
import {Text} from "@mantine/core";
import {type Office, type ScheduleItemCombined, Settings} from "@/models";
import {calculateIntervals} from "@/lib/common";


function prettyTime(date: Date) {
  return date.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface CalendarProps {
  offices: Office[]
  date: string
  onSlotClick: (props: { slot: ScheduleItemCombined }) => void
  settings: Settings
}




export default function Calendar({ date, offices, onSlotClick, settings}: CalendarProps) {

  const calendar = [] as {time: string, label: string, hourStart: boolean}[]

  const originalDate = new Date(date);

  const [hours, minutes] = settings.FIRST_SLOT.split(':').map(Number);
  originalDate.setHours(hours, minutes, 0, 0);

  const slotsCount = calculateIntervals(settings.FIRST_SLOT, settings.LAST_SLOT,settings.SLOT_STEP)

  for (let i = 0; i < slotsCount; i++) {
    const minutes = 5 * i
    const date = new Date(originalDate.getTime() + minutes * 60000)
    const key = prettyTime(date)
    const hourStart = date.getMinutes() == 0
    const item = {time: key, label: hourStart ? key : '', hourStart}
    calendar.push(item)
  }

  const firstColumnWidth = 32
  const height = 10
  const width = 90


  return (
      <>
        <div style={{width: firstColumnWidth + offices.length * width}}>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{fontSize: 10, width: firstColumnWidth}}></div>
            {offices.map((office, i) => (
                <div style={{fontSize: 10, width: width, textAlign: 'center'}} key={office.id}>
                  <Text size={"xs"}>{office.name}</Text>
                  <DayColumn calendar={calendar} officeId={office.id} date={date} width={width} height={height} onSlotClick={onSlotClick}/>
                </div>
            ))}

          </div>
          {calendar.map((item, i) => (
              <div
                  key={i} style={{
                borderTop: item.hourStart ? '1px solid gray' : '1px solid white',
                display: 'flex',
                flexDirection: 'row',
                height: height,
                marginTop: item.hourStart ? 0 : 0,
                marginBottom: item.hourStart ? 2 : 0,
                // paddingTop: item.hourStart ? 2 : 0,
              }}>
                <div style={{fontSize: 10, width: firstColumnWidth}}>{item.label}</div>
              </div>
          ))}


        </div>

      </>
  )
}


