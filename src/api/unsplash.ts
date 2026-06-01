const ACCESS_KEY = "XE2qdVGpRqqH4AmM1whiyvU4VDse5DVZ3k293u3HjFQ";

export async function fetchImages(query: string, page: number) {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&client_id=${ACCESS_KEY}&page=${page}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }
  const data = await response.json();
  return data.results;
}
