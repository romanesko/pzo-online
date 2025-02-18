import {type Client, clientFields} from "@/models";
import {Alert, Button, Stack, TextInput} from "@mantine/core";
import React, {useEffect} from "react";
import {useFetcher} from "react-router";
import {IconAlertCircle} from "@tabler/icons-react";

export interface ClientAddProps {
  phone: string
  onClientAdded: (client: Client) => any
}

export default function ClientAdd({phone, onClientAdded}: ClientAddProps) {

  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        return
      }
      if (fetcher.data.client){
        onClientAdded(fetcher.data.client)
      }
    }
  }, [fetcher.data])

  return <fetcher.Form  method="post" action="/clients">
    <Stack gap={12}>
      {clientFields.map((field, i) => (
          <TextInput
              required={field.required}
              defaultValue={field.name == 'phoneNumber' ? phone : ''}
              name={field.name} label={field.label} placeholder={field.label} key={field.name}/>
      ))}
      <input type="hidden" name="action" value="addClient"/>
      {fetcher.data && fetcher.data.error && <Alert variant="light" color="red" title="Ошибка" icon={<IconAlertCircle size={16}/>}>
        {fetcher.data.error}
      </Alert>}
      <Button loading={fetcher.state != "idle"} type="submit" mt={20}>Сохранить</Button>
    </Stack>
  </fetcher.Form>
}
