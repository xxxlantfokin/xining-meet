import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, publicUser } from "@/lib/session";
import { buildWeChatConsent } from "@/lib/wechatConsent";

async function assertThreadAccess(threadId: string, userId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      match: { include: { userA: true, userB: true } },
    },
  });
  if (!thread) return null;
  if (thread.match.userAId !== userId && thread.match.userBId !== userId) {
    return null;
  }
  return thread;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await assertThreadAccess(params.threadId, me.id);
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const other =
    thread.match.userAId === me.id ? thread.match.userB : thread.match.userA;

  const messages = await prisma.message.findMany({
    where: { threadId: params.threadId },
    orderBy: { createdAt: "asc" },
  });

  const wechat = await buildWeChatConsent(
    thread.matchId,
    me.id,
    other.id,
    other.wechatId,
    me.wechatId
  );

  return NextResponse.json({
    threadId: thread.id,
    matchId: thread.matchId,
    other: publicUser(other),
    wechat,
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      senderId: m.senderId,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await assertThreadAccess(params.threadId, me.id);
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const text = (body.body as string | undefined)?.trim();
  if (!text) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      threadId: params.threadId,
      senderId: me.id,
      body: text.slice(0, 2000),
    },
  });

  return NextResponse.json({
    message: {
      id: message.id,
      body: message.body,
      senderId: message.senderId,
      createdAt: message.createdAt,
    },
  });
}
