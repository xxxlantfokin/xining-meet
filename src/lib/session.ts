import { cookies } from "next/headers";
import { prisma } from "./db";

export const SESSION_COOKIE = "xining_meet_uid";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const uid = cookieStore.get(SESSION_COOKIE)?.value;
  if (!uid) return null;
  return prisma.user.findUnique({ where: { id: uid } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function publicUser(u: {
  id: string;
  name: string;
  gender: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl: string;
}) {
  return {
    id: u.id,
    name: u.name,
    gender: u.gender,
    age: u.age,
    city: u.city,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
  };
}
