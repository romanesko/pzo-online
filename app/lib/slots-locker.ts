class SlotsLocker {

  private locker: Map<number, { date: Date, by: number }> = new Map()

  lock(slotId: number, by: number) {

    const current = this.locker.get(slotId)
    if (current && current.by !== by) {
      throw new Error("Slot is already locked by another user")
    }

    const date = new Date();
    date.setSeconds(date.getSeconds() + 10);

    this.locker.set(slotId, {date, by})
    return {date}
  }


  isLocked(slotId: number) {
    const dt = this.locker.get(slotId)


    if (!dt) {
      return false
    }
    if (dt.date < new Date()) {
      console.log('lock is expired, removing')
      this.locker.delete(slotId)
      return false
    }
    return true
  }

  unlock(slotId: number) {
    console.log("UNLOCKING SLOT", slotId)
    this.locker.delete(slotId)
  }
}

export const slotsLocker = new SlotsLocker()
