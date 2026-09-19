import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
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

function otherUser(
  match: {
    userAId: string;
    userBId: string;
    userA: { id: string; wechatId: string };
    userB: { id: string; wechatId: string };
  },
  meId: string
) {
  return match.userAId === meId ? match.userB : match.userA;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await assertThreadAccess(params.threadId, me.id);
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const other = otherUser(thread.match, me.id);
  return NextResponse.json(
    await buildWeChatConsent(
      thread.matchId,
      me.id,
      other.id,
      other.wechatId,
      me.wechatId
    )
  );
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
  const action = body.action as string | undefined;
  if (!action || !["request", "approve", "deny", "revoke"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const other = otherUser(thread.match, me.id);
  const matchId = thread.matchId;

  const respond = async () =>
    NextResponse.json(
      await buildWeChatConsent(
        matchId,
        me.id,
        other.id,
        other.wechatId,
        me.wechatId
      )
    );

  if (action === "request") {
    const existing = await prisma.weChatRequest.findUnique({
      where: {
        matchId_fromUserId_toUserId: {
          matchId,
          fromUserId: me.id,
          toUserId: other.id,
        },
      },
    });

    if (existing?.status === "approved" || existing?.status === "pending") {
      return respond();
    }

    if (existing) {
      await prisma.weChatRequest.update({
        where: { id: existing.id },
        data: { status: "pending" },
      });
    } else {
      await prisma.weChatRequest.create({
        data: {
          matchId,
          fromUserId: me.id,
          toUserId: other.id,
          status: "pending",
        },
      });
    }
    return respond();
  }

  if (action === "approve" || action === "deny") {
    const incoming = await prisma.weChatRequest.findUnique({
      where: {
        matchId_fromUserId_toUserId: {
          matchId,
          fromUserId: other.id,
          toUserId: me.id,
        },
      },
    });
    if (!incoming || incoming.status !== "pending") {
      return NextResponse.json({ error: "No pending request" }, { status: 400 });
    }
    await prisma.weChatRequest.update({
      where: { id: incoming.id },
      data: { status: action === "approve" ? "approved" : "denied" },
    });
    return respond();
  }

  if (action === "revoke") {
    const target = (body.target as string | undefined) ?? "auto";
    let revoked = false;

    const tryRevokeMine = async () => {
      const incoming = await prisma.weChatRequest.findUnique({
        where: {
          matchId_fromUserId_toUserId: {
            matchId,
            fromUserId: other.id,
            toUserId: me.id,
          },
        },
      });
      if (incoming?.status === "approved") {
        await prisma.weChatRequest.update({
          where: { id: incoming.id },
          data: { status: "revoked" },
        });
        return true;
      }
      return false;
    };

    const tryRevokeOther = async () => {
      const outgoing = await prisma.weChatRequest.findUnique({
        where: {
          matchId_fromUserId_toUserId: {
            matchId,
            fromUserId: me.id,
            toUserId: other.id,
          },
        },
      });
      if (outgoing?.status === "approved") {
        await prisma.weChatRequest.update({
          where: { id: outgoing.id },
          data: { status: "revoked" },
        });
        return true;
      }
      return false;
    };

    if (target === "mine") {
      revoked = await tryRevokeMine();
    } else if (target === "other") {
      revoked = await tryRevokeOther();
      if (!revoked) revoked = await tryRevokeMine();
    } else {
      revoked = (await tryRevokeOther()) || (await tryRevokeMine());
    }

    if (!revoked) {
      return NextResponse.json({ error: "Nothing to revoke" }, { status: 400 });
    }
    return respond();
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
