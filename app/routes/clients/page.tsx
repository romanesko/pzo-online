import {Card, Container, Grid, Group, Stack, Text} from "@mantine/core";

import React from "react";
import type {Route} from "../+types/home";

import {repo} from "@/database/repo";

import {actionWrapper} from "@/lib/common";
import EditClient from "./components/EditClient";
import {addClient, editClient} from "@/routes/clients/actions";

import type {Client, ScheduleItemCombined} from "@/models";
import ClientsList from "@/routes/clients/components/ClientsList";
import ClientRecords from "@/routes/clients/components/ClientRecords";
import AddClient from "@/routes/clients/components/AddClient";
import {session} from "@/lib/SessionStorage";


interface ClientsPageProps {
  loaderData: {
    clients: Client[],
    selectedClient: Client | null
    bookings: ScheduleItemCombined[]

  };
}


export async function action({request,}: Route.ActionArgs) {
  return actionWrapper(request, {
    addClient: addClient,
    editClient: editClient
  })

}

export async function loader({request, params}: Route.LoaderArgs) {
  await session.userRequireRole(request, 'OPERATOR')

  let url = new URL(request.url);
  let id = url.searchParams.get("id");

  const clients = await repo.clients.getAll()
  let bookings = [] as ScheduleItemCombined[]

  let selectedClient = null

  if (id) {
    selectedClient = clients.filter(client => client.id == +id)[0]
    bookings = await repo.booking.findByClient(selectedClient.id)



  }


  return {clients, selectedClient, bookings}
}


export default function ClientsPage({loaderData}: ClientsPageProps) {

  const {clients, selectedClient, bookings} = loaderData;


  return <Container py={20}>

    <Grid>
      <Grid.Col span={selectedClient ? 7 : 12}>
        <ClientsList items={clients} selectedClient={selectedClient}/>
        <Group py={20} justify="flex-start"><AddClient/></Group>
      </Grid.Col>

      <Grid.Col span={5}>
        {selectedClient && <>
          <Stack>
            <Card shadow="sm" radius="md" withBorder>
              <Card.Section
                p={4} px={12} style={{backgroundColor: '#f5f5f5', borderBottom: '1px solid #e5e5e5', fontSize: 13}}>
                <Text size="xs">Общая информация о клиенте</Text>
              </Card.Section>
              <Card.Section>
                <EditClient key={selectedClient.id} clientId={selectedClient.id} optimistic={selectedClient}/>
              </Card.Section>
            </Card>

            <Card shadow="sm" radius="md" withBorder>
              <Card.Section
                p={4} px={12} style={{backgroundColor: '#f5f5f5', borderBottom: '1px solid #e5e5e5', fontSize: 13}}>
                <Text size="xs">Записи клиента</Text>
              </Card.Section>
              <Stack mt="md" mb="xs">
                <ClientRecords key={selectedClient.id} client={selectedClient} bookings={bookings}/>
              </Stack>

            </Card>
          </Stack>
        </>
        }
      </Grid.Col>

    </Grid>


  </Container>
}
