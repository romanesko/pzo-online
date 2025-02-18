import {ActionIcon, Button, Group, Stack, Textarea, TextInput} from "@mantine/core";
import {useFetcher, useNavigate} from "react-router";
import {type Office, officeFields} from "@/models";


export default function EditOffice({office}: { office: Office }) {

  let fetcher = useFetcher();

  const navigate = useNavigate();

  const variant = 'default'

  function removeOffice(){
    alert('Not implemented')
  }

  // const buttons = [{label:'delete', icon: <IconTrash stroke={1.5} style={{width: '70%', height: '70%'}}/>, action: () => removeOffice()}]
  const buttons = [] as {label: string, icon: any, action: () => void}[]

  return <div style={{position: 'relative'}}>


    {/* Content here */}

    <fetcher.Form
        method="post" action="/offices" onSubmit={() => {
          navigate('/offices')
    }}>

      <Stack gap={ 8} p="md">
        <input type="hidden" name="id" value={office.id?.toString()}/>
        <input type="hidden" name="action" value="editOffice"/>

        {officeFields.map((field,idx) => field.multiline?
            <Textarea
                key={idx} resize="vertical"
                required={field.required} name={field.name} description={field
                .label} variant={variant} defaultValue={office[field.name]?.toString()}/>
            :
            <TextInput
            key={idx}
            required={field.required} name={field.name} description={field
            .label} variant={variant} defaultValue={office[field.name]?.toString()}/>)}




          <Group pt={8} justify="flex-start">

            <Button type="submit" size="xs">Сохранить</Button>
          </Group>
      </Stack>

    </fetcher.Form>


    <div style={{position: 'absolute', top: 4, right: 4}}>
      <Group gap={0}>
        {buttons.map((btn,idx) => <ActionIcon
            color={'gray'}
            variant="subtle"
            aria-label={btn.label}
            onClick={btn.action}>
          {btn.icon}
        </ActionIcon>)}
      </Group>
    </div>


  </div>
}
