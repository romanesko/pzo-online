import type {Route} from "@/../.react-router/types/app/+types/root";
import {repo} from "@/database/repo";
import {session} from "@/lib/SessionStorage";


export async function loader({request, params}: Route.LoaderArgs) {
  try {
    await session.userRequireRole(request, 'OPERATOR')

    let url = new URL(request.url);
    let phone = url.searchParams.get("phone");

    if (!phone) {
      return {error: 'no phone provided'}
    }

    const x = await repo.clients.findByPhone(phone, 10)

    return x.map(client => {
      return {
        id: client.id,
        phoneNumber: client.phoneNumber,
        lastName: client.lastName,
        firstName: client.firstName,
        middleName: client.middleName
      }
    })

  } catch (e: any) {
    return {error: e.message}
  }


}
