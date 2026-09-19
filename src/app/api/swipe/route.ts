import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, publicUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const toUserId = body.toUserId as string | undefined;
  const direction = body.direction as string | undefined;
  if (!toUserId || (direction !== "like" && direction !== "pass")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (toUserId === me.id) {
    return NextResponse.json({ error: "Cannot swipe self" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.swipe.upsert({
    where: {
      fromUserId_toUserId: { fromUserId: me.id, toUserId },
    },
    create: { fromUserId: me.id, toUserId, direction },
    update: { direction },
  });

  let matched = false;
  let matchId: string | null = null;
  let threadId: string | null = null;

  if (direction === "like") {
    const reciprocal = await prisma.swipe.findUnique({
      where: {
        fromUserId_toUserId: { fromUserId: toUserId, toUserId: me.id },
      },
    });
    if (reciprocal?.direction === "like") {
      const [userAId, userBId] = [me.id, toUserId].sort();
      const match = await prisma.match.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        create: { userAId, userBId },
        update: {},
      });
      const thread = await prisma.thread.upsert({
        where: { matchId: match.id },
        create: { matchId: match.id },
        update: {},
      });
      matched = true;
      matchId = match.id;
      threadId = thread.id;
    }
  }

  return NextResponse.json({
    ok: true,
    matched,
    matchId,
    threadId,
    other: matched ? publicUser(target) : null,
  });
}
