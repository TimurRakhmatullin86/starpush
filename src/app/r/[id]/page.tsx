import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ReviewLanding from "@/components/review-page/ReviewLanding";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await prisma.reviewRequest.findUnique({
    where: { id },
    include: {
      customer: true,
      business: true,
      review: true,
    },
  });

  if (!request) notFound();

  if (request.status === "sent" || request.status === "delivered") {
    await prisma.reviewRequest.update({
      where: { id },
      data: { status: "opened" },
    });
  }

  if (request.review) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-lg text-gray-700">
            You&apos;ve already submitted your review. Thank you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <ReviewLanding
      requestId={request.id}
      customerName={request.customer.name}
      businessName={request.business.name}
      businessLogo={request.business.logoUrl}
      googleReviewUrl={request.business.googleReviewUrl}
    />
  );
}
