import type {Route} from "../../../../.react-router/types/app/+types/root";
import {actionWrapper} from "@/lib/common";
import {slotsLocker} from "@/lib/slots-locker";


export async function action({request,}: Route.ActionArgs) {
  return actionWrapper(request, {
    lock: lock,
    unlock: unlock,
  })
}

async function lock(fd: any) {
  const slotId = fd.requireNumber('slotId')


  // TODO: check slot is still available for booking


  // const by = fd.requireNumber('by')
  const by = 1 // TODO: get from request
  return slotsLocker.lock(slotId, by)

}


async function unlock(fd: any) {
  const slotId = fd.requireNumber('slotId')
  // const by = fd.requireNumber('by')
  const by = 1 // TODO: get from request
  return slotsLocker.unlock(slotId)

}
