import { useEffect, useState, useRef, useCallback } from "react";
import { fetchImages } from "../api/unsplash";
import type { Image } from "../types/image";
import "../styles/ImageGrid.css";
import ImageModal from "./ImageModal";

type Props = {
  query: string;
};

function ImageGrid({ query }: Props) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef<boolean>(false);

  // favorites initialized lazily from localStorage above

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];

      localStorage.setItem("favorites", JSON.stringify(updated));

      return updated;
    });
  }, []);

  // When App remounts the component for a new query (key prop), state resets.
  // No synchronous setState in effects here to avoid cascading renders.

  // Fetch images
  useEffect(() => {
    if (!query.trim()) return;

    async function loadImages() {
      setLoading(true);

      try {
        const data = await fetchImages(query, page);

        setImages((prev) => (page === 1 ? data : [...prev, ...data]));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [query, page]);

  // Infinite scroll
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting && !loadingRef.current) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
    // empty deps: create observer once and use loadingRef for latest loading state
  }, []);

  return (
    <div>
      <div className="grid-container">
        {images.map((img) => (
          <div key={img.id} className="image-card">
            <img
              src={img.urls.small}
              alt={img.alt_description || "Unsplash image"}
              onClick={() =>
                setSelectedImage({
                  url: img.urls.regular,
                  alt: img.alt_description || "Unsplash image",
                })
              }
            />

            <p>{img.user.name}</p>

            <button onClick={() => toggleFavorite(img.id)}>
              {favorites.includes(img.id) ? "❤️ Saved" : "🤍 Save"}
            </button>
          </div>
        ))}
      </div>

      <div ref={loaderRef} />

      {loading && <p>Loading more...</p>}

      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default ImageGrid;
