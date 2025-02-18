import {actionWrapper, FormDataWrapper} from "@/lib/common";
import type {Route} from "../../../.react-router/types/app/+types/root";
import {queue} from "@/lib/EventsQueue";


export async function loader({request, params}: Route.LoaderArgs) {


  let url = new URL(request.url);
  let afterStr = url.searchParams.get("after");
  if(!afterStr) {
    return { error: 'no after provided' }
  }

  const after = parseInt(afterStr)

  let entries = []
  let lastTs = after

  if (after ===0) {
    lastTs = queue.getLastTs() || 0
  } else {

    entries = queue.getEntriesAfter(after)
    if (entries.length > 0) {

      lastTs = entries[entries.length - 1].ts
    }
  }

  return {ok: true, entries: entries, ts: lastTs}

}


export async function action({request,}: Route.ActionArgs) {
  return actionWrapper(request, {
    addToQueue: addToQueue,
  })
}

async function addToQueue(fd: FormDataWrapper) {

  const key = fd.requireString('key')
  const value = fd.requireString('value')

  const currentTime = new Date().getTime()

  const msg = {key:key,value:value}
  queue.insert(currentTime, {key:key,value:value})

  // addEventToQueue({key:'refreshDay', value: {officeId: 1, date: Math.random()}})
  return {msg, added: true}
}


setInterval(() => {
  const oldAfter = new Date().getTime() - 1000 * 60 * 60 // 1 hour ago
  console.log('removing queue entries before', oldAfter)
  queue.removeEntriesBefore(oldAfter)
}, 1000*60*60)



// queue.insert(1739552714754, 'foo');
// queue.insert(1739552714800, 'bar');
// queue.insert(1739552714900, 'baz');
//
// // Remove entries with timestamps earlier than 1739552714800
// queue.removeEntriesBefore(1739552714800);
//
// const entries = queue.getEntriesAfter(1739552714754);
// console.log(entries); // Outputs: ['bar', 'baz']

