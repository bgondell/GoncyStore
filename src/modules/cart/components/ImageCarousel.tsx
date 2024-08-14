import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextImage = useCallback(() => {
    setIsTransitioning(true);
    setNextIndex((currentIndex + 1) % images.length);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsTransitioning(false);
    }, 500); // This should match the transition duration in CSS
  }, [images.length, currentIndex]);

  const prevImage = useCallback(() => {
    setIsTransitioning(true);
    setNextIndex((currentIndex - 1 + images.length) % images.length);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 500); // This should match the transition duration in CSS
  }, [images.length, currentIndex]);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(nextImage, 2000); // Changed to 5 seconds for a slower rotation

      return () => clearInterval(interval);
    }
  }, [isPaused, nextImage]);

  const handleManualNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (isTransitioning) return; // Prevent rapid clicking
      setIsPaused(true);
      if (direction === "prev") {
        prevImage();
      } else {
        nextImage();
      }

      // Resume automatic rotation after 10 seconds of inactivity
      setTimeout(() => {
        setIsPaused(false);
      }, 10000);
    },
    [prevImage, nextImage, isTransitioning],
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative h-[240px] w-full sm:h-[320px] overflow-hidden">
      {images.map((image, index) => (
        <img
          key={image}
          alt={`${title} ${index + 1}`}
          className={`absolute top-0 left-0 h-full w-full bg-secondary object-contain transition-opacity duration-500 ease-in-out ${
            index === currentIndex
              ? "opacity-100"
              : index === nextIndex && isTransitioning
              ? "opacity-100"
              : "opacity-0"
          }`}
          src={image}
        />
      ))}
      <button
        aria-label="Previous image"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white z-10"
        type="button"
        onClick={() => handleManualNavigation("prev")}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        aria-label="Next image"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white z-10"
        type="button"
        onClick={() => handleManualNavigation("next")}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}

export default ImageCarousel;