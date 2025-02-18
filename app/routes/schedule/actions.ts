import {repo} from "@/database/repo";
import {formDataToModel, type FormDataWrapper} from "@/lib/common";
import {type Schedule, scheduleItemFields} from "@/models";


export async function addScheduleItem(fd: FormDataWrapper) {

  const scheduleItem = formDataToModel<Schedule>(fd, scheduleItemFields)
  console.log('scheduleItem', scheduleItem)
  await repo.schedule.add(scheduleItem);
}

export async function deleteScheduleItem(fd: FormDataWrapper) {
  const id = fd.requireNumber('id')
  await repo.schedule.deleteById(id)
}

export async function copyScheduleDate(fd: FormDataWrapper) {
  const sourceDate = fd.requireString('sourceDate')
  const targetDate = fd.requireString('targetDate')
  const officeId = fd.requireNumber('officeId')

  return repo.schedule.copyDate({sourceDate, targetDate, officeId})
}
