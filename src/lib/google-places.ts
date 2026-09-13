interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
    }
  );

  if (!res.ok) return [];
  const data = await res.json();

  return (data.places || []).map(
    (p: Record<string, unknown>) =>
      ({
        placeId: p.id as string,
        name: (p.displayName as Record<string, string>)?.text ?? "",
        address: (p.formattedAddress as string) ?? "",
        rating: p.rating as number | undefined,
      }) satisfies PlaceResult
  );
}

export function buildReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}
