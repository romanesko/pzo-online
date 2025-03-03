import {Container, Tabs, Text} from "@mantine/core";
import {repo} from "@/database/repo";
import type {Office, ScheduleItemCombined} from "@/models";
import type {Route} from "../../../.react-router/types/app/routes/+types/home";
import {actionWrapper, formatDate} from "@/lib/common";
import {useNavigate, useParams} from "react-router";
import OfficeSchedule from "@/routes/schedule/components/OfficeSchedule";
import {addScheduleItem, copyScheduleDate, deleteScheduleItem} from "@/routes/schedule/actions";
import {session} from "@/lib/SessionStorage";

interface PageProps {
  loaderData: {
    offices: Office[],
    selectedOffice: Office | null,
    dates: string[],
    data: ScheduleItemCombined[]
  };
}



export async function action({request,}: Route.ActionArgs) {
  return actionWrapper(request, {
    addScheduleItem: addScheduleItem,
    deleteScheduleItem: deleteScheduleItem,
    copyScheduleDate: copyScheduleDate
  })
}

export async function loader({request, params}: Route.LoaderArgs) {

  await session.userRequireRole(request, ['ADMIN','SUPEROPERATOR'])

  const offices = await repo.offices.getAll()
  let selectedOffice = null
  let data = [] as ScheduleItemCombined[]
  if (params.officeId) {
    selectedOffice = offices.filter(office => office.id == +params.officeId!)[0]
  }
  let date = new URL(request.url).searchParams.get('date')
  if (!date) {
    date = formatDate(new Date())
  }
  const dates = []

  const d = getPreviousMonday(new Date(date))

  for (let i = 0; i < 7; i++) {
    dates.push(formatDate(d))
    d.setDate(d.getDate() + 1)
  }
  if (selectedOffice?.id) {
    data = await repo.schedule.getByOfficeAndDates(selectedOffice!.id, dates)
  }

  return {offices, selectedOffice, dates, data}
}

export default function SchedulePage({loaderData}: PageProps) {
  const {offices, selectedOffice, dates, data} = loaderData;
  // console.log('loaderData', loaderData)
  const navigate = useNavigate();
  const officeKey = (office: Office) => 'office' + office.id.toString()
  const {officeId} = useParams();
  if (!offices) {
    return <Container py={20}>
      <Text>Select office</Text>
    </Container>
  }
  return <Container py={20}>
    <Tabs value={officeId} onChange={(value) => navigate(`/schedule/${value}`)}>
      <Tabs.List>
        {offices.map((office, i) => (
            <Tabs.Tab key={i} value={office.id.toString()}>
              {office.name}
            </Tabs.Tab>
        ))}
      </Tabs.List>
      {selectedOffice && <Container py={0} px={0}>
        <OfficeSchedule office={selectedOffice} data={data} dates={dates}/>
      </Container>}

    </Tabs>
  </Container>
}

function getPreviousMonday(date: Date) {
  const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysToSubtract = dayOfWeek === 1 ? 0 : (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  const previousMonday = new Date();
  previousMonday.setDate(date.getDate() - daysToSubtract);
  return previousMonday
}
