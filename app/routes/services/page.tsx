import {
  ActionIcon,
  Button,
  Container,
  Flex,
  Group,
  Modal,
  NativeSelect,
  NumberInput,
  Table,
  Text,
  TextInput
} from "@mantine/core";
import type {Route} from "@/types/routes/services/+types/page";
import {session} from "@/lib/SessionStorage";
import {servicesRepo} from "@/database/repo/services";
import {actionWrapper, formatCurrency, FormDataWrapper} from "@/lib/common";
import {useDisclosure} from "@mantine/hooks";
import {documentsRepo} from "@/database/repo/documents";
import {useEffect, useState} from "react";
import type {Service} from "@/models";
import {useFetcher} from "react-router";
import {IconCurrencyRubel, IconTrash} from "@tabler/icons-react";
import {alertError} from "@/lib/notify";


export async function action({request}: Route.ActionArgs) {
  return actionWrapper(request, {
    editService: async (fd: FormDataWrapper, request: Request) => {
      await session.userRequireRole(request, ['ADMIN'])


      const key = fd.requireNumber('serviceId')
      const name = fd.requireString('name')
      let price = +fd.requireString('price').replace(/[^0-9.,]/g, '');

      if(isNaN(price)){
        throw new Error('Цена должна быть числом')
      }

      const docIds = fd.getAll('docId').map(docId=>docId.toString())

      const service = {
        id: key,
        name,
        basePrice: price*100,
        documents: docIds
      }

      if (key ===0){
        await servicesRepo.add({name:service.name, basePrice: service.basePrice, documents: service.documents});
      } else {
        await servicesRepo.update(service);
      }

    },
  })
}

export async function loader({request}: Route.LoaderArgs) {
  await session.userRequireRole(request, ['ADMIN'])
  const [services, documents] = await Promise.all([servicesRepo.getAll(), documentsRepo.getAllTitles()])

  const docsHash = documents.reduce<{ [key: string]: string }>((acc, doc) => {acc[doc.id] = doc.name; return acc;}, {});

  return {services, docsHash}
}


export default function Page({loaderData}: Route.ComponentProps) {

  const {services} = loaderData

  const [opened, { open, close }] = useDisclosure(false);
  const [service, setService] = useState<Service | null>(null)
  const fetcher = useFetcher()

  useEffect(() => {
        alertError(fetcher.data?.error)
  }, [fetcher.data])


  const documentName = (id: string) => loaderData.docsHash[id]

  function handleRowClick(service: Service) {
    setService(service)
    open()
  }

  function handleAddDocumentClick(){
    setService({...service!, documents: [...service!.documents, '']})
  }

  function handleDeltaDocumentClick(i: number){
    const newDocs = [...service!.documents]
    newDocs.splice(i,1)
    setService({...service!, documents: newDocs})
  }

  function handleNewClick(){
    handleRowClick({id:0, name:'', basePrice: 0, documents:[]})
  }

  return <Container my={"sm"}>
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th  w={1}>Название</Table.Th>
          <Table.Th w={1} ta={"right"}>Цена</Table.Th>
          <Table.Th>Документы</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {services.map((service, i) => (
            <Table.Tr key={i} style={{cursor:'pointer'}} onClick={()=> handleRowClick(service)}>
              <Table.Td style={{whiteSpace: 'nowrap'}}>{service.name}</Table.Td>
              <Table.Td ta={"right"} style={{whiteSpace: 'nowrap'}}>{formatCurrency(service.basePrice/100)}&thinsp;₽</Table.Td>
              <Table.Td>{service.documents.map((a,i)=><div key={i}>{i+1}. {documentName(a)}</div>)}</Table.Td>
            </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>

    <Group justify="flex-end" my={12}>
      <Button onClick={handleNewClick}>Добавить услугу</Button>
    </Group>

    {service && <Modal opened={opened} onClose={close} title="Услуга" size={"auto"}>

      <fetcher.Form key={service.id}
          method="post" action="/services" onSubmit={() => {
            close()
          }}>
        <input type="hidden" name="action" value="editService"/>
        <input type="hidden" name="serviceId" value={service?.id.toString()}/>
        <Container p={0}>
          <TextInput my={5} required defaultValue={service.name} name="name" label={"Название"}/>
          <NumberInput my={5}

                       allowDecimal={true}
                       decimalScale={2}
                       fixedDecimalScale
                       thousandSeparator={'\u2009'}
                       required defaultValue={service.basePrice/100} name="price" label={"Цена"}
                       rightSection={<IconCurrencyRubel size={20} stroke={1.5} />}
          />
          <Text size={"sm"} mt={10} mb={4} fw={500}>Документы к печати</Text>
          {service.documents.map((docId, i) => (
              <Flex key={i+docId} justify="stretch"
                    align="center"
                    direction="row"
                    wrap="nowrap"
                    my={4}
              >
              <NativeSelect
                            defaultValue={docId}
                            name={"docId"}
                  data={Object.keys(loaderData.docsHash).map(key=>({value: key, label: loaderData.docsHash[key]}))}
              />
                <Group gap={0} >
                <ActionIcon

                    color={'gray'}
                    variant="subtle"
                    aria-label="show personal data"
                    onClick={() => handleDeltaDocumentClick(i)}>
                  <IconTrash style={{width: '70%', height: '70%'}} stroke={1.5}/>
                </ActionIcon>
                </Group>
              </Flex>
          ))}

          <Group justify="space-between" mt={12}>
            <Button onClick={handleAddDocumentClick} variant="transparent" color={"gray"}>+ ещё документ</Button>
            <Button type="submit"  loading={fetcher.state != 'idle'}>Сохранить</Button>
          </Group>
        </Container>
      </fetcher.Form>
    </Modal>}



  </Container>
}
