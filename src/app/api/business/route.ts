import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const businesses = await prisma.business.findMany({ where: { userId } });
  return NextResponse.json(businesses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!data.name || typeof data.name !== "string") {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const business = await prisma.business.create({
    data: {
      userId,
      name: data.name,
      googlePlaceId: (data.googlePlaceId as string) || null,
      googleReviewUrl: (data.googleReviewUrl as string) || null,
      phone: (data.phone as string) || null,
      smsTemplate: (data.smsTemplate as string) || null,
      delayHours: typeof data.delayHours === "number" ? data.delayHours : 2,
    },
  });

  return NextResponse.json(business, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!data.id || typeof data.id !== "string") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: data.id, userId },
  });
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.business.update({
    where: { id: data.id },
    data: {
      name: (data.name as string) ?? business.name,
      googlePlaceId: (data.googlePlaceId as string) ?? business.googlePlaceId,
      googleReviewUrl: (data.googleReviewUrl as string) ?? business.googleReviewUrl,
      phone: (data.phone as string) ?? business.phone,
      smsTemplate: (data.smsTemplate as string) ?? business.smsTemplate,
      delayHours: typeof data.delayHours === "number" ? data.delayHours : business.delayHours,
      logoUrl: (data.logoUrl as string) ?? business.logoUrl,
    },
  });

  return NextResponse.json(updated);
}
