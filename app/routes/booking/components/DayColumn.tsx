import styles from "@/routes/booking/calendar.module.css";
import {Loader} from "@mantine/core";
import type {ScheduleItemCombined} from "@/models";
import classNames from "classnames";
import {swr} from "@/lib/swr-hooks";
import {alertError} from "@/lib/notify";

export interface DayColumnParams {
  calendar: { time: string, label: string, hourStart: boolean }[]
  officeId: number
  date: string
  width: number
  height: number
  onSlotClick: (props: { slot: ScheduleItemCombined}) => void
}


export default function DayColumn({calendar, officeId, date, width, height, onSlotClick}: DayColumnParams) {

  const {data, error, isLoading} = swr.slotsByOfficeAndDAte(officeId,date)

  function handleClick(item: ScheduleItemCombined){

    if(item.locked){
      alertError('Кто-то сейчас работает с этим слотом. Попробуйте позже')
      return
    }

    onSlotClick({slot: item})
  }

  if (isLoading || !data) {
    return <div style={{position: 'relative', width: width}}>
      <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 40,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 10
          }}>
        <Loader color="gray" type="dots"/>
      </div>
    </div>
  }


  // const items = [{state: 0,  duration: 20, hourStart: 0, start: '09:00', end: '09:10'}]

  const schedule = (time: string) => {
    // console.log('check', time, 'in', data)
    const i = data[time]
    if (!i) {
      return undefined
    }
    return i
  }

  const bookedInfo = (item: ScheduleItemCombined) => {

    if (item.locked) {
      return 'locked'
    }

    const i = item.booking
    if (!i) {
      return 'free'
    }
    return i.state
  }

  const slotClasses = (item: ScheduleItemCombined) => classNames(styles.slot, {
    [styles.slot]: true,
    [styles.slotFree]: bookedInfo(item) === 'free',
    [styles.slotUsed]: bookedInfo(item) !== 'free',
    [styles.slotLocked]: bookedInfo(item) === 'locked',
    [styles.slotConfirmed]: bookedInfo(item) === 'confirmed',
  });

  return <div style={{position: 'relative', width: width}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: 40, zIndex: 10}}>

      {calendar.map((time, rowIdx) => (
          <div
              key={rowIdx} style={{
            position: 'relative', width: width, height: height,
            marginTop: time.hourStart ? 2 : 0,
          }}>

            {schedule(time.time) ?
                <div
                    onClick={()=>handleClick(schedule(time.time)!)}
                    className={styles.slotWrapper} style={{
                  height: (schedule(time.time)!.schedule.duration / 5) * height,
                  paddingTop: 0,
                  paddingBottom: 1,
                }}>
                  <div
                      className={slotClasses(schedule(time.time)!)} style={{


                  }}>
                    {schedule(time.time)!.schedule.startTime} - {schedule(time.time)!.schedule.endTime}
                  </div>
                </div> : <></>}

          </div>
      ))}
    </div>
  </div>
}



