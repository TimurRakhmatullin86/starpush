import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, PLANS, PlanKey } from "@/lib/stripe";
import { prisma } from "@/lib/db";

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

  const plan = body.plan as string;
  if (!plan || !(plan in PLANS) || plan === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing?.stripeSubId && existing.status === "active" && existing.plan !== "free") {
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: existing.stripeCustomerId!,
      return_url: `${process.env.NEXTAUTH_URL}/billing`,
    });
    return NextResponse.json({ url: portalSession.url });
  }

  const priceId = PLANS[plan as PlanKey].priceId;
  if (!priceId) {
    return NextResponse.json({ error: "Plan not configured" }, { status: 400 });
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
    metadata: { userId, plan },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
