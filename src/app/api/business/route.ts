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
  const data = await req.json();

  const business = await prisma.business.create({
    data: {
      userId,
      name: data.name,
      googlePlaceId: data.googlePlaceId || null,
      googleReviewUrl: data.googleReviewUrl || null,
      phone: data.phone || null,
      smsTemplate: data.smsTemplate || null,
      delayHours: data.delayHours || 2,
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
  const data = await req.json();

  const business = await prisma.business.findFirst({
    where: { id: data.id, userId },
  });
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.business.update({
    where: { id: data.id },
    data: {
      name: data.name ?? business.name,
      googlePlaceId: data.googlePlaceId ?? business.googlePlaceId,
      googleReviewUrl: data.googleReviewUrl ?? business.googleReviewUrl,
      phone: data.phone ?? business.phone,
      smsTemplate: data.smsTemplate ?? business.smsTemplate,
      delayHours: data.delayHours ?? business.delayHours,
      logoUrl: data.logoUrl ?? business.logoUrl,
    },
  });

  return NextResponse.json(updated);
}
