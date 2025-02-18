'use client'
import {users} from "@/database/schema";
import {IconSquare, IconSquareCheck} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import {Loader} from "@mantine/core";
// import {addRole, removeRole} from "@/actions/users";
import type {InferSelectModel} from "drizzle-orm";
import {useFetcher} from "react-router";

export default function UserRole({user, role}: { user: InferSelectModel<typeof users>, role: string }) {


  const [isChecked, setChecked] = useState(user.roles.includes(role));
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
      action: "switchRole",
      userId: user.id.toString(),
      role: role,
      set: set
    }

    fetcher.submit(data, {action: "/users", method: "post"}).then(res => {
      console.log(fetcher)
    })

  }


  if (fetcher.state !== 'idle') {
    return <Loader size={16}/>
  }

  if (user.login == 'admin' && role == 'ADMIN') {
    return <IconSquareCheck  style={{opacity:0.2, cursor: 'not-allowed'}}/>
  }

  return isChecked ?
      <IconSquareCheck onClick={() => handleSwitchRole(false)} style={{cursor: 'pointer'}}/>
      : <IconSquare onClick={() => handleSwitchRole(true)} style={{opacity: 0.2, cursor: 'pointer'}}/>


}
