import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, publicUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId = body.userId as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
