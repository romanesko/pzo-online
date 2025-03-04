import {Switch} from "@mantine/core";
import React, {useEffect} from "react";
import type {User} from "@/models";
import {useFetcher} from "react-router";
import {alertError} from "@/lib/notify";

export default function ActiveSwitch({user}: { user: User }) {

  const fetcher = useFetcher();
  const [value, setValue] = React.useState(user.isActive)

  useEffect(() => {
    if (!fetcher.data) return
    if (fetcher.data.error) {
      alertError(fetcher.data.error)
      setValue(user.isActive)
      return
    }

  }, [fetcher.data])
  return <fetcher.Form
      method="post" action="/users">
    <input type="hidden" name="userId" value={user.id.toString()}/>
    <input type="hidden" name="action" value="switchUserActive"/>

    <Switch disabled={user.name=='admin'}
        checked={value}
        onChange={(e) => {
          setValue(e.currentTarget.checked);
          fetcher.submit(e.currentTarget.form)
        }}
         name="value" />
  </fetcher.Form>

}
