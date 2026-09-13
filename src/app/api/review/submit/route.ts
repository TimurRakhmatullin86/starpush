import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { requestId, feedbackText } = body;
  const rating = typeof body.rating === "number" ? body.rating : parseInt(String(body.rating));

  if (!requestId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const request = await prisma.reviewRequest.findUnique({
    where: { id: requestId as string },
    include: { business: true },
  });
  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.review.findUnique({
    where: { requestId: requestId as string },
  });
  if (existing) {
    return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
  }

  const wentToGoogle = rating >= 4;
  const review = await prisma.review.create({
    data: {
      requestId: requestId as string,
      rating,
      wentToGoogle,
      feedbackText: rating <= 3 && typeof feedbackText === "string" ? feedbackText : null,
    },
  });

  await prisma.reviewRequest.update({
    where: { id: requestId as string },
    data: { status: wentToGoogle ? "reviewed" : "feedback" },
  });

  return NextResponse.json({
    id: review.id,
    wentToGoogle,
    googleReviewUrl: wentToGoogle ? request.business.googleReviewUrl : null,
  });
}
