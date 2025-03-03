import {repo} from "@/database/repo";
import {formDataToModel, type FormDataWrapper} from "@/lib/common";
import {type Client, clientFields} from "@/models";
import {session} from "@/lib/SessionStorage";


export async function addClient(fd: FormDataWrapper, request: Request) {
  await session.userRequireRole(request, ['OPERATOR'])
  const client = formDataToModel<Client>(fd, clientFields)

  return {client: await repo.clients.add(client)}
}


export async function editClient(fd: FormDataWrapper, request: Request) {
  await session.userRequireRole(request, ['OPERATOR'])
  const client = formDataToModel<Client>(fd, clientFields)
  await repo.clients.update(client);
}
