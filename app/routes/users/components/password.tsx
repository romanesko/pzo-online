'use client'
import {users} from "@/database/schema";
import React, {useEffect, useState} from "react";
import {Button, Group, Modal, Stack, TextInput} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
// import { randomBytes } from "crypto";
import {IconLockPlus} from "@tabler/icons-react";
import type {InferSelectModel} from "drizzle-orm";
import {useFetcher} from "react-router";
// import {changePassword} from "@/actions/users";

export default function ChangePassword({user}: { user: InferSelectModel<typeof users> }) {

  const [opened, {open, close}] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('')

  const fetcher = useFetcher();

  async function generateRandomPassword() {
    return fetcher.submit({action: "generateRandomPassword", length:12}, {action: "/users", method: "post"});
  }

  useEffect(() => {
    if (!fetcher.data) return

    if (fetcher.data.error) {
      alert(fetcher.data.error)
      return
    }

    if (fetcher.data.action == 'changePassword') {
      close()
      return
    }

    if (fetcher.data.action == 'generateRandomPassword') {
      setPassword(fetcher.data.password)
      return
    }


  }, [fetcher.data])


  return <>
    <div style={{cursor: 'pointer', opacity: 0.8}} onClick={open}>*****</div>
    <Modal opened={opened} onClose={close} title="Изменение пароля пользователя">

      <Stack mt="lg">
        <fetcher.Form
            method="post" action="/users" onSubmit={(e) => {
          console.log(e)
        }}>
          <input type="hidden" name="action" value="changePassword"/>
          <input type="hidden" name="userId" value={user.id.toString()}/>
          <TextInput
              name="password"
              label="Новый пароль"
              placeholder="password"
              value={password}
              rightSection={<IconLockPlus
                  size={18} style={{cursor: 'pointer'}} color="blue" onClick={() => generateRandomPassword()}/>}
              onChange={(e) => setPassword(e.currentTarget.value)}

          />


          <Group mt="lg" justify="flex-end">
            <Button onClick={close} variant="default">
              Отмена
            </Button>
            <Button loading={loading} type="submit" color="">
              Сохранить
            </Button>
          </Group>
        </fetcher.Form>
      </Stack>
    </Modal>
  </>


}
