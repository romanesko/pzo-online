import {Container, Table} from "@mantine/core";
import type {Route} from "@/types/routes/settings/+types/page";
import type {Settings} from "@/models";
import {settingsRepo} from "@/database/repo/settings";
import {actionWrapper, FormDataWrapper} from "@/lib/common";
import {session} from "@/lib/SessionStorage";
import {useFetcher} from "react-router";
import {useEffect} from "react";
import {alertError} from "@/lib/notify";


const labels = {
  FIRST_SLOT: 'Время первого слота (HH:MM)',
  LAST_SLOT: 'Время последнего слота (HH:MM)',
  // SLOT_STEP: 'Интервал между слотами (минут)',
  DEFAULT_CALENDAR_DAYS: 'Количество дней в календаре по умолчанию'
} as {[key in keyof Settings]:string}

const validators = {
  FIRST_SLOT: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  LAST_SLOT: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  // SLOT_STEP: /^\d+$/,
  DEFAULT_CALENDAR_DAYS: /^\d+$/
} as {[key in keyof Settings]: RegExp}


export async function action({request}: Route.ActionArgs) {
  return actionWrapper(request, {
    save: async (fd: FormDataWrapper, request: Request) => {
      await session.userRequireRole(request, ['ADMIN'])
      const key = fd.requireString('key') as keyof Settings
      const val = fd.requireString('value')

      const validator = validators[key]

      if(!validator.test(val)){
        throw new Error('Неверное значение')
      }

      const settings  =await settingsRepo.get()
      // @ts-ignore
      settings[key] = val
      await settingsRepo.set(settings)
    },
  })
}

export async function loader({request}: Route.LoaderArgs) {
  await session.userRequireRole(request, ['ADMIN'])
  const settings  =await settingsRepo.get()
  return {settings}
}


export default function Page({loaderData}: Route.ComponentProps){

  const {settings} = loaderData

  const fetcher = useFetcher()

  function handleClick(key: keyof Settings){
    const val = prompt(labels[key], settings[key].toString())
    if(!val){
      return
    }

    fetcher.submit({action: 'save', key: key, value: val}, { method: 'post'})
  }

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        alertError(fetcher.data.error)
        return
      }

    }
  },[fetcher.data])

  return <Container my={"sm"}>

    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Название</Table.Th>
          <Table.Th>Значение</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {Object.keys(settings).filter(key=>labels[key as keyof Settings]).map((key: string, i) => (
            <Table.Tr key={i}>
              <Table.Td>{labels[key as keyof Settings]}</Table.Td>
              <Table.Td style={{cursor:'pointer'}} onClick={()=>handleClick(key as keyof Settings)}>{settings[key as keyof Settings]}</Table.Td>
            </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>


  </Container>
}
