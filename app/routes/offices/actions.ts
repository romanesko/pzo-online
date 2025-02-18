import {repo} from "@/database/repo";
import {formDataToModel, type FormDataWrapper} from "@/lib/common";
import {type Office, officeFields} from "@/models";


export async function addOffice(fd: FormDataWrapper) {

  const office = formDataToModel<Office>(fd, officeFields)
  await repo.offices.add(office);
}


export async function editOffice(fd: FormDataWrapper) {

  const office = formDataToModel<Office>(fd, officeFields)
  await repo.offices.update(office);
}
