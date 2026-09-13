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

  if (!requestId || typeof feedbackText !== "string" || !feedbackText.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({
    where: { requestId: requestId as string },
  });
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (review.rating > 3) {
    return NextResponse.json({ error: "Feedback only for ratings 1-3" }, { status: 400 });
  }

  await prisma.review.update({
    where: { requestId: requestId as string },
    data: { feedbackText: feedbackText as string },
  });

  await prisma.reviewRequest.update({
    where: { id: requestId as string },
    data: { status: "feedback" },
  });

  return NextResponse.json({ ok: true });
}
