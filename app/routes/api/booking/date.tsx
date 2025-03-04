import type {Route} from "@/../.react-router/types/app/+types/root";
import {repo} from "@/database/repo";
import {slotsLocker} from "@/lib/slots-locker";
import {session} from "@/lib/SessionStorage";


export async function loader({request, params}: Route.LoaderArgs) {
  await session.userRequireRole(request, 'OPERATOR')

  const date = params.date;
  const officeId = params.officeId;
  if(!date) {
    return { error: 'no date provided' }
  }
  if(!officeId) {
    return { error: 'no date provided' }
  }

  const slots =  await repo.schedule.getByOfficeAndDates(+officeId,[date])


  for (let slot of slots) {
    if (slot.booking) {
      continue
    }
    slot.locked = slotsLocker.isLocked(slot.schedule.id!)
    if (slot.locked) {




      console.log('slot locked', slot)
    }
  }


  return  slots
}
