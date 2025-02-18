import type {Client} from "@/models";
import {Alert, Button, Table, TextInput} from "@mantine/core";
import {useEffect, useState} from "react";
import {IconAlertCircle} from "@tabler/icons-react";
import {phonePrefixes} from "@/lib/phone-prefixes";
import {prettyPrintPhone} from "@/lib/common";
import {useFetcher} from "react-router";

const MIN_PHONE_LENGTH = 2

interface ClientSearchProps {
  onFound: (client: Client) => any
  onNotFound: (client: { phone: string }) => any
}

function splitPhoneNumber(phoneNumber: string): [string, string] | null {
  for (const prefix of phonePrefixes) {
    if (phoneNumber.startsWith(prefix)) {
      return [prefix, phoneNumber.slice(prefix.length)];
    }
  }
  return null;
}


export default function ClientSearch({onFound, onNotFound}: ClientSearchProps) {


  const [phonePrefix, setPhonePrefix] = useState('+7')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [suggestedClients, setSuggestedClients] = useState<Client[]>([])
  const fetcher = useFetcher();
  const [foundNothing, setFoundNothing] = useState(false)

  const phoneNumberEntered = phoneNumber.length >= MIN_PHONE_LENGTH

  function handleNewClientClick() {
    onNotFound({phone: phonePrefix + phoneNumber})
  }

  function handleClientFound(client: Client) {
    onFound(client)
  }

  const hintValue = phoneNumber == '' ? 'Начните вводить номер телефона клиента' : (phoneNumberEntered ? 'Ищем по указанному номеру' : `Введите как минимум ${MIN_PHONE_LENGTH} цифр номера`)


  useEffect(() => {
    if (!phoneNumberEntered) {
      setSuggestedClients([])
      return
    }

    let phone = phoneNumber

    if (phone.startsWith('89')) {
      phone = '+7' + phone.substring(1)
    }

    if (phone.startsWith('+')) {
      const x = splitPhoneNumber(phone)
      if (x) {
        setPhonePrefix(x[0])
        phone = x[1]
      }

    }

    setPhoneNumber(phone)

    fetcher.load(`/api/booking/clients?phone=${phone}`).catch(err => {
      console.log('load clients error', err)
    })

  }, [phoneNumber])

  useEffect(() => {
    if (fetcher.data && !fetcher.data.error) {
      setSuggestedClients(fetcher.data)
      setFoundNothing(fetcher.data.length == 0)
    }
  }, [fetcher.data])

  return <>

    <TextInput
        data-autofocus
        label={"Телефон клиента"}
        description={hintValue}
        placeholder="Телефон клиента"
        value={phoneNumber}
        leftSection={<div style={{fontSize: 12}}>{phonePrefix}</div>}
        onChange={(e) => setPhoneNumber(e.target.value)}/>
    {phoneNumberEntered &&
      <>
        <Table highlightOnHover>
          <Table.Tbody>
            {suggestedClients.map((client, i) => (
                <Table.Tr key={i} style={{cursor: 'pointer'}} onClick={() => handleClientFound(client)}>
                  <Table.Td w={1} style={{whiteSpace: 'nowrap'}}>{prettyPrintPhone(client.phoneNumber)}</Table.Td>
                  <Table.Td>{client.lastName} {client.firstName} {client.middleName}</Table.Td>
                </Table.Tr>

            ))}
          </Table.Tbody>

        </Table>

        {foundNothing &&
          <Button variant={"outline"} size={"xs"} onClick={handleNewClientClick}>Не найден? Добавить нового
            клиента</Button>}
      </>}

    {fetcher.data && fetcher.data.error && <Alert mt={20} variant="light" color="red" title="Ошибка" icon={<IconAlertCircle size={16}/>}>
        {fetcher.data.error}

      </Alert>}

  </>
}
