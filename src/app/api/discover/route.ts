import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, publicUser } from "@/lib/session";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const swiped = await prisma.swipe.findMany({
    where: { fromUserId: me.id },
    select: { toUserId: true },
  });
  const swipedIds = swiped.map((s) => s.toUserId);

  const candidates = await prisma.user.findMany({
    where: {
      city: me.city,
      id: { notIn: [me.id, ...swipedIds] },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  return NextResponse.json({
    candidates: candidates.map(publicUser),
  });
}
