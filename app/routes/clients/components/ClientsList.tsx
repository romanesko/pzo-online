import {CloseButton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, TextInput} from "@mantine/core";
import React from "react";
import {useNavigate} from "react-router";
import type {Client} from "@/models";
import {prettyPrintPhone} from "@/lib/common";

export default function ClientsList({items, selectedClient}: { items: Client[], selectedClient: Client | null }) {

  let navigate = useNavigate();
  const [filter, setFilter] = React.useState('');

  const filteredItems = items.filter(client => {
    if(!filter) return true

    return client.lastName?.toLowerCase().includes(filter.toLowerCase()) ||
        client.firstName?.toLowerCase().includes(filter.toLowerCase()) ||
        client.middleName?.toLowerCase().includes(filter.toLowerCase()) ||
        client.phoneNumber?.toLowerCase().includes(filter.toLowerCase())
  })


  function handleRowClick(client: Client) {

    if(selectedClient?.id === client.id) {
      navigate(`/clients`)
      return
    }

    navigate(`/clients?id=${client.id}`)
  }

  return <Stack>
    <TextInput placeholder="Поиск" style={{width: '100%'}}
                value={filter}
               rightSection={
                 <CloseButton
                     aria-label="Clear input"
                     onClick={() => setFilter('')}
                     style={{ display: filter ? undefined : 'none' }}
                 />
               }
               onChange={(e) => setFilter(e.target.value)}/>

    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <TableThead>
        <TableTr>
          <TableTh>Фамилия</TableTh>
          <TableTh>Имя</TableTh>
          <TableTh>Отчество</TableTh>
          <TableTh>Телефон</TableTh>
        </TableTr>
      </TableThead>
      <TableTbody>
        {filteredItems.map((client, i) => (
            <TableTr key={client.id} onClick={() => handleRowClick(client)} style={{cursor: 'pointer'}}>
              <TableTd>{client.lastName} </TableTd>
              <TableTd>{client.firstName} </TableTd>
              <TableTd>{client.middleName} </TableTd>
              <TableTd>{prettyPrintPhone(client.phoneNumber)} </TableTd>
            </TableTr>
        ))}
      </TableTbody>
    </Table>
  </Stack>
}
