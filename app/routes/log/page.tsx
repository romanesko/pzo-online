import {repo} from "@/database/repo";
import {Container, Grid, NativeSelect, Stack, Table, TextInput} from "@mantine/core";
import {session} from "@/lib/SessionStorage";
import type {Route} from "@/types/routes/log/+types/page";
import {parseAndReplace} from "@/routes/log/components/replacer";
import {useFetcher} from "react-router";
import React from "react";


const formattedDate = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false, // Use 24-hour format
});

export async function loader({request, params}: Route.LoaderArgs) {
  await session.userRequireRole(request, 'ADMIN')

  const url = new URL(request.url);
  const filter = url.searchParams.get('filter')
  const userId = url.searchParams.get('user')

  const logs = await repo.log.getLatest(filter,userId?+userId:null,200)

  const users = await repo.users.getAll()

  const outUsers = [{label:'', value:''}] as {label:string, value:string}[]

  for (let user of users) {
    outUsers.push({label:user.name, value:user.id.toString()})
  }

  return {filter,logs, users:outUsers, userId:userId}
}

export default function Page({loaderData}: Route.ComponentProps) {
  const fetcher = useFetcher()

  const {filter,logs,users,userId} = loaderData;

  return <Container py={20}>
    <Stack>


      <form method="get" action="/log">
        <Grid>
          <Grid.Col span={2}>
            <NativeSelect  name="user"
                           label="Пользователь"
                           defaultValue={userId||''}
                           data={users}
                           onChange={(e) => e.target.form?.submit()}
            />
          </Grid.Col>
          <Grid.Col span={10}>
        <TextInput autoFocus label="Фильтр" defaultValue={filter||''} name="filter"/>
          </Grid.Col>
        </Grid>
      </form>
    <Table striped  withTableBorder withColumnBorders >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Когда</Table.Th>
            <Table.Th>Кто</Table.Th>
            <Table.Th>Что</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {logs.map(({users:user,log}) => (
              <Table.Tr key={log.id}>
                <Table.Td style={{whiteSpace: 'nowrap'}}>{formattedDate.format(log.createdAt)}</Table.Td>
                <Table.Td>{user.name}</Table.Td>
                <Table.Td>{parseAndReplace(log.action)}</Table.Td>
              </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  </Container>
}
