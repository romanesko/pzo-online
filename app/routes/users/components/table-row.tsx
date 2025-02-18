'use client'
import {TableTd, TableTr} from "@mantine/core";

import React from "react";
// import {getRoles, switchUserActive} from "@/actions/users";
// import useSWR from "swr";
import UserRole from "./user-role";
import DeleteUser from "./delete";
import ChangePassword from "./password";
import ActiveSwitch from "@/routes/users/components/active-switch";

export default function TableRow({user, roles:userRoles}: { user: any, roles: { key: string, value: string }[] }) {


  if(!userRoles) return <></>

  return <TableTr key={user.id}>
    <TableTd >{user.name} </TableTd>
    <TableTd>{user.login}</TableTd>
    <TableTd style={{textAlign: 'center'}}>
        <ChangePassword user={user}/>
    </TableTd>
    {userRoles.map((role) =>
        <TableTd key={role.key} style={{textAlign: 'center', padding: 0}}>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <UserRole user={user} role={role.key}/>
          </div>
        </TableTd>
      )}

    <TableTd style={{textAlign: 'center', padding: 0}}>
      <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <ActiveSwitch user={user}/>
      </div>
    </TableTd>
    <TableTd style={{textAlign: 'center'}} py={0} px={12}>
      <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <DeleteUser user={user}/>
      </div>
    </TableTd>

  </TableTr>
}
