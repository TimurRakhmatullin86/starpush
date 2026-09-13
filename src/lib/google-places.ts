const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  url.searchParams.set("query", query);
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();

  return (data.results || []).slice(0, 5).map(
    (p: Record<string, unknown>) =>
      ({
        placeId: p.place_id as string,
        name: p.name as string,
        address: p.formatted_address as string,
        rating: p.rating as number | undefined,
      }) satisfies PlaceResult
  );
}

export function buildReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}
