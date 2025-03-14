import {count, eq} from "drizzle-orm";
import * as crypto from 'crypto';
import assert from "node:assert";
import {db} from "../drizzle";
import {users} from "../schema";


export function encryptPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateSession() {
  const randomBytes = crypto.randomBytes(32);
  return crypto.createHash('sha256').update(randomBytes).digest('hex');

}

async function getUserById(id: number) {
  const user = await db.select().from(users).where(eq(users.id, id)).then(res => res[0])
  if (!user) {
    throw new Error('user not found')
  }
  return user
}


export const usersRepo = {
  count: async () => db.select({count: count()}).from(users).then(res => res[0].count),
  getAll: () => db.select().from(users).where(eq(users.deleted, false)).orderBy(users.id),
  add: async ({name, login, password, roles}: { name: string, login: string, password: string, roles: string[] }) => {
    assert(name, 'useradd: name is required')
    assert(login, 'useradd: login is required')
    assert(password, 'useradd: password is required')
    await db.insert(users).values({
      name: name,
      login: login,
      password: encryptPassword(password),
      session: generateSession(),
      roles: roles
    })
  },
  getUserById: async (id: number) => {
    return getUserById(id)
  },
  getUserByLoginAndPassword: async (login: string, password: string) => {
    const user = await db.select().from(users).where(eq(users.login, login)).then(res => res[0])
    if (!user) {
      console.log('user not found')
      return null
    }

    if(!user.isActive){
      console.log('user not active')
      return null
    }

    if (user.password != encryptPassword(password)) {
    // if (user.password != password) {
      console.log('invalid password')
      return null
    }
    return user
  },

  updateSession: async (userId: number) => {
    const session = generateSession()
    await db.update(users).set({'session': session}).where(eq(users.id, userId))
    return session
  },

  async getUserBySession(authCookie: string) {
    return db.select().from(users).where(eq(users.session, authCookie)).then(res => res[0])

  },
  async updateActiveState(userId: number, value: boolean) {
    return db.update(users).set({'isActive': value}).where(eq(users.id, userId))
  },

  async getRoles() {
    return [{key: 'ADMIN', value: 'Админ'}, {key: 'SUPEROPERATOR', value: 'Супероператор'}, {key: 'OPERATOR', value: 'Оператор'}]
  },

  async addRole(userId: number, role: string) {
    const user = await getUserById(userId)

    return db.update(users).set({'roles': user.roles.concat(role)}).where(eq(users.id, userId))

  },

  async removeRole(userId: number, role: string) {
    const user = await getUserById(userId)
    if (user.login == 'admin' && role == 'ADMIN') {
      throw new Error("Can't remove admin role from superuser")
    }
    return db.update(users).set({'roles': user.roles.filter(r => r != role)}).where(eq(users.id, userId))
  },

  async deleteUser(userId: number) {
    const user = await getUserById(userId)
    if (user.login == 'admin') {
      throw new Error("Can't delete admin user")
    }
    return db.update(users).set({login: '____DELETED:' + user.login, 'deleted': true}).where(eq(users.id, userId))
  },

  changePassword(userId: number, password: string) {
    assert(password, 'password is required')
    return db.update(users).set({password: encryptPassword(password)}).where(eq(users.id, userId))
  },

}








