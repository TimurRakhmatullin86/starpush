import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { requestId, rating, feedbackText } = await req.json();

  if (!requestId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const request = await prisma.reviewRequest.findUnique({
    where: { id: requestId },
    include: { business: true },
  });
  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.review.findUnique({
    where: { requestId },
  });
  if (existing) {
    return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
  }

  const wentToGoogle = rating >= 4;
  const review = await prisma.review.create({
    data: {
      requestId,
      rating,
      wentToGoogle,
      feedbackText: rating <= 3 ? feedbackText : null,
    },
  });

  await prisma.reviewRequest.update({
    where: { id: requestId },
    data: { status: wentToGoogle ? "reviewed" : "feedback" },
  });

  return NextResponse.json({
    id: review.id,
    wentToGoogle,
    googleReviewUrl: wentToGoogle ? request.business.googleReviewUrl : null,
  });
}
