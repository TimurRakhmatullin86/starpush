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
  const businesses = await prisma.business.findMany({
    where: { userId },
    select: { id: true },
  });
  const businessIds = businesses.map((b) => b.id);

  if (businessIds.length === 0) {
    return NextResponse.json({
      sent: 0, opened: 0, positive: 0, negative: 0, conversion: 0, nps: 0,
    });
  }

  const requests = await prisma.reviewRequest.findMany({
    where: { businessId: { in: businessIds } },
    include: { review: true },
  });

  const sent = requests.length;
  const opened = requests.filter(
    (r) => r.status !== "sent" && r.status !== "delivered"
  ).length;
  const reviews = requests.filter((r) => r.review).map((r) => r.review!);
  const positive = reviews.filter((r) => r.rating >= 4).length;
  const negative = reviews.filter((r) => r.rating <= 3).length;
  const conversion = sent > 0 ? Math.round((positive / sent) * 100) : 0;

  const ratings = reviews.map((r) => r.rating);
  const promoters = ratings.filter((r) => r >= 4).length;
  const detractors = ratings.filter((r) => r <= 2).length;
  const nps =
    ratings.length > 0
      ? Math.round(
          ((promoters - detractors) / ratings.length) * 100
        )
      : 0;

  return NextResponse.json({ sent, opened, positive, negative, conversion, nps });
}
