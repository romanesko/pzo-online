import {Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr} from "@mantine/core";
import React from "react";
import {useNavigate} from "react-router";
import type {Office} from "@/models";

interface OfficesListProps {
  items: Office[],
  selectedOffice: Office | null
}

export default function OfficesList({items,selectedOffice}: OfficesListProps) {

  let navigate = useNavigate();




  function handleRowClick(office: Office) {

    if(selectedOffice?.id == office.id){
      navigate(`/offices`)
      return
    }


    navigate(`/offices?id=${office.id}`)
  }

  return <Stack>


    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <TableThead>
        <TableTr>
          {/*<TableTh ta="center" style={{width: 1}}>ID</TableTh>*/}
          <TableTh>Название</TableTh>
          <TableTh>Адрес</TableTh>
          {/*<TableTh>Информация</TableTh>*/}
        </TableTr>
      </TableThead>
      <TableTbody>
        {items.map((office, i) => (
            <TableTr key={office.id} onClick={() => handleRowClick(office)} style={{cursor: 'pointer'}}>
              {/*<TableTd ta="center" >{office.id?.toString()} </TableTd>*/}
              <TableTd>{office.name} </TableTd>
              <TableTd>{office.actualAddress || office.address} </TableTd>
              {/*<TableTd>{office.info} </TableTd>*/}
            </TableTr>
        ))}
      </TableTbody>
    </Table>
  </Stack>
}
