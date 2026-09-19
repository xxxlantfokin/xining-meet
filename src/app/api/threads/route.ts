import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, publicUser } from "@/lib/session";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads = await prisma.thread.findMany({
    where: {
      match: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    },
    include: {
      match: { include: { userA: true, userB: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = threads.map((th) => {
    const other =
      th.match.userAId === me.id ? th.match.userB : th.match.userA;
    const last = th.messages[0] ?? null;
    return {
      threadId: th.id,
      matchId: th.matchId,
      other: publicUser(other),
      wechatId: other.wechatId,
      lastMessage: last
        ? { body: last.body, createdAt: last.createdAt, senderId: last.senderId }
        : null,
    };
  });

  return NextResponse.json({ threads: items });
}
