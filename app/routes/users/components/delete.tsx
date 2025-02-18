'use client'
import {users} from "@/database/schema";
import {IconTrash} from "@tabler/icons-react";
import React, {useEffect, useState} from "react";
import {Button, Group, Modal} from "@mantine/core";
// import {addRole, deleteUser, removeRole} from "@/actions/users";
import {useDisclosure} from "@mantine/hooks";
import type {InferSelectModel} from "drizzle-orm";
import {useFetcher} from "react-router";

export default function DeleteUser({user}: { user: InferSelectModel<typeof users> }) {

  const [opened, {open, close}] = useDisclosure(false);
  const [loading, setLoading] = useState(false)
  // const router = useRouter()

  const fetcher = useFetcher();

  useEffect(() => {
    if (!fetcher.data) return

    if (fetcher.data.error) {
      alert(fetcher.data.error)
      return
    }

    close()
  }, [fetcher.data])



  if (user.login == 'admin') {
    return <IconTrash  style={{cursor: 'not-allowed', opacity: 0.2}} size={16} />
  }


  return <>
    <IconTrash onClick={open} style={{cursor: 'pointer', opacity: 0.7}} size={16} />
    <Modal opened={opened} onClose={close} title="Подтвердите действие">
      Пользователь будет удалён без возможности восстановления. Однако все данные в логах о его действиях будут
      сохранены.
      <Group mt="lg" justify="flex-end">
        <Button onClick={close} variant="default">
          Отмена
        </Button>
        <fetcher.Form
            method="post" action="/users" onSubmit={() => {
          close()
        }}>
          <input type="hidden" name="userId" value={user.id.toString()}/>
          <input type="hidden" name="action" value="deleteUser"/>
          <Button loading={fetcher.state != 'idle'} type="submit" color="red">
            Удалить
          </Button>
        </fetcher.Form>
      </Group>
    </Modal>
  </>


}
