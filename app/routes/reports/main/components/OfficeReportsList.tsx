import {Button, Container, Group, Stack, Table, Text, Title} from "@mantine/core";
import React from "react";
import {monthFormatterNominative} from "@/lib/common";
import {Link} from "react-router";
import {lpad} from "@/lib/lpad";

export default function OfficeReportsList({officeId,years}: { years: { [key: number]:  [{month:number, visited:number,unvisited:number }] }, officeId: number}) {


  const yearNumbers = Object.keys(years).sort((a:any,b:any)=>b-a) as unknown as number[]


  return <Container my={20}>
    <Group justify="center">
    <Group align="flex-start">
      {yearNumbers.map(year=>
        <Stack key={year}>
          <Title order={1}>{year}</Title>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Tbody>
            <Table.Tr >
              <Table.Th>месяц</Table.Th>
              <Table.Th colSpan={3} ta={"center"}>посетили / записано</Table.Th>
              <Table.Th ta={"center"}>отчёт</Table.Th>
            </Table.Tr>
          {years[year].map(({month,visited,unvisited})=>
            <Table.Tr key={month}>
              <Table.Td>{monthFormatterNominative(month)}</Table.Td>
              <Table.Td ta={"center"}>
                <Group gap={6} justify={"center"}>
                <Text fw={"bold"}>{visited} </Text>

                </Group>
              </Table.Td>
              <Table.Td ta={"center"}>
                <Text >{visited+unvisited}</Text>
              </Table.Td>
              <Table.Td ta={"center"}>
                <Text size={"sm"} c={"dimmed"}>{Math.round(visited/((visited+unvisited)||1)*100)}%</Text>
              </Table.Td>

              <Table.Td ta={"center"}><Button component={Link} to={`/reports/main/${officeId}/${year}-${lpad(month)}`} size={"xs"}>детальный отчёт</Button></Table.Td>
            </Table.Tr>
          )}
            </Table.Tbody>
          </Table>


        </Stack>
    )}
  </Group>
    </Group>

  </Container>

}
