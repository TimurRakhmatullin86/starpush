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

  const { businessId, customerName, customerPhone } = body as {
    businessId?: string;
    customerName?: string;
    customerPhone?: string;
  };

  if (!businessId || !customerName || !customerPhone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const phone = customerPhone.trim();
  if (!/^\+?\d{7,15}$/.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

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
  if ((usage?.count || 0) >= limit) {
    return NextResponse.json({ error: "SMS limit reached" }, { status: 429 });
  }

  let customer = await prisma.customer.findFirst({
    where: { businessId, phone },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { businessId, name: customerName, phone },
    });
  }

  const reviewRequest = await prisma.reviewRequest.create({
    data: { customerId: customer.id, businessId, status: "sent" },
  });

  const link = `${process.env.NEXTAUTH_URL}/r/${reviewRequest.id}`;
  const smsBody = buildReviewSMS(
    customerName,
    business.name,
    link,
    business.smsTemplate
  );

  try {
    const sid = await sendSMS(phone, smsBody);
    await prisma.reviewRequest.update({
      where: { id: reviewRequest.id },
      data: { smsSid: sid },
    });
  } catch {
    await prisma.reviewRequest.update({
      where: { id: reviewRequest.id },
      data: { status: "failed" },
    });
    return NextResponse.json({ error: "SMS send failed" }, { status: 500 });
  }

  await prisma.sMSUsage.upsert({
    where: { businessId_month: { businessId, month } },
    create: { businessId, month, count: 1 },
    update: { count: { increment: 1 } },
  });

  return NextResponse.json({ id: reviewRequest.id });
}
