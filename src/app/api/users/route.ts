import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publicUser } from "@/lib/session";

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ users: users.map(publicUser) });
}
