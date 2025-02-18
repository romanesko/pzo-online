const constraints = {
  clients_phoneNumber_key: 'Клиент с таким телефоном уже существует',
  unique_scheduleid_except_canceled: 'Не удаётся забронировать слот, т.к. он уже занят',
} as {[key: string]: string}


export const handleDBError = (e: any) => {
  if (e.code === '23505') {

    const msg = constraints[e.constraint_name]

    if (msg) {
      throw new Error(msg)
    }

    throw new Error(e.message)
  }
  throw new Error(e.message)
}
