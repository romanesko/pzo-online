// app/page.tsx

import type {Office, Schedule, ScheduleItem, ScheduleItemBase} from "@/models";
import {FIRST_SLOT, LAST_SLOT, SLOT_STEP} from "@/lib/constants";
import Slot from "@/routes/schedule/components/Slot";
import {Group} from "@mantine/core";
import WeekDay from "@/routes/schedule/components/WeekDay";

const firstColumnWidth = 40
const height = 20
const width = (928 - firstColumnWidth) / 7

interface CalendarProps {
  office: Office,
  dates: string[],
  schedule: { [key: string]: Schedule[] },
  onAdd: (props: ScheduleItem) => void
  onDelete: (props: { id: number }) => void
}

export interface SlotInfo extends ScheduleItemBase {
  state: number,
  id?: number
}

export default function Calendar({office, dates, schedule, onAdd, onDelete}: CalendarProps) {

  const calendar = [];

  function handleAdd(date: string, item: ScheduleItemBase) {
    onAdd({...item, officeId: office.id, date: date})
  }

  function handleDelete(params: { id: number }) {
    onDelete(params)
  }


  const rows = [] as { [key: string]: SlotInfo }[]


  for (let date of dates) {
    const dateDate = Date.parse(date)

    const firstSlotDate = new Date(dateDate)
    firstSlotDate.setHours(parseInt(FIRST_SLOT), 0, 0, 0)

    const lastSlotDate = new Date(dateDate)
    lastSlotDate.setHours(parseInt(LAST_SLOT), 0, 0, 0)

    const scheduleMap = {} as { [key: string]: ScheduleItem }

    for (let scheduleItem of (schedule[date] || [])) {
      scheduleMap[scheduleItem.startTime] = scheduleItem
    }
    const slots = {} as { [key: string]: SlotInfo }

    let curTime = new Date(firstSlotDate)
    while (curTime < lastSlotDate) {
      const slotStart = curTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
      const slotEnd = new Date(curTime.getTime() + SLOT_STEP * 60000).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
      let item = {startTime: slotStart, endTime: slotEnd, duration: SLOT_STEP, state: 0, id: undefined} as SlotInfo

      const scheduleItem = scheduleMap[slotStart]
      if (scheduleItem) {
        item = {...item, ...scheduleItem, state: 1}
      }

      slots[slotStart] = item
      curTime.setMinutes(curTime.getMinutes() + SLOT_STEP)



    }
    rows.push(slots)
  }


  const originalDate = new Date();
  originalDate.setHours(9, 0, 0, 0);

  for (let slot of Object.values(rows[0])) {
    const item = {date: slot.startTime, key: slot.startTime, hourStart: slot.startTime.endsWith('00')}
    calendar.push(item)
  }


  return (
      <Group justify="center" align="center">
        <div style={{width: firstColumnWidth + rows.length * width}}>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{fontSize: 10, width: firstColumnWidth}}></div>
            {dates.map((date, i) =>  <WeekDay key={i} date={date} num={i} width={width} officeId={office.id}/>)}
            {/*<div style={{fontSize: 10, width: width, textAlign: 'center'}}>кабинет 2</div>*/}
            {/*<div style={{fontSize: 10, width: width, textAlign: 'center'}}>кабинет 3</div>*/}
          </div>
          {calendar.map((item, i) => (
              <div
                  key={i} style={{
                borderTop: item.hourStart ? '1px solid gray' : 'none',
                display: 'flex',
                flexDirection: 'row',
                height: height
              }}>
                <div style={{fontSize: 10, width: firstColumnWidth}}>{item.hourStart ? item.key : ''}</div>

                {dates.map((date, rowIdx) =>
                    <Slot
                        width={width}
                        key={rowIdx + '' + item.key}
                        item={rows[rowIdx][item.key]}
                        hourStart={item.hourStart}
                        height={height}
                        onAdd={(item)=>handleAdd(date,item)}
                        onDelete={handleDelete}/>)}


              </div>
          ))}
        </div>

      </Group>
  )
}


