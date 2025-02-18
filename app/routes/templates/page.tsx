import type {Route} from "../../../.react-router/types/app/routes/+types/home";
import {repo} from "@/database/repo";
import {Container, Text} from "@mantine/core";
import {session} from "@/lib/SessionStorage";


export async function loader({request, params}: Route.LoaderArgs) {
  await session.userRequireRole(request, 'ADMIN')


  const users = await repo.users.getAll()
  const roles = await repo.users.getRoles()

  let selectedClient = null


  return {users, roles}
}

export default function Page({loaderData}: Route.ComponentProps) {
  // const {users, roles} = loaderData;
  return <Container py={20}>
    <Text>Шаблоны: в разработке</Text>
  </Container>
}
