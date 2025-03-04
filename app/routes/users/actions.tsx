import {repo} from "@/database/repo";
import {FormDataWrapper} from "@/lib/common";
import {randomBytes} from "crypto";
import {session} from "@/lib/SessionStorage";

function checkCurrentUserRole(request: Request, role: string) {
  return session.userRequireRole(request, role)

}


export async function createUser(fd: FormDataWrapper, request: Request) {
  await checkCurrentUserRole(request, 'ADMIN')

  const login = fd.requireString('login')
  const password = fd.requireString('password')
  const name = fd.requireString('name')
  const roles = fd.getAll('role').filter(role=>role.toString()!='ADMIN').map(role => role.toString())

  return  repo.users.add({login, password, name, roles})
}

export async function switchUserActive(fd: FormDataWrapper, request: Request) {
  await checkCurrentUserRole(request,'ADMIN')
  const userId = fd.requireNumber('userId')
  const value = fd.formBooleanValue('value')

  const user = await repo.users.getUserById(userId)
  if(user.login == 'admin') {
    throw new Error("Can't disable main admin")
  }

  return repo.users.updateActiveState(userId, value);
}

export async function switchRole(fd: FormDataWrapper, request: Request) {

  const userId = fd.requireNumber('userId')
  const role = fd.requireString('role')
  const set = fd.requireBoolean('set')

  if (role == 'ADMIN'){
    await checkCurrentUserRole(request,'ADMIN')
  } else {
    await checkCurrentUserRole(request,'SUPEROPERATOR')
  }

  const user = await repo.users.getUserById(userId)
  if(user.login == 'admin' && role == 'ADMIN') {
    throw new Error("Can't switch admin role for main admin")
  }

  if (set) {
    await repo.users.addRole(userId, role)
  } else {
    await repo.users.removeRole(userId, role)
  }

  return {set}

}


export async function deleteUser(fd: FormDataWrapper, request: Request) {
  await checkCurrentUserRole(request,'ADMIN')
  const userId = fd.requireNumber('userId')

  const user = await repo.users.getUserById(userId)
  if(user.login == 'admin') {
    throw new Error("Can't delete main admin")
  }

  return repo.users.deleteUser(userId)
}

export async function changePassword(fd: FormDataWrapper, request: Request) {
  const userId = fd.requireNumber('userId')
  const password = fd.requireString('password')
  return repo.users.changePassword(userId, password)
}



export async function generateRandomPassword(fd: FormDataWrapper, request: Request) {
  const length = fd.requireNumber('length')
  return {password: randomBytes(length)
      .toString("base64") // Convert to a readable format
      .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
      .slice(0, length) // Trim to the required length
  }
}
