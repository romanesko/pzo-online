import {FormDataWrapper} from "@/lib/common";
import {Alert, Button, Container, Stack, TextInput} from "@mantine/core";
import {redirect, useFetcher} from "react-router";
import React from "react";
import {IconAlertCircle} from "@tabler/icons-react";
import type {Route} from "@/types/routes/login/+types/page";
import {repo} from "@/database/repo";
import {session} from "@/lib/SessionStorage";

export async function loader({ request}: Route.LoaderArgs) {

  const url = new URL(request.url);
  let redirectTo = url.searchParams.get('redirectTo') as string;
  if(!redirectTo){
    redirectTo = '/'
  }

  return {redirectTo}

}


export async function action({request}: Route.ActionArgs) {

  const fd = new FormDataWrapper(await request.formData());

  if (fd.requireString('action') == 'login') {

    let redirectTo = '/'
    let cookie = ''

    try {
      const user = await repo.users.getUserByLoginAndPassword(fd.requireString('login'), fd.requireString('password'))
      if (!user) {
        return {error: 'invalid login or password'}
      }

      redirectTo = fd.requireString('redirectTo')

      const s = await session.getUserSession(request);
      s.set("userId", user.id);
      cookie = await session.saveUserSession(s)

    } catch (e: any) {
      return {error: e.message}
    }


    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } else {
    const s = await session.getUserSession(request);
    s.set("userId", null);
    const cookie = await session.saveUserSession(s)

    return redirect('/login', {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  }




}


export default function Page({loaderData}: Route.ComponentProps) {

  const {redirectTo} = loaderData

  const fetcher = useFetcher()

  return <Container size={300} py={20}>


    <fetcher.Form method="post" action="/login">
      <input type="hidden" name="action" value="login"/>
      <input type="hidden" name="redirectTo" value={redirectTo}/>
      <Stack>

        <TextInput name="login" label="Логин" defaultValue={'admin'}/>
        <TextInput type="password" name="password" label="Пароль" defaultValue={'admin'}/>
        <Button type="submit">Войти</Button>
      </Stack>
    </fetcher.Form>

    {fetcher.data?.error &&
      <Alert mt={20} variant="light" color="red" title="Ошибка" icon={<IconAlertCircle size={16}/>}>
        {fetcher.data.error}
      </Alert>}
  </Container>
}
