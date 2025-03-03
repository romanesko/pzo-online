import {usersRepo} from "./users";
import {clientsRepo} from "@/database/repo/clients";
import {officesRepo} from "@/database/repo/offices";
import {scheduleRepo} from "@/database/repo/schedule";
import {bookingRepo} from "@/database/repo/booking";
import {logRepo} from "@/database/repo/log";
import {servicesRepo} from "@/database/repo/services";
import {documentsRepo} from "@/database/repo/documents";


export const repo = {
  users: usersRepo,
  clients: clientsRepo,
  offices: officesRepo,
  schedule: scheduleRepo,
  booking: bookingRepo,
  log: logRepo,
  services: servicesRepo,
  documents: documentsRepo
}


usersRepo.count().then(count => {
  if (count > 0) {
    return
  }
  repo.users.add({login:'admin', name:'Администратор', password: 'admin',roles: ['ADMIN','SUPEROPERATOR','OPERATOR']})
})


documentsRepo.count().then(count=>{
  if (count > 0) {
    return
  }
  repo.documents.add({id:'contract', name: 'Договор оказания услуг', content: 'ДОГОВОР ВОЗМЕЗДНОГО ОКАЗАНИЯ МЕДИЦИНСКИХ УСЛУГ'})
  repo.documents.add({id:'act', name: 'Акт об оказании медицинских услуг', content: 'Акт № ____ об оказании медицинских услуг'})
  repo.documents.add({id:'ids', name: 'ИДС', content: 'ИНФОРМИРОВАННОЕ ДОБРОВОЛЬНОЕ СОГЛАСИЕ НА МЕДИЦИНСКОЕ ВМЕШАТЕЛЬСТВО'})
  repo.documents.add({id:'sopd', name: 'СОПД', content: 'СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ ЗАКОННОГО ПРЕДСТАВИТЕЛЯ ПАЦИЕНТА/ПРЕДСТАВИТЕЛЯ ПО ДОВЕРЕННОСТИ'})
})
