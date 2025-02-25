
import {Card, Container, Grid, Group, Stack, Text} from "@mantine/core";
import React from "react";
import type {Route} from "../+types/home";

import {repo} from "@/database/repo";

import {FormDataWrapper} from "@/lib/common";
import {addOffice, editOffice} from "./actions";

import OfficesList from "@/routes/offices/components/OfficesList";
import AddOffice from "@/routes/offices/components/AddOffice";
import EditOffice from "@/routes/offices/components/EditOffice";
import type {Office} from "@/models";
import {session} from "@/lib/SessionStorage";
// import OfficesList from "@/routes/offices/components/OfficesList";
// import AddOffice from "@/routes/offices/components/AddOffice";
// import OfficeInfo from "@/routes/offices/components/OfficeInfo";


interface OfficesPageProps {
  loaderData: {
    offices: Office[],
    selectedOffice: Office | null

  };
}


export async function action({
                               request,
                             }: Route.ActionArgs) {

  let fd = new FormDataWrapper(await request.formData());

  const action = fd.requireString('action')

  switch (action) {
    case 'addOffice':
      await addOffice(fd)
      break;
    case 'editOffice':
      await editOffice(fd)
      break;
    default:
      throw new Error('unknown action')
  }


  return {'created': 'ok', error: null};
}


export async function loader({request, params}: Route.LoaderArgs) {
  await session.userRequireRole(request, 'ADMIN')
  let url = new URL(request.url);
  let id = url.searchParams.get("id");

  const offices = await repo.offices.getAll()

  let selectedOffice = null

  if (id) {
    selectedOffice = offices.filter(office => office.id == +id)[0]
  }

  console.log(offices, selectedOffice)

  return {offices, selectedOffice}
}



export default function OfficesPage({loaderData}: OfficesPageProps) {

  const {offices, selectedOffice} = loaderData;


  return <Container py={20}>

    <Grid>
      <Grid.Col span={selectedOffice ? 6 : 12}>
        <OfficesList items={offices} selectedOffice={selectedOffice}/>
        <Group py={20} justify="flex-start"><AddOffice/></Group>
      </Grid.Col>

      <Grid.Col span={6}>
        {selectedOffice && <>
          <Stack>
            <Card shadow="sm" radius="md" withBorder>
              <Card.Section
                p={4} px={12} style={{backgroundColor: '#f5f5f5', borderBottom: '1px solid #e5e5e5', fontSize: 13}}>
                <Text size="xs">Редактирование клиники</Text>
              </Card.Section>
              <Card.Section>
                <EditOffice key={selectedOffice.id} office={selectedOffice}/>
              </Card.Section>
            </Card>

          </Stack>
        </>
        }
      </Grid.Col>

    </Grid>


  </Container>
}
