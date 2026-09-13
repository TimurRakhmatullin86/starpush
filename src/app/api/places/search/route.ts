import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchPlaces, buildReviewUrl } from "@/lib/google-places";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const places = await searchPlaces(query);
  const results = places.map((p) => ({
    ...p,
    reviewUrl: buildReviewUrl(p.placeId),
  }));

  return NextResponse.json(results);
}
