import {api} from "@/lib/api";
import {mutate} from "swr";


export const mutateForEveryone = async(key: string) =>{
  mutate(key)
  console.log('mutateForEveryone', key)
  return api.queue.addToQueue('mutate', key)
}
