import {repo} from "@/database/repo";
import {formDataToModel, type FormDataWrapper} from "@/lib/common";
import {type Client, clientFields} from "@/models";


export async function addClient(fd: FormDataWrapper) {
  const client = formDataToModel<Client>(fd, clientFields)

  return {client: await repo.clients.add(client)}
}


export async function editClient(fd: FormDataWrapper) {

  const client = formDataToModel<Client>(fd, clientFields)
  await repo.clients.update(client);
}
