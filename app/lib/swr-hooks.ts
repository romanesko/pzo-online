import useSWR from "swr";
import {swrKeys} from "@/lib/common";
import {api} from "@/lib/api";
import type {ScheduleItemCombined} from "@/models";

const getOffice = (officeId: number) => {
  return useSWR(swrKeys.officeById(officeId), async () => api.booking.officeById(officeId).catch(err => {
    alert(err);
    return null
  }));
}

const slotsByOfficeAndDAte = (officeId: number, date: string) => {
  return useSWR<{
    [key: string]: ScheduleItemCombined
  }>(swrKeys.slotsForOfficeByDate(officeId, date), async () => {

    return api.booking.dateSlots(officeId, date).catch(err => {
      return {};
    }).then(a => {
      const map = {} as { [key: string]: ScheduleItemCombined }
      for (let item of a) {
        map[item.schedule.startTime] = item
      }

      return map
    });

  });
}

const clientById = (clientId: number, fallbackData?: any) => {
  return useSWR(swrKeys.clientById(clientId), async () => {
    return api.booking.clientById(clientId).catch(err => {
      return {};
    }).then(a => {
      return a
    });
  }, {fallbackData: fallbackData});
}



export const swr = {
  getOffice,
  slotsByOfficeAndDAte,
  clientById


}
