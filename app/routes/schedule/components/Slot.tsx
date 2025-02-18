import styles from "./calendar.module.css";
import classNames from "classnames";
import {useState} from "react";
import {ActionIcon, Group, NumberInput, Popover, Stack, Text} from "@mantine/core";
import type {ScheduleItemBase} from "@/models";
import type {SlotInfo} from "@/routes/schedule/components/Calendar";
import {useClientSettings} from "@/lib/ClientSettingsContext";
import {IconCheck, IconTrash} from "@tabler/icons-react";


export interface SlotProps {
  item: SlotInfo,
  hourStart: boolean
  width: number
  height: number
  onAdd: (props:ScheduleItemBase)=>void
  onDelete: (props: { id:number })=>void
}

export default function Slot({item, hourStart, width, height, onAdd, onDelete}: SlotProps) {

  const slotClasses = classNames(styles.slot, {
    [styles.used]: item.state === 1,
  });


  const {settings, updateSettings} = useClientSettings()



  const [opened, setOpened] = useState(false);
  const [duration, setDuration] = useState(item.id?item.duration:settings.defaultSlotDuration)
  const [endTime, setEndTime] = useState(item.endTime)


  function openModal(){
    setOpened(true)
    calcEndTime(item.id?item.duration:settings.defaultSlotDuration)
  }

  function calcEndTime(minutes: number) {
    setDuration(minutes)
    const endTime = addMinutesToTime(item.startTime, minutes)
    updateSettings({defaultSlotDuration: minutes})
    setEndTime(endTime)
  }

  function handleSaveClick(){

    const saveItem = { startTime: item.startTime, endTime: endTime, duration: duration}
    onAdd(saveItem)
    setTimeout(() => setOpened(false), 100)

  }

  function handleDeleteClick(){
    if(!item.id){
      alert('ID is missing somehow')
      return
    }
    onDelete({id: item.id})
    setTimeout(() => setOpened(false), 100)
  }



  return <div style={{position: 'relative', width: width}}>

    <div
        onClick={() => openModal()}
        className={styles.slotWrapper} style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: (item.duration / 5) * height - (item.startTime ? 1 : 0),
      display: 'flex',
      zIndex: item.state == 1?20: 10,

    }}>
      <Popover
          opened={opened}
          onChange={setOpened}
          trapFocus position="right" withArrow    shadow="md">
        <Popover.Target>
          <div
              className={slotClasses} style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',


            // opacity: row[item.key].state == 1 ? 1 : 0.5,
            // justifyContent: 'center',
            // alignItems: 'center',
            marginTop: (hourStart ? 1 : 0),
            marginRight: 1,
            marginBottom: (hourStart ? 1 : 0),

            // borderRadius: 0,
            fontSize: 10,
          }}> {item.id ? item.startTime + '-' + item.endTime : item.startTime} </div>
        </Popover.Target>
        <Popover.Dropdown >


            <Stack gap={8}>
              <Text size={"xs"} ta={"center"}>{item.startTime} - {endTime}</Text>
              {item.id ?
              <Group justify="center">


                    <ActionIcon variant="filled" color="red"  aria-label="Delete" onClick={handleDeleteClick}>
                      <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>

              </Group>
                  : <Group gap={8}> <NumberInput
                      style={{width: 55}}
                      value={duration}
                      min={5}
                      step={5}
                      onChange={e => calcEndTime(+e)}
                      name="duration"
                      readOnly={Boolean(item.id)}
                      placeholder="20"
                      size={"xs"}
                      onKeyDown={e => e.key === 'Enter' && handleSaveClick()}
                  />

                    <ActionIcon variant="filled"  aria-label="Ok" onClick={handleSaveClick}>
                      <IconCheck style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>

                  </Group>}
            </Stack>


        </Popover.Dropdown>
      </Popover>


    </div>


  </div>
}


function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + minutesToAdd);
  const newHours = String(date.getHours()).padStart(2, '0');
  const newMinutes = String(date.getMinutes()).padStart(2, '0');
  return `${newHours}:${newMinutes}`;
}
