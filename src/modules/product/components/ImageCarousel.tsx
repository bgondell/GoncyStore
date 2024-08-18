// ImageCarousel.tsx

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface MediaItem {
  type: 'image' | 'video';
  src: string;
}

function ImageCarousel({ images, videos, title }: { images?: string; videos?: string; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaItems: MediaItem[] = useMemo(() => {
    const items: MediaItem[] = [];
    if (images) {
      items.push(...images.split(',').map(src => ({ type: 'image' as const, src: src.trim() })));
    }
    if (videos) {
      items.push(...videos.split(',').map(src => ({ type: 'video' as const, src: src.trim() })));
    }
    return items;
  }, [images, videos]);

  const nextItem = useCallback(() => {
    if (mediaItems.length <= 1) return;
    setIsTransitioning(true);
    setNextIndex((currentIndex + 1) % mediaItems.length);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
      setIsTransitioning(false);
    }, 500);
  }, [mediaItems.length, currentIndex]);

  const prevItem = useCallback(() => {
    if (mediaItems.length <= 1) return;
    setIsTransitioning(true);
    setNextIndex((currentIndex - 1 + mediaItems.length) % mediaItems.length);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + mediaItems.length) % mediaItems.length);
      setIsTransitioning(false);
    }, 500);
  }, [mediaItems.length, currentIndex]);

  useEffect(() => {
    if (!isPaused && mediaItems.length > 1 && mediaItems[currentIndex].type !== 'video') {
      const interval = setInterval(nextItem, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, nextItem, mediaItems, currentIndex]);

  const handleManualNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (isTransitioning) return;
      setIsPaused(true);
      if (direction === "prev") {
        prevItem();
      } else {
        nextItem();
      }
      setTimeout(() => {
        setIsPaused(false);
      }, 10000);
    },
    [prevItem, nextItem, isTransitioning],
  );

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  useEffect(() => {
    // Auto-play video when it becomes the current item
    if (mediaItems[currentIndex].type === 'video' && videoRef.current) {
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
      }).catch((error) => {
        console.error("Auto-play was prevented:", error);
        setIsVideoPlaying(false);
      });
    } else {
      setIsVideoPlaying(false);
    }
  }, [currentIndex, mediaItems]);

  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <div className="relative aspect-square h-24 w-24 min-w-24 sm:h-36 sm:w-36 sm:min-w-36 overflow-hidden rounded-lg">
      {mediaItems.map((item, index) => (
        <div
          key={item.src}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out ${
            index === currentIndex
              ? "opacity-100"
              : index === nextIndex && isTransitioning
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          {item.type === 'image' ? (
            <img
              alt={`${title} ${index + 1}`}
              className="h-full w-full object-cover"
              src={item.src}
            />
          ) : (
            <video
              ref={index === currentIndex ? videoRef : null}
              className="h-full w-full object-cover"
              src={item.src}
              loop
              playsInline
              muted // Add muted attribute to allow autoplay on most browsers
              onClick={(e) => {
                e.stopPropagation();
                toggleVideoPlayback();
              }}
            />
          )}
        </div>
      ))}
      {mediaItems.length > 1 && (
        <>
          <button
            aria-label="Previous item"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white z-10"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleManualNavigation("prev");
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="Next item"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white z-10"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleManualNavigation("next");
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      {mediaItems[currentIndex].type === 'video' && (
        <button
          aria-label={isVideoPlaying ? "Pause video" : "Play video"}
          className="absolute bottom-2 right-2 rounded-full bg-black/50 p-2 text-white z-10"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleVideoPlayback();
          }}
        >
          {isVideoPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
      )}
    </div>
  );
}

export default ImageCarousel;