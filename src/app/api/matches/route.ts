import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, publicUser } from "@/lib/session";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: {
      userA: true,
      userB: true,
      thread: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const items = matches.map((m) => {
    const other = m.userAId === me.id ? m.userB : m.userA;
    return {
      matchId: m.id,
      threadId: m.thread?.id ?? null,
      createdAt: m.createdAt,
      other: publicUser(other),
      wechatId: other.wechatId,
    };
  });

  return NextResponse.json({ matches: items });
}
