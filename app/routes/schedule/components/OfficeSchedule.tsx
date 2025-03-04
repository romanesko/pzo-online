import type {Office, Schedule, ScheduleItem, ScheduleItemCombined} from "@/models";
import {Group, Stack} from "@mantine/core";
import React, {useEffect} from "react";
import {useFetcher} from "react-router";
import Calendar from "@/routes/schedule/components/Calendar";
import {WeekPicker} from "@/routes/schedule/components/WeekPicker";
import type {Settings} from "@/database/repo/settings";

interface OfficeScheduleProps {
  office: Office,
  dates: string[],
  data: ScheduleItemCombined[]
  settings: Settings
}

export default function OfficeSchedule({office, dates, data, settings}: OfficeScheduleProps) {

  const fetcher = useFetcher();

  useEffect(() => {
        if (!fetcher.data) return
        // console.log('fetcher.data', fetcher.data)
        if (fetcher.data.error) {
          alert(fetcher.data.error)
          return
        }


      }
      , [fetcher.state])

  function onAdd(data: ScheduleItem) {
    fetcher.submit({action: 'addScheduleItem', ...data}, {
      action: "/schedule/" + office.id,
      method: "post"
    }).then(res => {
      // console.log('fetcher callback', fetcher)
    })
  }

  function onDelete(data: { id: number }) {
    fetcher.submit({action: 'deleteScheduleItem', ...data}, {
      action: "/schedule/" + office.id,
      method: "post"
    }).then(res => {
      // console.log('fetcher callback', fetcher)
    })
  }

  const scheduleMap = {} as { [key: string]: Schedule[] }

  for (let item of data) {
    if (!scheduleMap[item.schedule.date]) {
      scheduleMap[item.schedule.date] = []
    }
    scheduleMap[item.schedule.date].push(item.schedule as Schedule)
  }


  return <Stack py={10} gap={10}>
    <Group justify="center"><WeekPicker officeId={office.id} dates={dates}/></Group>
    <Calendar  schedule={scheduleMap} settings={settings} dates={dates} office={office} onAdd={onAdd} onDelete={onDelete}/>
  </Stack>


}
