import {ActionIcon, Button, Group, Stack, TextInput} from "@mantine/core";
import {useEffect, useState} from "react";
import {IconEdit, IconEye} from "@tabler/icons-react";
import {useFetcher} from "react-router";
import {type Client, clientFields} from "@/models";


interface EditClientOptions{
  readOnly: boolean,
  showPersonalData: boolean
}


export default function EditClient({client, opts}: { client: Client, opts?: EditClientOptions }) {

  let fetcher = useFetcher();

  const [readOnly, setReadOnly] = useState(opts != undefined? opts.readOnly : true);
  const [showPersonalData, setShowPersonalData] = useState(opts != undefined ? opts.showPersonalData : false);

  const variant = readOnly ? 'unstyled' : 'default';


  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.error){
      alert(fetcher.data.error)
      } else {
        setReadOnly(true)
      }
    }
  }, [fetcher.state])


  return <div style={{position: 'relative'}}>



    <fetcher.Form
        method="post" action="/clients" onSubmit={() => {}}>

      <Stack gap={readOnly ? 4 : 8} p="md">
        <input type="hidden" name="id" value={client.id?.toString()}/>
        <input type="hidden" name="action" value="editClient"/>

        {clientFields.map((field, i) => (
            (showPersonalData || !field.hidden) &&
            (client[field.name]?.toString() || !readOnly) &&
            <TextInput
                key={field.name}
                name={field.name}
                readOnly={readOnly}
                description={field.label}
                variant={variant}
                required={field.required}
                defaultValue={client[field.name]?.toString()}/>
        ))}



        {!readOnly &&
          <Group pt={8} justify="flex-start">

            <Button type="submit" size="xs" loading={fetcher.state !== "idle"}>Сохранить</Button>
          </Group>}
      </Stack>

    </fetcher.Form>


    <div style={{position: 'absolute', top: 4, right: 4}}>
      <Group gap={0}>
        <ActionIcon
            color={showPersonalData ? '' : 'gray'}
            variant="subtle"
            aria-label="show personal data"
            onClick={() => setShowPersonalData(!showPersonalData)}>
          <IconEye style={{width: '70%', height: '70%'}} stroke={1.5}/>
        </ActionIcon>

        <ActionIcon
            color={!readOnly ? '' : 'gray'}
            variant="subtle"
            aria-label="Edit"
            onClick={() => setReadOnly(!readOnly)}>
          <IconEdit style={{width: '70%', height: '70%'}} stroke={1.5}/>
        </ActionIcon>
      </Group>
    </div>


  </div>
}
