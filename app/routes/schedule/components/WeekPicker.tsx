import React, {useEffect, useState} from 'react';
import {Calendar} from '@mantine/dates';
import dayjs from 'dayjs';
import {useNavigate} from "react-router";
import {formatDate} from "@/lib/common";
import {useDisclosure} from "@mantine/hooks";
import {Button, Modal} from "@mantine/core";

function getDay(date: Date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function realStartOfWeek(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - getDay(date) );
}


function startOfWeek(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - getDay(date) - 1);
}

function endOfWeek(date: Date) {
  return dayjs(new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - getDay(date))))
      .endOf('date')
      .toDate();
}

function isInWeekRange(date: Date, value: Date | null) {
  return value
      ? dayjs(date).isBefore(endOfWeek(value)) && dayjs(date).isAfter(startOfWeek(value))
      : false;
}


export function WeekPicker({dates, officeId} :{dates: string[], officeId:number}) {

  const navigate = useNavigate()

  const [hovered, setHovered] = useState<Date | null>(null);
  const [value, setValue] = useState<Date | null>(new Date(dates[0]));

  const [opened, { open, close }] = useDisclosure(false);


  useEffect(() => {
    if(!value){
      return
    }

    const date = formatDate(realStartOfWeek(value))

    navigate(`/schedule/${officeId}?date=${date}`)
    close()


  }, [value])

  return (<>
        <Modal opened={opened} onClose={close} size="auto" title="Выберите дату">
          <Calendar
              firstDayOfWeek={1}
              withCellSpacing={false} getDayProps={(date) => {
            const isHovered = isInWeekRange(date, hovered);
            const isSelected = isInWeekRange(date, value);
            const isInRange = isHovered || isSelected;
            return {
              onMouseEnter: () => setHovered(date),
              onMouseLeave: () => setHovered(null),
              inRange: isInRange,
              firstInRange: isInRange && date.getDay() === 1,
              lastInRange: isInRange && date.getDay() === 0,
              selected: isSelected,
              onClick: () => setValue(date),
            };
          }}/>
        </Modal>

        <Button variant="transparent" size={"xs"} onClick={open}>
          {dates[0]} — {dates[dates.length - 1]}
        </Button>

        </>
  );
}


