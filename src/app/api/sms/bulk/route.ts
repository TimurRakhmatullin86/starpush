import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendSMS, buildReviewSMS } from "@/lib/twilio";
import { PLANS, PlanKey } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const { businessId, customers } = await req.json();

  const business = await prisma.business.findFirst({
    where: { id: businessId, userId },
    include: { user: { include: { subscription: true } } },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const plan = (business.user.subscription?.plan || "free") as PlanKey;
  const limit = PLANS[plan].smsLimit;
  const month = new Date().toISOString().slice(0, 7);
  const usage = await prisma.sMSUsage.findUnique({
    where: { businessId_month: { businessId, month } },
  });
  const remaining = limit - (usage?.count || 0);

  const list = (customers as { name: string; phone: string }[]).slice(
    0,
    remaining
  );
  let successCount = 0;

  for (const c of list) {
    try {
      let customer = await prisma.customer.findFirst({
        where: { businessId, phone: c.phone },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { businessId, name: c.name, phone: c.phone },
        });
      }
      if (customer.optedOut) continue;

      const rr = await prisma.reviewRequest.create({
        data: { customerId: customer.id, businessId, status: "sent" },
      });

      const link = `${process.env.NEXTAUTH_URL}/r/${rr.id}`;
      const body = buildReviewSMS(c.name, business.name, link, business.smsTemplate);
      const sid = await sendSMS(c.phone, body);

      await prisma.reviewRequest.update({
        where: { id: rr.id },
        data: { smsSid: sid },
      });
      successCount++;
    } catch {
      // skip failed sends
    }
  }

  await prisma.sMSUsage.upsert({
    where: { businessId_month: { businessId, month } },
    create: { businessId, month, count: successCount },
    update: { count: { increment: successCount } },
  });

  return NextResponse.json({ sent: successCount, total: list.length });
}
