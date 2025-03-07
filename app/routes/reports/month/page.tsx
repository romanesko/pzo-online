import {Container, Table, Title, Text, Group, Button} from "@mantine/core";
import type {Route} from "@/types/routes/reports/month/+types/page";
import {session} from "@/lib/SessionStorage";
import {repo} from "@/database/repo";
import React from "react";
import {formatDateFull, monthFormatterNominative} from "@/lib/common";

interface ReportItem{
  date: string,
  serviceId: number,
  count: number
}

export async function loader({request,params}: Route.LoaderArgs) {
  await session.userRequireRole(request, ['ADMIN'])
  const offices = await repo.offices.getAll()

  const officeId = +params.officeId!
  const date = params.date!

  const year =  +date.split('-')[0]
  const month = +date.split('-')[1]

  const office = await repo.offices.getById(officeId)
  const report : ReportItem[]= await repo.reports.getStatByOfficeAndMonth(officeId,year, month) as any

  const services = await repo.services.getAll()
  const serviceMap = {} as { [key: number]: string }
  for (let service of services) {
    serviceMap[service.id] = service.name
  }

  const serviceKeys = Object.keys(serviceMap) as unknown as number[]

  const totalsByService = {} as { [key: number]: number }
  for (let service of services) {
    totalsByService[service.id] = 0
  }

  const datesMap = {} as { [key: string]: {services: { [key: number]: number }, total:number} }



  for (let item of report) {
    if (!datesMap[item.date]) datesMap[item.date] = {services: {  }, total:0}
    datesMap[item.date]['services'][item.serviceId] = item.count
    datesMap[item.date]['total'] += item.count
  }




  for (let date of Object.keys(datesMap)) {
    for (let serviceId of serviceKeys){
      if(!datesMap[date]['services'][serviceId]){
        datesMap[date]['services'][serviceId] = 0
      }
      totalsByService[serviceId] += datesMap[date]['services'][serviceId]
    }

  }

  const dates = Object.keys(datesMap)
  const today = new Date()
  return {office, datesMap, dates,serviceKeys,serviceMap, totalsByService,  year, month,today}
}


export default function Page({loaderData}: Route.ComponentProps) {

  let {datesMap, dates, serviceKeys,serviceMap,totalsByService,office, year,month,today} = loaderData



  return <Container py={20}>
    <Title order={2} mb={10}>Отчёт за {monthFormatterNominative(month)} {year}</Title>
    <Title order={2} mb={10}>{office.name}</Title>
    <Text mb={10} size={"xs"}>сформирован {new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(today)}</Text>
    <Group justify={"center"}>
    <Table  withTableBorder  withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Дата</Table.Th>
          {serviceKeys.map((key,i)=><Table.Th ta={"center"} key={i}>{serviceMap[key]}</Table.Th>)}
          <Table.Th ta={"center"}>Всего обследований</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {dates.map((date: string) => (
            <Table.Tr key={date}>
              <Table.Td>{date}</Table.Td>
              {serviceKeys.map((serviceId,i)=><Table.Td ta={"center"} key={i}>{datesMap[date]['services'][serviceId]}</Table.Td>)}
              <Table.Td ta={"center"}>{datesMap[date].total}</Table.Td>
            </Table.Tr>
        ))}

        <Table.Tr>
          <Table.Td  fw={"bold"}>Итого за месяц:</Table.Td>
          {serviceKeys.map((serviceId,i)=><Table.Td  fw={"bold"} ta={"center"} key={i}>{totalsByService[serviceId]}</Table.Td>)}
          <Table.Td fw={"bold"} ta={"center"}>{serviceKeys.reduce((acc,cur)=>totalsByService[cur]+acc,0)} </Table.Td>
        </Table.Tr>


      </Table.Tbody>

    </Table>
    </Group>

    <div className={"no-print"}>
    <Group  mt={20} justify={"flex-end"} >
      <Button onClick={()=>print()}>Распечатать</Button>
    </Group>
    </div>




  </Container>
}
