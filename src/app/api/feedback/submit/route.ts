import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { requestId, feedbackText } = await req.json();

  if (!requestId || !feedbackText) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { requestId } });
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  await prisma.review.update({
    where: { requestId },
    data: { feedbackText },
  });

  await prisma.reviewRequest.update({
    where: { id: requestId },
    data: { status: "feedback" },
  });

  return NextResponse.json({ ok: true });
}
