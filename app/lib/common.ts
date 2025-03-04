import type {BaseEntity, FieldsDefinition} from "@/models";

export function replacer(key: string, value: any) {
  return typeof value === "bigint" ? value.toString() : value;
}


export class FormDataWrapper extends FormData {

  public formData: FormData

  constructor(formData: FormData) {
    super()
    this.formData = formData
  }

  getAll(key: string) {
    return this.formData.getAll(key)
  }

  optionalString(key: string) {
    return this.formData.get(key)?.toString() || null
  }

  optionalNumber(key: string) {
    const value = this.optionalString(key)
    if (!value) return null
    if (isNaN(+value)) return null
    return +value
  }

  requireString(key: string) {
    if (!this.formData.get(key)) {
      throw new Error(`key ${key} is required`)
    }
    return this.formData.get(key)!.toString()
  }

  requireNumber(key: string) {
    const val = this.optionalNumber(key)
    if (val === null) throw new Error(`key ${key} is required`)
    return val
  }

  requireBoolean(key: string) {
    return this.requireString(key) == 'true'
  }

  formBooleanValue(v: string) {
    return (this.formData.get(v) == 'on')
  }
}


export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export function formDataToModel<T extends BaseEntity>(fd: FormDataWrapper, def: FieldsDefinition<T>): T {
  const item = {id: fd.optionalNumber('id')} as T;

  for (const field of def) {
    if (field.required) {
      item[field.name] = fd.requireString(field.name as any) as T[keyof T]; // Cast to the appropriate type
    } else {
      item[field.name] = fd.optionalString(field.name as any) as T[keyof T]; // Cast to the appropriate type
    }
  }

  for (let key in item) {
    if (item[key] === undefined || item[key] === null) {
      delete item[key];
    }
  }

  return item;
}




export function formatDate(date: Date) {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  return `${parts[4].value}-${parts[2].value}-${parts[0].value}`;
}

export function formatDateFull(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });
  return formatter.format(date);
}


export async function actionWrapper(request: Request, actions: {
  [key: string]: (fd: FormDataWrapper, request: Request) => Promise<any>
}) {
  const fd = new FormDataWrapper(await request.formData());
  let action = 'unknown'
  try {
    action = fd.requireString('action')
    if (actions[action]) {
      return {action: action, ...await actions[action](fd,request)}
    } else {
      return {action, error: "Unknown action"}
    }
  } catch (e: any) {
    return {action, error: e.message}
  }

}

export function prettyPrintPhone(phoneNumber: string | null): string {
  if (!phoneNumber) {
    return ''
  }
  const russianPhonePattern = /^\+7(\d{10})$/;
  const match = phoneNumber.match(russianPhonePattern);

  if (!match) {
    return phoneNumber;
  }

  const subscriberNumber = match[1];

  const formattedNumber = subscriberNumber.replace(
      /(\d{3})(\d{3})(\d{2})(\d{2})/,
      ` $1 $2\u202F$3\u202F$4`
  );

  return `+7${formattedNumber}`;
}


export const swrKeys = {
  slotsForOfficeByDate: (officeId: number, date: string) => `slotsForOffice${officeId}andDate${date}`,
  clientById: (id: number) => `clientById${id}`,
  officeById: (id: number) => `officeById${id}`,
  clientRecords: (id: number) => `clientRecords${id}`,

}


export function formatPhoneNumber(phoneNumber: string): string {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  if (cleanedNumber.startsWith('89') || cleanedNumber.startsWith('9') || cleanedNumber.startsWith('79')) {
    return '+79' + cleanedNumber.slice(cleanedNumber.startsWith('89') ? 2 : cleanedNumber.startsWith('79') ? 2 : 1);
  }
  return phoneNumber;
}


export function calculateIntervals(startTime:string, endTime:string, interval: number) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const startDate = new Date(0, 0, 0, startHour, startMinute);
  const endDate = new Date(0, 0, 0, endHour, endMinute);
  const diffInMs = endDate.valueOf() - startDate.valueOf();
  const diffInMinutes = diffInMs / (1000 * 60);
  return diffInMinutes / interval;
}

export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const diffInMs = Math.abs(end - start);
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}


export function formatCurrency(number: number): string {
  const formatter = new Intl.NumberFormat('en-US',{
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const parts = formatter.formatToParts(number);
  const thinSpace = '\u2009';

  return parts.map(part => {
    if (part.type === 'group') {
      return thinSpace;
    }
    return part.value;
  }).join('');
}
