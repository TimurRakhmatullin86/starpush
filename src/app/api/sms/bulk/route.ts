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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { businessId, customers: rawCustomers } = body;
  if (!businessId || !Array.isArray(rawCustomers)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId as string, userId },
    include: { user: { include: { subscription: true } } },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const plan = (business.user.subscription?.plan || "free") as PlanKey;
  const limit = PLANS[plan].smsLimit;
  const month = new Date().toISOString().slice(0, 7);
  const usage = await prisma.sMSUsage.findUnique({
    where: { businessId_month: { businessId: businessId as string, month } },
  });
  const remaining = limit - (usage?.count || 0);

  const validCustomers = rawCustomers
    .filter(
      (c): c is { name: string; phone: string } =>
        typeof c === "object" &&
        c !== null &&
        typeof c.name === "string" &&
        typeof c.phone === "string" &&
        c.name.trim() !== "" &&
        /^\+?\d{7,15}$/.test(c.phone.trim())
    )
    .slice(0, remaining);

  let successCount = 0;

  for (const c of validCustomers) {
    try {
      const phone = c.phone.trim();
      let customer = await prisma.customer.findFirst({
        where: { businessId: businessId as string, phone },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { businessId: businessId as string, name: c.name.trim(), phone },
        });
      }

      const rr = await prisma.reviewRequest.create({
        data: { customerId: customer.id, businessId: businessId as string, status: "sent" },
      });

      const link = `${process.env.NEXTAUTH_URL}/r/${rr.id}`;
      const smsBody = buildReviewSMS(c.name.trim(), business.name, link, business.smsTemplate);
      const sid = await sendSMS(phone, smsBody);

      await prisma.reviewRequest.update({
        where: { id: rr.id },
        data: { smsSid: sid },
      });
      successCount++;
    } catch {
      // skip failed sends
    }
  }

  if (successCount > 0) {
    await prisma.sMSUsage.upsert({
      where: { businessId_month: { businessId: businessId as string, month } },
      create: { businessId: businessId as string, month, count: successCount },
      update: { count: { increment: successCount } },
    });
  }

  return NextResponse.json({ sent: successCount, total: validCustomers.length });
}
