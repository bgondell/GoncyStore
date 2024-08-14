import { useState, useEffect, useCallback } from "react";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    setIsTransitioning(true);
    setNextIndex((currentIndex + 1) % images.length);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsTransitioning(false);
    }, 500); // This should match the transition duration in CSS
  }, [images.length, currentIndex]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    setIsTransitioning(true);
    setNextIndex((currentIndex - 1 + images.length) % images.length);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 500); // This should match the transition duration in CSS
  }, [images.length, currentIndex]);

  useEffect(() => {
    if (!isPaused && images.length > 1) {
      const interval = setInterval(nextImage, 1000); // Changed to 5 seconds for a slower rotation

      return () => clearInterval(interval);
    }
  }, [isPaused, nextImage, images.length]);

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
    return (
      <div className="flex aspect-square h-24 w-24 min-w-24 items-center justify-center rounded-md bg-muted/50 object-cover sm:h-36 sm:w-36 sm:min-w-36">
        <ImageOff className="m-auto h-12 w-12 opacity-10 sm:h-16 sm:w-16" />
      </div>
    );
  }

  return (
    <div className="relative aspect-square h-24 w-24 min-w-24 sm:h-36 sm:w-36 sm:min-w-36 overflow-hidden">
      {images.map((image, index) => (
        <img
          key={image}
          alt={`${title} ${index + 1}`}
          className={`absolute top-0 left-0 h-full w-full rounded-md bg-muted/50 object-cover transition-opacity duration-500 ease-in-out ${
            index === currentIndex
              ? "opacity-100"
              : index === nextIndex && isTransitioning
              ? "opacity-100"
              : "opacity-0"
          }`}
          loading={index === 0 ? "eager" : "lazy"}
          src={image}
        />
      ))}
      {images.length > 1 && (
        <>
          <button
            aria-label="Previous image"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-md bg-black/50 p-1 text-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleManualNavigation("prev");
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Next image"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-md bg-black/50 p-1 text-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleManualNavigation("next");
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

export default ImageCarousel;