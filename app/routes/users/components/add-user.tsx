import {Alert, Button, Checkbox, Group, Input, Modal, Stack, TextInput} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

import React, {useEffect, useState} from "react";
import {useFetcher} from "react-router";
import {IconAlertCircle} from "@tabler/icons-react";

export default function AddUser({roles: usrRoles}: { roles: { key: string, value: string }[] }) {

  const [opened, {open, close}] = useDisclosure(false);
  const [loading, setLoading] = useState(false)
  const fetcher = useFetcher();


  function showModal() {
    open()
  }

  useEffect(() => {
    if (fetcher.data) {
      if (!fetcher.data.error) {
        close()
      }
    }
  }, [fetcher.data])


  if (!usrRoles) {
    return <div>Loading...</div>
  }

  return <>
    <Button onClick={showModal}>Новый пользователь</Button>
    <Modal opened={opened} onClose={close} title="Добавить нового пользователя">
      <fetcher.Form
          method="post" action="/users" >
        <input type="hidden" name="action" value="createUser"/>
        <Stack gap={12}>
          <TextInput
              required label="Логин" placeholder="1234" name="login"
              // defaultValue={'login'}
          />
          <TextInput
              required
              label="Пароль"
              placeholder="password"
              name="password"
              // defaultValue={'password'}
          />

          <TextInput
              required
              label="Полное имя"
              placeholder="Иван Иванов"
              name={"name"}
              // defaultValue={'name'}
          />


          <Input.Wrapper label="Роли">
            <Group>
              {usrRoles.filter(role=>role.key!='ADMIN').map((item, i) => (
                  <Checkbox
                      mt={2} mb={4} label={item.value} key={item.key}
                      name={"role"}
                      value={item.key}
                  />
              ))}
            </Group>
          </Input.Wrapper>

          <Button loading={loading} type="submit" mt={20}>Сохранить</Button>

          {fetcher.data && fetcher.data.error && <Alert variant="light" color="red" title="Ошибка" icon={<IconAlertCircle size={16}/>}>
            {fetcher.data.error}
          </Alert>}
        </Stack>
      </fetcher.Form>
    </Modal>
  </>
}
