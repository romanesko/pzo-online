import {ActionIcon, Container, Group, Stack, Table} from "@mantine/core";
import {session} from "@/lib/SessionStorage";
import type {Route} from "@/types/routes/reports/records/+types/page";
import {repo} from "@/database/repo";
import {formatDate} from "@/lib/common";
import React from "react";
import RangeCalendar from "@/routes/reports/records/components/RangeCalendar";
import {IconDownload} from "@tabler/icons-react";
import { mkConfig, generateCsv, download } from 'export-to-csv';

function total(group: { [key: string]: { date: string; add: number; cancel: number; }; }, action: 'add' | 'cancel') {
  if (!group) {
    return 0
  }
  const vals = Object.values(group).map(item => {
    if (item[action]) {
      return item[action]
    }
    return 0
  }).reduce((acc, cur) => acc + cur, 0)
  return vals || 0
}

export async function loader({request, params}: Route.LoaderArgs) {
  await session.userRequireRole(request, ['ADMIN', 'SUPEROPERATOR'])

  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let startDate =new Date(Date.UTC(year, month - 1, 1));
  let endDate = new Date(Date.UTC(year, month, -1))


  let url = new URL(request.url);
  let fromStr = url.searchParams.get("from");
  let toStr = url.searchParams.get("to");

  if (fromStr) {
    const from = new Date(fromStr + 'Z');
    if (isNaN(from.getTime())) {
      throw new Error('invalid from date')
    }
    startDate = from;
  }

  if (toStr) {
    const to = new Date(toStr + 'Z');
    if (isNaN(to.getTime())) {
      throw new Error('invalid to date')
    }
    endDate = to;
  }



  const currentDate = new Date(startDate);

  if (endDate < startDate) {
    throw new Error('end date is before start date')
  }

  const dates = []

  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate))
    currentDate.setDate(currentDate.getDate() + 1); // Increment the date by 1
  }

  const records = await repo.reports.getActivityReport(startDate, endDate)


  const group = {} as { [key: number]: { [key: string]: { date: string, add: number, cancel: number } } }

  const offices = await repo.offices.getAll()

  for (let item of records) {

    const office = item.parsedAction.office
    if (!group[office.id]) {
      group[office.id] = {}
    }

    const date = item.createdAt.substring(0, 10)

    if (!group[office.id][date]) {
      group[office.id][date] = {
        date: date,
        add: 0,
        cancel: 0
      }
    }

    const action = item.parsedAction.action.id
    if (action == 'ADD') {
      group[office.id][date].add++
    } else if (action == 'CANCEL') {
      group[office.id][date].cancel++
    }
  }



  const headerRow = ['Дата']
  for (let office of offices) {
    headerRow.push(office.name)
  }

  const bodyRows = [] as any[][]
  for (let date of dates) {
    const row = [date] as any[]
    for (let office of offices) {
      row.push(group[office.id]?.[date]?.add)
    }
    bodyRows.push(row)
  }


  const footerRow = [
    'итого:'
  ] as any
  for (let office of offices) {
    footerRow.push(total(group[office.id], 'add'))
  }


  return {offices, dates, startDate: formatDate(startDate), endDate: formatDate(endDate), headerRow, bodyRows, footerRow}
}

export default function Page({loaderData}: Route.ComponentProps) {

  const {startDate, endDate, headerRow, bodyRows, footerRow} = loaderData

  const td = {padding: 2, fontWeight: 'normal'}
  const footerTd = {padding: 2, fontWeight: 'bold'}


  function handleDownloadClick(){
    const csvConfig = mkConfig({
      fieldSeparator: ',',
      quoteStrings: true,
      decimalSeparator: '.',
      useKeysAsHeaders: true,
      filename: `${startDate}_${endDate}`,
      showColumnHeaders:true,
    });

    bodyRows.push(footerRow)

    const csvData = bodyRows.map((row) =>
        Object.fromEntries(row.map((value, i) => [headerRow[i], value]))
    );

    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  }


  return <Container py={20}>

    <Stack>

      <Group justify="space-between">


        <RangeCalendar firstDate={startDate} lastDate={endDate}/>
        <ActionIcon variant="transparent"  onClick={()=>handleDownloadClick()}>
          <IconDownload size={16}/>
        </ActionIcon>
      </Group>


      <Table withTableBorder withColumnBorders striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            {headerRow.map((col, i) => <Table.Th ta={"center"} key={i}>{col}</Table.Th>)}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bodyRows.map((row: any[], i) => (
              <Table.Tr key={i}>
                {row.map((col, i) =>
                    <Table.Td key={i} style={td} ta={"center"}>{col}</Table.Td>
                )}
              </Table.Tr>
          ))}

          <Table.Tr>
            {footerRow.map((col: any[], i:number) =>
                <Table.Td key={i} style={footerTd} ta={"center"}>{col}</Table.Td>
            )}
          </Table.Tr>

        </Table.Tbody>


      </Table>
    </Stack>


  </Container>
}
