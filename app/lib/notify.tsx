import {notifications} from "@mantine/notifications";
import {IconAlertTriangle, IconCheck} from "@tabler/icons-react";
import React from "react";

export function alertError(msg?:string, details?:string){

  if(!msg){
    return
  }

  notifications.show({
    title: msg,
    message: details || '',
    autoClose: 3000,
    color: 'red',
    icon: <IconAlertTriangle size={16}/>,
    withCloseButton: false,
    withBorder: true,
    position: 'top-center',
    styles: {
      root: {
        backgroundColor: 'var(--notification-color, var(--mantine-primary-color-filled))',
        color: 'white',
        },
        title: {
          color: 'var(--mantine-color-white)',
        },

    }
  })
}
