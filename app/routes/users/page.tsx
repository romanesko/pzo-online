import React from "react";
import {Container, Grid, Group, Table, TableTbody, TableTh, TableThead, TableTr} from "@mantine/core";
import {repo} from "@/database/repo";
import TableRow from "./components/table-row";
import AddUser from "./components/add-user";
import {
  changePassword,
  createUser,
  deleteUser,
  generateRandomPassword,
  switchRole,
  switchUserActive
} from "@/routes/users/actions";
import {actionWrapper} from "@/lib/common";
import type {Route} from "@/types/routes/users/+types/page";

// import {getRoles} from "@/actions/users";




export async function action({request,}: Route.ActionArgs) {
  return actionWrapper(request, {
    createUser,
    switchRole,
    switchUserActive,
    deleteUser,
    changePassword,
    generateRandomPassword

  })
}
export async function loader({request, params}: Route.LoaderArgs) {
  console.log('LOADER')

  console.log('loading users')

  const users = await repo.users.getAll()
  const roles = await repo.users.getRoles()

  return {users, roles}
}

export default function Page({loaderData}: Route.ComponentProps) {


  const {users, roles} = loaderData;


  return (
      <Container py={20}>
        <Grid>
          <Grid.Col span={12}>

        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <TableThead>
            <TableTr>
              <TableTh style={{width: '100%'}}>Имя</TableTh>
              <TableTh>Логин</TableTh>
              <TableTh>Пароль</TableTh>
              {roles.map((role, i) => (
                  <TableTh key={i} style={{minWidth: 60, fontSize: 10, textAlign: 'center', lineHeight: '1.2em'}} p={4}>
                    <div style={{opacity: 0.5}}>роль:</div>
                    {role.value}</TableTh>
              ))}
              <TableTh style={{width: 1, textAlign: 'center'}}>Активен</TableTh>
              <TableTh style={{width: 1, textAlign: 'center'}}>×</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {users.map((user, i) => (
                <TableRow roles={roles} key={i} user={user}/>
            ))}
          </TableTbody>
        </Table>

        <Group py={20} justify="flex-end">
          <AddUser roles={roles}/>
        </Group>

          </Grid.Col>
        </Grid>

      </Container>
  )
}


