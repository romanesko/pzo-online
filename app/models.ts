import type {InferSelectModel} from "drizzle-orm";
import {booking, clients, document, offices, schedule, service, users} from "@/database/schema";

export type Office = InferSelectModel<typeof offices>;
export type User = InferSelectModel<typeof users>;
export type Client = InferSelectModel<typeof clients>;
export type Schedule = InferSelectModel<typeof schedule>;
export type Booking = InferSelectModel<typeof booking>;
export type Service = InferSelectModel<typeof service>
export type Document = InferSelectModel<typeof document>

export interface BaseEntity {
  id?: number;
}

export type FieldsDefinition<T> = {
  name: keyof T;
  label: string;
  required: boolean;
  type?: 'string' | 'number'
  hidden?: boolean,
  multiline?: boolean
}[];


export const officeFields: FieldsDefinition<Office> = [
  { name: 'name', label: 'Название в интерфейсе', required: true },
  { name: 'legalEntity', label: 'Юридическое лицо', required: false },
  { name: 'address', label: 'Юридический адрес' , required: true},
    { name: 'actualAddress', label: 'Фактический адрес', required: false},
  { name: 'licenceNumber', label: 'Номер лицензи', required: false},
  { name: 'credentials', label: 'Реквизиты', required: false, multiline: true },
  { name: 'signatory', label: 'Подписант', required: false },
  { name: 'signatoryGenitive', label: 'Подписант в род.падеже', required: false },
  { name: 'signatoryStatus', label: 'Должность подписанта', required: false },
  { name: 'signatoryStatusGenitive', label: 'Должность подписанта в род.падеже', required: false },
  { name: 'attorneyNumber', label: 'Номер доверенности', required: false },



];


export const clientFields: FieldsDefinition<Client> = [
  {name: 'lastName', label:'Фамилия', required:false},
  {name: 'firstName', label:'Имя', required:true},
  {name: 'middleName', label:'Отчество', required:false},
  {name: 'phoneNumber', label:'Телефон', required:true},
  {name: 'passportNumber', label:'Номер паспорта', required:false, hidden:true},
  {name: 'passportIssuedBy', label:'Кем выдан паспорт', required:false, hidden:true},
  {name: 'passportIssuedAt', label:'Дата выдачи паспорта', required:false, hidden:true},

]


export const scheduleItemFields: FieldsDefinition<Schedule> = [
  { name: 'date', label: 'date', required: true },
  { name: 'startTime', label: 'startTime' , required: true},
  { name: 'endTime', label: 'endTime' , required: true},
  { name: 'duration', label: 'duration' , required: true},
  { name: 'officeId', label: 'officeId' , required: true},

];


export interface ScheduleItemBase {
  startTime: string,
  endTime: string,
  duration: number,
}
export interface ScheduleItem extends ScheduleItemBase {
  id?:number,
  officeId: number,
  date: string
}

export interface ScheduleItemCombined  {
  schedule: ScheduleItem,
  booking?: Booking ,
  offices?: Office,
  locked?: boolean

}


export class Settings {
  FIRST_SLOT: string = '09:00'
  LAST_SLOT: string = '20:00'
  SLOT_STEP: number = 5
  DEFAULT_CALENDAR_DAYS: number = 7
}
