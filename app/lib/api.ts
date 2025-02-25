import type {ScheduleItemCombined} from "@/models";

function objectToFormData(obj:any) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    formData.append(key, value as any);
  }
  return formData;
}

class Api {

  public booking = {
    dateSlots: (officeId:number, date:string) =>this.get('/api/booking/date/' + officeId + '/' + date),
    // clientsByPhone: (phone: string) =>this.get('/api/booking/clients?phone=' + phone),
    lockSlot: (slotId: number) => this.post('/api/booking/lock', {action:'lock', slotId:slotId}),
    unlockSlot: (slotId: number) => this.post('/api/booking/lock', {action:'unlock', slotId:slotId}),
    clientById: (id: number) => this.get('/api/booking/client?id=' + id),
    officeById:(officeId: number)=> this.get('/api/booking/office?id=' + officeId),
    getById:(bookingId: number) : Promise<ScheduleItemCombined> => this.get('/api/booking?id=' + bookingId),

  }


  public queue = {
    get: (after: string) => this.get('/api/queue?after=' + after),
    addToQueue: (key: string, value: any) => this.post('/api/queue', {action:'addToQueue', key:key, value:value})
  }

  private async get(url: string) {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      console.error(`GET ${url}: ${data.error}`);
      throw new Error(data.error);
    }
    return data;
  }
  private async post(url: string, params: any) {

    const formData = objectToFormData(params)

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.error) {
      console.error(`POST ${url}: ${data.error}`);
      throw new Error(data.error);
    }
    return data;
  }

}

export const api = new Api();

