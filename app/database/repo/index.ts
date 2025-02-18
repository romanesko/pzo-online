import {usersRepo} from "./users";
import {clientsRepo} from "@/database/repo/clients";
import {officesRepo} from "@/database/repo/offices";
import {scheduleRepo} from "@/database/repo/schedule";
import {bookingRepo} from "@/database/repo/booking";
import {logRepo} from "@/database/repo/log";

export const repo = {
  users: usersRepo,
  clients: clientsRepo,
  offices: officesRepo,
  schedule: scheduleRepo,
  booking: bookingRepo,
  log: logRepo
}


usersRepo.count().then(count => {
  if (count > 0) {
    return
  }
  repo.users.add({login:'admin', name:'Администратор', password: 'admin',roles: ['ADMIN']})
})
