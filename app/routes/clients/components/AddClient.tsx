'use client'

import {Button, Modal, Stack, TextInput} from "@mantine/core";

import {useDisclosure} from "@mantine/hooks";
import React, {useState} from "react";
import {useFetcher} from "react-router";
import {clientFields} from "@/models";
// import {useRouter} from "next/navigation";
// import {createClient} from "@/actions/clients";


export default function AddClient() {

  const [opened, {open, close}] = useDisclosure(false);
  const [loading, setLoading] = useState(false)
  let fetcher = useFetcher();




  //
  // const {data: usrRoles} = useSWR('userRoles', async () => {
  //   return await getRoles()
  // })




  function showModal() {
    open()
  }

  return <>
    <Button onClick={open}>Новый клиент</Button>
    <Modal opened={opened} onClose={close} title="Новый клиент">
      <fetcher.Form
          method="post" action="/clients" onSubmit={() => {
        close()
      }}>


        <Stack gap={12}>
          {clientFields.map((field, i) => (
              <TextInput
                  required={field.required}
                  name={field.name}
                  label={field.label}
                  placeholder={field.label}
                  key={field.name} />
          ))}

          <input type="hidden" name="action" value="addClient"/>
          <Button loading={loading} type="submit" mt={20}>Сохранить</Button>
        </Stack>
      </fetcher.Form>
    </Modal>
  </>
}
