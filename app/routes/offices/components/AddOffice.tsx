'use client'

import {Button, Modal, Stack, TextInput} from "@mantine/core";

import {useDisclosure} from "@mantine/hooks";
import React, {useState} from "react";
import {useFetcher} from "react-router";
import {officeFields} from "@/models";
// import {useRouter} from "next/navigation";
// import {createClient} from "@/actions/clients";


export default function AddOffice() {

  const [opened, {open, close}] = useDisclosure(false);
  const [loading, setLoading] = useState(false)
  let fetcher = useFetcher();






  const fields = [
    {label: 'Название', key: 'name', required: true},
    {label: 'Информация', key: 'info', required: true},
  ]



  function showModal() {
    open()
  }

  return <>
    <Button onClick={open}>Новая клиника</Button>
    <Modal opened={opened} onClose={close} title="Новая клиника">
      <fetcher.Form
          method="post" action="/offices" onSubmit={() => {
        close()
      }}>


        <Stack gap={12}>
          {officeFields.map((field, i) => (
              <TextInput
                  required={field.required}
                  name={field.name}
                  label={field.label}
                  placeholder={field.label}
                  key={field.name}
              />
          ))}

          <input type="hidden" name="action" value="addOffice"/>
          <Button loading={loading} type="submit" mt={20}>Сохранить</Button>
        </Stack>
      </fetcher.Form>
    </Modal>
  </>
}
