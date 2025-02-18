import type {Route} from "@/types/+types/root";
import {actionWrapper, FormDataWrapper} from "@/lib/common";
import {repo} from "@/database/repo";
import {session} from "@/lib/SessionStorage";


export async function action({request,}: Route.ActionArgs) {
  await session.userRequireRole(request, 'OPERATOR')
  return actionWrapper(request, {
    addRecord: addRecord,
  })
}

async function addRecord(fd: FormDataWrapper, request: Request) {

  const userId = await session.getUserId(request)

  const clientId = fd.requireNumber('clientId')
  const slotId = fd.requireNumber('slotId')
  const moveFromBooking = fd.optionalNumber('moveFromBooking')

  const x = await repo.booking.add({
    slotId,
    clientId,
  }, userId)

  if (moveFromBooking) {
    await repo.booking.updateState({bookingId: moveFromBooking, state:'canceled'}, userId)
  }

  console.log('INSERTED', x)

  return {rec: true, clientId, slotId}
}
