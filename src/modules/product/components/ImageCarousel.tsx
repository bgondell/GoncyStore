import { useState, useEffect, useCallback } from "react";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isPaused && images.length > 1) {
      const interval = setInterval(nextImage, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, nextImage, images.length]);

  const handleManualNavigation = useCallback((direction: 'prev' | 'next') => {
    setIsPaused(true);
    if (direction === 'prev') {
      prevImage();
    } else {
      nextImage();
    }

    // Resume automatic rotation after 5 seconds of inactivity
    setTimeout(() => {
      setIsPaused(false);
    }, 10000);
  }, [prevImage, nextImage]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square h-24 w-24 min-w-24 items-center justify-center rounded-md bg-muted/50 object-cover sm:h-36 sm:w-36 sm:min-w-36">
        <ImageOff className="m-auto h-12 w-12 opacity-10 sm:h-16 sm:w-16" />
      </div>
    );
  }

  return (
    <div className="relative aspect-square h-24 w-24 min-w-24 sm:h-36 sm:w-36 sm:min-w-36">
      <img
        alt={title}
        className="h-full w-full rounded-md bg-muted/50 object-cover"
        loading="lazy"
        src={images[currentIndex]}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleManualNavigation('prev');
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-1 text-white rounded-r-md"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleManualNavigation('next');
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-1 text-white rounded-l-md"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

export default ImageCarousel;