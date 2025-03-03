// session.server.js

// TODO: take user info from db, not from session

import {createCookieSessionStorage, redirect} from "react-router";
import {repo} from "@/database/repo";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const THREE_DAYS = 3 * 24 * 60 * 60; // 3 days in seconds

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    maxAge: THREE_DAYS,  // Session expires in 3 days
  },
});

async function getUserSession(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  session.set("_expires", Date.now() + THREE_DAYS * 1000);
  return session;
}

async function saveUserSession(session: any) {
  return storage.commitSession(session, { maxAge: THREE_DAYS });
}

async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId) return null;
  return userId;
}

async function requireUserId(request: Request, redirectTo = new URL(request.url).pathname) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

async function getUser(session: any) {
  const userId = await requireUserId(session)
  return repo.users.getUserById(userId)
}

async function getUserRoles(session: any) {
  const user = await getUser(session)
  return user.roles
}

async function userHasRole(session: any, rolesToCheck: string[]) {
  const userRoles = await getUserRoles(session)

  if(userRoles.includes('SUPEROPERATOR')) {
    userRoles.push('OPERATOR')
  }

  return  userRoles.some(role => rolesToCheck.includes(role))
}

async function userRequireRole(session: any, roles: string | string[]) {

  if(typeof roles == 'string') {
    roles = [roles]
  }

  if (!await userHasRole(session, roles)) {
    throw new Error('You have to be ' + roles.join(" or ") + ' to to this action')
  }
}


export const session = {
  getUserSession,
  saveUserSession,
  getUserId,
  getUserRoles,
  userRequireRole
}
