import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icons

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
    if (!isPaused) {
      const interval = setInterval(nextImage, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, nextImage]);

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
    return null;
  }

  return (
    <div className="relative">
      <img
        alt={title}
        className="h-[240px] w-full bg-secondary object-contain sm:h-[320px]"
        src={images[currentIndex]}
      />
      <button
        onClick={() => handleManualNavigation('prev')}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 text-white rounded-full"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => handleManualNavigation('next')}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 text-white rounded-full"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}

export default ImageCarousel;