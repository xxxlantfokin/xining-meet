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
  });

  const items = threads
    .map((th) => {
      const other =
        th.match.userAId === me.id ? th.match.userB : th.match.userA;
      const last = th.messages[0] ?? null;
      return {
        threadId: th.id,
        matchId: th.matchId,
        other: publicUser(other),
        lastMessage: last
          ? { body: last.body, createdAt: last.createdAt, senderId: last.senderId }
          : null,
        sortAt: last?.createdAt?.getTime() ?? th.createdAt.getTime(),
      };
    })
    .sort((a, b) => b.sortAt - a.sortAt)
    .map((item) => ({
      threadId: item.threadId,
      matchId: item.matchId,
      other: item.other,
      lastMessage: item.lastMessage,
    }));

  return NextResponse.json({ threads: items });
}
