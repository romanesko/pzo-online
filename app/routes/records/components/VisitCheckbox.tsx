'use client'
import {IconSquare, IconSquareCheck} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import {Group, Loader} from "@mantine/core";
// import {addRole, removeRole} from "@/actions/users";
import {useFetcher} from "react-router";
import type {Booking} from "@/models";

export default function VisitCheckbox({booking, }: { booking: Booking }) {


  const [isChecked, setChecked] = useState(Boolean(booking.visitedAt)); // add original state
  const fetcher = useFetcher();

  useEffect(() => {
    if (!fetcher.data) return

    if (fetcher.data.error) {
      alert(fetcher.data.error)
      return
    }

    setChecked(fetcher.data.set)


  }, [fetcher.data])


  async function handleSwitchRole(set: boolean) {
    const data = {
      action: "switchVisit",
      bookingId: booking.id,
    }

    fetcher.submit(data, { method: "post"}).then(res => {
      console.log(fetcher)
    })

  }


  if (fetcher.state !== 'idle') {
    return <Loader size={16}/>
  }


  return <Group justify="center">{isChecked ?
      <IconSquareCheck onClick={() => handleSwitchRole(false)} style={{cursor: 'pointer'}}/>
      : <IconSquare onClick={() => handleSwitchRole(true)} style={{opacity: 0.2, cursor: 'pointer'}}/>
  }
  </Group>


}
