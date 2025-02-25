import {repo} from "@/database/repo";
import {Container, Tabs} from "@mantine/core";
import {session} from "@/lib/SessionStorage";
import {useNavigate} from "react-router";
import type {Route} from "@/types/routes/templates/+types/page";
import TextEditor from "@/routes/templates/components/TextEditor";
import {actionWrapper, FormDataWrapper} from "@/lib/common";


export async function action({request,}: Route.ActionArgs) {
  return actionWrapper(request, {
    save: async (fd: FormDataWrapper, request: Request) => {

      return repo.documents.updateContent( fd.requireString('docId'), fd.requireString('content'))

    },
  })
}

export async function loader({request, params}: Route.LoaderArgs) {
  await session.userRequireRole(request, 'ADMIN')

  const docs = await repo.documents.getAllTitles()
  const document = params.templateId ? await repo.documents.getById(params.templateId) : null

  return {docs,  document}
}

export default function Page({loaderData}: Route.ComponentProps) {
  const {docs, document} = loaderData;
  const navigate = useNavigate()

  return <Container py={20}>
    <Tabs value={document?.id} onChange={(value) => navigate(`/templates/${value}`)}>
      <Tabs.List>
        {docs.map((doc, i) => (
            <Tabs.Tab key={i} value={doc.id}>
              {doc.name}
            </Tabs.Tab>
        ))}
      </Tabs.List>
      {document && <Container py={20} px={0}>
        <TextEditor key={document.id} document={document}/>
      </Container>}

    </Tabs>
  </Container>
}
