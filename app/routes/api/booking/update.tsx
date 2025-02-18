import type {Route} from "../../../../.react-router/types/app/+types/root";
import {actionWrapper, FormDataWrapper} from "@/lib/common";
import {repo} from "@/database/repo";
import {session} from "@/lib/SessionStorage";


export async function action({request,}: Route.ActionArgs) {
  await session.userRequireRole(request, 'OPERATOR')
  return actionWrapper(request, {
    confirm: confirm,
    unConfirm:unConfirm,
    cancel
  })
}

async function confirm(fd: FormDataWrapper, request: Request) {
  const bookingId = fd.requireNumber('bookingId')

  const userId = await session.getUserId(request)

  const booking = await repo.booking.getById(bookingId);
  if(!booking){
    throw new Error('booking not found')
  }
  if(booking.state != 'pending'){
    throw new Error('booking is not pending')
  }

  return repo.booking.updateState({bookingId:bookingId, state:'confirmed'},userId)

}
async function unConfirm(fd: FormDataWrapper, request: Request) {
  const bookingId = fd.requireNumber('bookingId')

  const userId = await session.getUserId(request)

  const booking = await repo.booking.getById(bookingId);
  if(!booking){
    throw new Error('booking not found')
  }
  if(booking.state != 'confirmed'){
    throw new Error('booking is not confirmed')
  }

  return repo.booking.updateState({bookingId: bookingId, state:'pending'}, userId)

}


async function cancel(fd: FormDataWrapper, request: Request) {
  const bookingId = fd.requireNumber('bookingId')

  const userId = await session.getUserId(request)

  const booking = await repo.booking.getById(bookingId);
  if(!booking){
    throw new Error('booking not found')
  }
  if(!['pending','confirmed'].includes(booking.state)){
    throw new Error('booking is in a wrong state')
  }

  return repo.booking.updateState({bookingId:bookingId, state:'canceled'}, userId)

}
