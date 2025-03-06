import {Outlet} from "react-router";
import HeaderMenu from "@/routes/header-menu";
import {session} from "@/lib/SessionStorage";

export async function loader({request}: any) {
  const roles  =await session.getUserRoles(request)
  return {roles}
}

export default function RootLayout({loaderData}: {loaderData: any}) {


  return (
      <>
        <span className={"no-print"}>
        <HeaderMenu roles={loaderData.roles} />
          </span>
        <Outlet />
      </>
  );
}
