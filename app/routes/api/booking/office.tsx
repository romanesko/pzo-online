import type {Route} from "@/../.react-router/types/app/+types/root";
import {repo} from "@/database/repo";
import {session} from "@/lib/SessionStorage";


export async function loader({request, params}: Route.LoaderArgs) {
  await session.userRequireRole(request, 'OPERATOR')

  let url = new URL(request.url);
  let id = url.searchParams.get("id");

  if (!id) {
    return {error: 'no id provided'}
  }

  const office = await repo.offices.getById(+id)

  if(!office){
    return {error: 'office not found'}
  }

  return {
    id: office.id,
    name: office.name,
  }




}
