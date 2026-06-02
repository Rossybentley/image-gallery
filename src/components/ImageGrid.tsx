import { useEffect, useState, useRef, useCallback } from "react";

import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ImageSkeleton from "./ImageSkeleton";

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
      const isAlreadyFavorite = prev.includes(id);

      const updated = isAlreadyFavorite
        ? prev.filter((f) => f !== id)
        : [...prev, id];

      localStorage.setItem("favorites", JSON.stringify(updated));

      if (isAlreadyFavorite) {
        toast("Removed from favorites ❌", {
          id: `favorite-remove-${id}`,
        });
      } else {
        toast.success("Saved to favorites ❤️", {
          id: `favorite-save-${id}`,
        });
      }

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
        {loading
          ? [...Array(9)].map((_, i) => <ImageSkeleton key={i} />)
          : images.map((img) => (
              <motion.div
                key={img.id}
                className="image-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="image-wrapper">
                  <img
                    src={img.urls.small}
                    alt={img.alt_description || "Unsplash image"}
                    loading="lazy"
                    onClick={() =>
                      setSelectedImage({
                        url: img.urls.regular,
                        alt: img.alt_description || "Unsplash image",
                      })
                    }
                  />

                  {/* empty state for no results */}
                  {images.length === 0 && !loading && (
                    <div className="empty-state">
                      <h2>No images found for "{query}"</h2>
                      <p>Try adjusting your search terms.</p>
                    </div>
                  )}

                  {/* HOVER OVERLAY */}
                  <div className="overlay">
                    <p>{img.user.name}</p>

                    <button
                      onClick={() =>
                        setSelectedImage({
                          url: img.urls.regular,
                          alt: img.alt_description || "Unsplash image",
                        })
                      }
                    >
                      View
                    </button>

                    <button onClick={() => toggleFavorite(img.id)}>
                      {favorites.includes(img.id) ? "❤️ Saved" : "🤍 Save"}
                    </button>

                    <button
                      onClick={() => window.open(img.urls.regular, "_blank")}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

      {/* Infinite Scroll Loader */}
      <div ref={loaderRef} />

      {loading && <p>Loading more...</p>}

      {/* Modal */}
      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {/* scroll to top button */}
      <button
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </div>
  );
}

export default ImageGrid;
