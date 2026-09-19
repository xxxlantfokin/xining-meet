import { prisma } from "@/lib/db";

/**
 * State machine for viewing the OTHER person's WeChat:
 *   hidden → requested → approved → revoked → hidden
 *
 * Directional: fromUser asks to see toUser's WeChat.
 * When approved, BOTH parties see + can copy toUser.wechatId.
 * wechatId is ONLY returned when status === approved.
 */
export async function buildWeChatConsent(
  matchId: string,
  meId: string,
  otherId: string,
  otherWechatId: string,
  myWechatId: string
) {
  const [outgoing, incoming] = await Promise.all([
    prisma.weChatRequest.findUnique({
      where: {
        matchId_fromUserId_toUserId: {
          matchId,
          fromUserId: meId,
          toUserId: otherId,
        },
      },
    }),
    prisma.weChatRequest.findUnique({
      where: {
        matchId_fromUserId_toUserId: {
          matchId,
          fromUserId: otherId,
          toUserId: meId,
        },
      },
    }),
  ]);

  const otherShareApproved = outgoing?.status === "approved";
  const myShareApproved = incoming?.status === "approved";

  let wechatId: string | null = null;
  let wechatOwner: "other" | "me" | null = null;
  if (otherShareApproved) {
    wechatId = otherWechatId;
    wechatOwner = "other";
  } else if (myShareApproved) {
    wechatId = myWechatId;
    wechatOwner = "me";
  }

  if (otherShareApproved && myShareApproved) {
    wechatId = otherWechatId;
    wechatOwner = "other";
  }

  let state: "hidden" | "requested" | "approved" = "hidden";
  if (otherShareApproved || myShareApproved) state = "approved";
  else if (outgoing?.status === "pending") state = "requested";

  return {
    wechatId,
    wechatOwner,
    state,
    myRequestStatus: (outgoing?.status as string | undefined) ?? "none",
    incomingPending: incoming?.status === "pending",
    incomingStatus: (incoming?.status as string | undefined) ?? "none",
    iSharedMine: myShareApproved,
    canRevokeOther: otherShareApproved,
    canRevokeMine: myShareApproved,
  };
}
