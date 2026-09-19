import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, selfUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: selfUser(user) });
}

export async function PATCH(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const bio =
    typeof body.bio === "string" ? body.bio.trim().slice(0, 40) : undefined;
  const wechatId =
    typeof body.wechatId === "string"
      ? body.wechatId.trim().slice(0, 40)
      : undefined;
  const city =
    typeof body.city === "string" ? body.city.trim().slice(0, 40) : undefined;
  const avatarUrl =
    typeof body.avatarUrl === "string"
      ? body.avatarUrl.trim().slice(0, 500)
      : undefined;
  const hometown =
    typeof body.hometown === "string"
      ? body.hometown.trim().slice(0, 40)
      : undefined;
  const dialect =
    typeof body.dialect === "string"
      ? body.dialect.trim().slice(0, 40)
      : undefined;
  const languagePref =
    body.languagePref === "zh" || body.languagePref === "bo"
      ? body.languagePref
      : undefined;

  const hasAny =
    bio !== undefined ||
    wechatId !== undefined ||
    city !== undefined ||
    avatarUrl !== undefined ||
    hometown !== undefined ||
    dialect !== undefined ||
    languagePref !== undefined;

  if (!hasAny) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  if (bio !== undefined && bio.length === 0) {
    return NextResponse.json({ error: "Bio required" }, { status: 400 });
  }
  if (wechatId !== undefined && wechatId.length === 0) {
    return NextResponse.json({ error: "WeChat required" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: me.id },
    data: {
      ...(bio !== undefined ? { bio } : {}),
      ...(wechatId !== undefined ? { wechatId } : {}),
      ...(city !== undefined ? { city: city || "西宁" } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(hometown !== undefined ? { hometown } : {}),
      ...(dialect !== undefined ? { dialect } : {}),
      ...(languagePref !== undefined ? { languagePref } : {}),
    },
  });

  return NextResponse.json({ user: selfUser(updated) });
}
