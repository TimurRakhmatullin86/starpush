import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const formData = await req.formData();
  const sid = formData.get("MessageSid") as string;
  const status = formData.get("MessageStatus") as string;

  if (!sid) {
    return NextResponse.json({ error: "Missing SID" }, { status: 400 });
  }

  const statusMap: Record<string, string> = {
    delivered: "delivered",
    undelivered: "failed",
    failed: "failed",
  };

  const mappedStatus = statusMap[status];
  if (mappedStatus) {
    await prisma.reviewRequest.updateMany({
      where: { smsSid: sid },
      data: { status: mappedStatus },
    });
  }

  const optOut = formData.get("OptOutType") as string;
  if (optOut) {
    const from = formData.get("From") as string;
    if (from) {
      await prisma.customer.updateMany({
        where: { phone: from },
        data: { optedOut: true },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
