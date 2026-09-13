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

  const requests = await prisma.reviewRequest.findMany({
    where: { business: { userId } },
    include: {
      customer: { select: { name: true, phone: true } },
      business: { select: { name: true } },
      review: true,
    },
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return NextResponse.json(requests);
}
