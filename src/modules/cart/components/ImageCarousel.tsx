import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, X, Maximize } from "lucide-react";

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
  const [isMaximized, setIsMaximized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maximizedVideoRef = useRef<HTMLVideoElement>(null);

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

  const toggleMaximize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized((prev) => !prev);
  }, []);

  const handleOutsideClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsMaximized(false);
    }
  }, []);

  useEffect(() => {
    if (!isPaused && mediaItems.length > 1 && mediaItems[currentIndex].type !== 'video') {
      const interval = setInterval(nextItem, 2000);
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

  const toggleVideoPlayback = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = isMaximized ? maximizedVideoRef.current : videoRef.current;
    if (videoElement) {
      if (isVideoPlaying) {
        videoElement.pause();
      } else {
        videoElement.play().catch((error: unknown) => {
          console.error("Video playback failed:", error);
        });
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [isVideoPlaying, isMaximized]);

  useEffect(() => {
    const videoElement = isMaximized ? maximizedVideoRef.current : videoRef.current;
    if (mediaItems[currentIndex].type === 'video' && videoElement) {
      videoElement.play().then(() => {
        setIsVideoPlaying(true);
      }).catch((error: unknown) => {
        console.error("Auto-play was prevented:", error);
        setIsVideoPlaying(false);
      });
    } else {
      setIsVideoPlaying(false);
    }
  }, [currentIndex, mediaItems, isMaximized]);

  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative aspect-video w-full max-h-[150vh] overflow-hidden rounded-lg">
        {mediaItems.map((item, index) => (
          <div
            key={item.src}
            className={`absolute top-0 left-0 h-full w-full transition-opacity duration-500 ease-in-out ${
              index === currentIndex
                ? "opacity-100"
                : index === nextIndex && isTransitioning
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            <button
              className="w-full h-full bg-transparent border-0 cursor-pointer focus:outline-none"
              onClick={toggleMaximize}
              aria-label={`Maximize ${item.type}`}
            >
              {item.type === 'image' ? (
                <img
                  alt={`${title} ${index + 1}`}
                  className="h-full w-full bg-secondary object-contain"
                  src={item.src}
                />
              ) : (
                <video
                  ref={videoRef}
                  className="h-full w-full bg-secondary object-contain"
                  src={item.src}
                  loop
                  playsInline
                  muted
                />
              )}
            </button>
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
          <>
            <button
              aria-label={isVideoPlaying ? "Pause video" : "Play video"}
              className="absolute bottom-2 right-2 rounded-full bg-black/50 p-2 text-white z-10"
              onClick={toggleVideoPlayback}
            >
              {isVideoPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
          </>
        )}
      </div>
      {isMaximized && (
        <MaximizedView
          mediaItems={mediaItems}
          currentIndex={currentIndex}
          isVideoPlaying={isVideoPlaying}
          toggleVideoPlayback={toggleVideoPlayback}
          handleManualNavigation={handleManualNavigation}
          onClose={toggleMaximize}
          handleOutsideClick={handleOutsideClick}
          videoRef={maximizedVideoRef}
        />
      )}
    </>
  );
}

function MaximizedView({
  mediaItems,
  currentIndex,
  isVideoPlaying,
  toggleVideoPlayback,
  handleManualNavigation,
  onClose,
  handleOutsideClick,
  videoRef,
}: {
  mediaItems: MediaItem[];
  currentIndex: number;
  isVideoPlaying: boolean;
  toggleVideoPlayback: (e: React.MouseEvent) => void;
  handleManualNavigation: (direction: "prev" | "next") => void;
  onClose: (e: React.MouseEvent) => void;
  handleOutsideClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={handleOutsideClick}
    >
      <div className="relative w-full h-full max-w-screen-lg max-h-screen">
        <button
          aria-label="Close maximized view"
          className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
        <div className="h-full w-full flex items-center justify-center">
          {mediaItems[currentIndex].type === 'image' ? (
            <img
              src={mediaItems[currentIndex].src}
              alt={`Maximized view ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              src={mediaItems[currentIndex].src}
              className="max-h-full max-w-full object-contain"
              loop
              playsInline
              muted
              autoPlay
            />
          )}
        </div>
        {/* ... (keep the existing navigation buttons) */}
        {mediaItems[currentIndex].type === 'video' && (
          <button
            aria-label={isVideoPlaying ? "Pause video" : "Play video"}
            className="absolute bottom-4 right-4 rounded-full bg-black/50 p-2 text-white z-10"
            onClick={toggleVideoPlayback}
          >
            {isVideoPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default ImageCarousel;