import {Button, Container, Stack, Table, Tabs, Text} from "@mantine/core";
import {repo} from "@/database/repo";
import type {Route} from "@/types/routes/records/+types/page";
import {actionWrapper, formatDateFull} from "@/lib/common";
import type {RecordsResponse} from "@/database/repo/booking";
import {useFetcher, useNavigate} from "react-router";
import VisitCheckbox from "@/routes/records/components/VisitCheckbox";


export async function action({request}: Route.ActionArgs) {
  return actionWrapper(request, {
    switchVisit: async (fd) => {
      const bookingId = fd.requireNumber("bookingId");
      return repo.booking.switchVisit(bookingId);
    }
  });
}


export async function loader({request, params}: Route.LoaderArgs) {

  const offices = await repo.offices.getAll()

  const officeId = params.officeId as string

  const groupedByDate = {} as { [key: string]: RecordsResponse[] }

  if (officeId) {
    const records = await repo.booking.findActual(+officeId)
    records.forEach(record => {
      const date = record.schedule.date
      if (!groupedByDate[date]) {
        groupedByDate[date] = [] as RecordsResponse[]
      }
      groupedByDate[date].push(record)
    })
  }

  return {dates: groupedByDate, offices, officeId: officeId}
}


export default function Page({loaderData}: Route.ComponentProps) {


  const {dates, offices, officeId} = loaderData
  const navigate = useNavigate();

  return <Container py={20}>

    <Tabs value={officeId} onChange={(value) => navigate(`/records/${value}`)}>
      <Tabs.List>
        {offices.map((office, i) => (
            <Tabs.Tab key={i} value={office.id.toString()}>
              {office.name}
            </Tabs.Tab>
        ))}
      </Tabs.List>
      {officeId && <Container py={0} px={0}>
        <Stack gap={"xl"} mt={"md"}>
          {Object.keys(dates).map(date => <Stack key={date}>
            <Text size={"xl"}>{formatDateFull(date)}</Text>
            <RecordsTable records={dates[date]}/>

          </Stack>)}

        </Stack>
      </Container>}

    </Tabs>


  </Container>
}


function RecordsTable({records}: { records: RecordsResponse[] }) {

  const fetcher = useFetcher()

  return <Table withTableBorder>
    <Table.Thead>
      <Table.Tr>
        <Table.Th ta="center" w={102}><Text size={"xs"} c={"dimmed"}>Время</Text></Table.Th>
        <Table.Th style={{width: '100%'}}><Text size={"xs"} c={"dimmed"}>Клиент</Text></Table.Th>
        <Table.Th><Text size={"xs"} c={"dimmed"}>Услуга</Text></Table.Th>
        <Table.Th ta="center"><Text size={"xs"} c={"dimmed"}>Посетил</Text></Table.Th>
        <Table.Th ta="center"><Text size={"xs"} c={"dimmed"}>Документы</Text></Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
      {records.map((row: any, idx: number) => (
          <Table.Tr key={idx}>

            <Table.Td ta="center">{row.schedule.startTime}</Table.Td>
            <Table.Td>{row.client.lastName} {row.client.firstName} {row.client.middleName}</Table.Td>
            <Table.Td ta="center">{row.service.name}</Table.Td>
            <Table.Td ta="center"><VisitCheckbox key={row.booking.visitedAt} booking={row.booking}/></Table.Td>
            <Table.Td ta="center">
              <fetcher.Form method="post" action={`/booking/${row.booking.id}/documents`} style={{display: 'inline'}}>
              <Button size={"xs"} type={"submit"} loading={fetcher.state != 'idle'}>документы</Button>
              </fetcher.Form>
              </Table.Td>


          </Table.Tr>
      ))}


    </Table.Tbody>
  </Table>
}
