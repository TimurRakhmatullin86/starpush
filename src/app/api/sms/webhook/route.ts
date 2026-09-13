import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateTwilioRequest } from "@/lib/twilio";

export async function POST(req: Request) {
  const url = req.url;
  const body = await req.text();
  const signature = req.headers.get("x-twilio-signature") || "";

  if (!validateTwilioRequest(url, body, signature)) {
    return new NextResponse(null, { status: 403 });
  }

  const params = new URLSearchParams(body);
  const sid = params.get("MessageSid");
  const status = params.get("MessageStatus");

  if (sid && status) {
    const statusMap: Record<string, string> = {
      delivered: "delivered",
      undelivered: "failed",
      failed: "failed",
    };
    const mapped = statusMap[status];
    if (mapped) {
      await prisma.reviewRequest.updateMany({
        where: { smsSid: sid },
        data: { status: mapped },
      });
    }
  }

  return new NextResponse(null, { status: 204 });
}
