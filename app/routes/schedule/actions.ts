import {repo} from "@/database/repo";
import {formDataToModel, type FormDataWrapper} from "@/lib/common";
import {type Schedule, scheduleItemFields} from "@/models";
import {session} from "@/lib/SessionStorage";


export async function addScheduleItem(fd: FormDataWrapper, request: Request) {
  await session.userRequireRole(request, ['ADMIN','SUPEROPERATOR'])

  const scheduleItem = formDataToModel<Schedule>(fd, scheduleItemFields)
  console.log('scheduleItem', scheduleItem)
  await repo.schedule.add(scheduleItem);
}

export async function deleteScheduleItem(fd: FormDataWrapper, request: Request) {
  await session.userRequireRole(request, ['ADMIN','SUPEROPERATOR'])
  const id = fd.requireNumber('id')
  await repo.schedule.deleteById(id)
}

export async function copyScheduleDate(fd: FormDataWrapper, request: Request) {
  await session.userRequireRole(request, ['ADMIN','SUPEROPERATOR'])

  const sourceDate = fd.requireString('sourceDate')
  const targetDate = fd.requireString('targetDate')
  const officeId = fd.requireNumber('officeId')

  return repo.schedule.copyDate({sourceDate, targetDate, officeId})
}
