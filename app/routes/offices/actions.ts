import {repo} from "@/database/repo";
import {formDataToModel, type FormDataWrapper} from "@/lib/common";
import {type Office, officeFields} from "@/models";
import {session} from "@/lib/SessionStorage";


export async function addOffice(fd: FormDataWrapper, request: Request) {

  await session.userRequireRole(request, ['ADMIN'])
  const office = formDataToModel<Office>(fd, officeFields)
  await repo.offices.add(office);
}


export async function editOffice(fd: FormDataWrapper, request: Request) {
  await session.userRequireRole(request, ['ADMIN'])

  const office = formDataToModel<Office>(fd, officeFields)
  await repo.offices.update(office);
}
