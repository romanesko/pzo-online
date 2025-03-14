import {Container, Tabs} from "@mantine/core";
import type {Route} from "@/types/routes/reports/main/+types/page";
import {session} from "@/lib/SessionStorage";
import {useNavigate} from "react-router";
import {repo} from "@/database/repo";
import OfficeReportsList from "@/routes/reports/main/components/OfficeReportsList";
import {useMemo} from "react";


export async function loader({request,params}: Route.LoaderArgs) {
  await session.userRequireRole(request, ['ADMIN','SUPEROPERATOR'])
  const offices = await repo.offices.getAll()

  const officeId = params.officeId

  let dates = [] as {year:number, month:number, visited:number, unvisited:number }[]

  if (officeId){
    dates = await repo.reports.getAvailableDates(+officeId)
    // dates.push({year:2025, month:5, visited:12, unvisited:11})
  }

    const years = {} as { [key: number]:  [{month:number, visited:number,unvisited:number }] }

    for (let date of dates) {
      if (!date.year) continue
      if (!years[date.year]) years[date.year] = [] as any
      years[date.year].push({month:date.month, visited:date.visited || 0, unvisited: date.unvisited || 0})
    }

    for(let year in years){
      years[year] = years[year].sort((a,b)=>a.month-b.month)
    }




  return {offices, officeId,dates,years}
}


export default function Page({loaderData}: Route.ComponentProps) {

  const {offices,officeId,dates,years} = loaderData

  const navigate = useNavigate();


  return <Container py={20}>
    <Tabs value={officeId} onChange={(value) => navigate(`/reports/main/${value}`)}>
      <Tabs.List>
        {offices.map((office, i) => (
            <Tabs.Tab key={i} value={office.id.toString()}>
              {office.name}
            </Tabs.Tab>
        ))}
      </Tabs.List>
      {officeId && <Container py={0} px={0}>
        <OfficeReportsList officeId={+officeId}  years={years}/>
      </Container>}

    </Tabs>








  </Container>
}
