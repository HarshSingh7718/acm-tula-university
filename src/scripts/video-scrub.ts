import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isReducedMotion } from "./scroll";

gsap.registerPlugin(ScrollTrigger);

export interface ScrubbedVideoOptions {
  video: HTMLVideoElement | string;
  trigger: HTMLElement | string;
  start?: number;
  end?: number;
  scrollStart?: string;
  scrollEnd?: string;
  lerp?: number;
  onUpdate?: (progress: number, currentTime: number) => void;
}

export interface ScrubbedVideoInstance {
  scrollTrigger: ScrollTrigger | null;
  destroy: () => void;
}

/**
 * Initializes smooth video scrubbing tied to a single GSAP ScrollTrigger.
 * Uses exponential lerp on the GSAP ticker (without numeric scrub smoothing or custom rAF loops).
 * Handles missing media gracefully with fallback state and zero console errors.
 */
export function scrubbedVideo(
  options: ScrubbedVideoOptions,
): ScrubbedVideoInstance {
  if (typeof window === "undefined") {
    return { scrollTrigger: null, destroy: () => {} };
  }

  const videoElement: HTMLVideoElement | null =
    typeof options.video === "string"
      ? document.querySelector<HTMLVideoElement>(options.video)
      : options.video;

  const triggerElement: HTMLElement | null =
    typeof options.trigger === "string"
      ? document.querySelector<HTMLElement>(options.trigger)
      : options.trigger;

  if (!triggerElement) {
    return { scrollTrigger: null, destroy: () => {} };
  }

  let scrollTriggerInstance: ScrollTrigger | null = null;
  let tickerCallback: ((time: number, deltaTime: number) => void) | null = null;
  let isVisible = false;
  let isDestroyed = false;
  let hasMedia = false;
  let retryCount = 0;

  let startTime = options.start ?? 0;
  let endTime = options.end ?? 0;
  let targetTime = startTime;
  let renderedTime = startTime;
  const lerpFactor = options.lerp ?? 0.1;
  const frameSnap = 1 / 60;

  // Toggle placeholder container visual state
  const mediaContainer =
    videoElement?.closest<HTMLElement>(".video-container, .media-container") ||
    videoElement?.parentElement;

  if (mediaContainer) {
    mediaContainer.classList.add("bg-[#050B14]");
  }

  // 1. Unlocking iOS/Safari autoplay playback capability for video scrubbing
  if (videoElement) {
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.setAttribute("playsinline", "");
    videoElement.setAttribute("webkit-playsinline", "");
    videoElement.setAttribute("muted", "");
    videoElement.preload = "auto";

    // Unlock playback without throwing on user gesture restrictions
    try {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            videoElement.pause();
          })
          .catch(() => {
            // Ignored: video seeking continues to work on modern browsers
          });
      }
    } catch {
      // Silently ignore
    }
  }

  // 2. IntersectionObserver to pause offscreen decoding and toggle .is-visible
  let observer: IntersectionObserver | null = null;
  if (triggerElement || videoElement) {
    const targetToObserve = videoElement || triggerElement;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (videoElement) {
            videoElement.classList.toggle("is-visible", isVisible);
          }
          if (mediaContainer) {
            mediaContainer.classList.toggle("is-visible", isVisible);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "100px 0px 100px 0px",
      },
    );
    observer.observe(targetToObserve);
  }

  // 3. Setup ScrollTrigger (Exactly ONE ScrollTrigger per instance)
  scrollTriggerInstance = ScrollTrigger.create({
    trigger: triggerElement,
    start: options.scrollStart ?? "top top",
    end: options.scrollEnd ?? "bottom bottom",
    scrub: false, // Lerp smoothing handled via GSAP ticker
    onUpdate: (self) => {
      if (isDestroyed) return;
      const progress = self.progress;

      if (hasMedia && endTime > startTime) {
        targetTime = startTime + progress * (endTime - startTime);
      }

      if (options.onUpdate) {
        options.onUpdate(progress, targetTime);
      }

      // If reduced motion is active, snap directly
      if (isReducedMotion() && videoElement && hasMedia) {
        try {
          videoElement.currentTime = targetTime;
        } catch {
          // Guard against seek errors
        }
      }
    },
  });

  // 4. GSAP Ticker callback with exponential lerp and frame snapping
  tickerCallback = (_time: number, deltaTime: number) => {
    if (isDestroyed || !isVisible || !hasMedia || !videoElement) return;
    if (isReducedMotion()) return;

    // Frame-rate independent exponential lerp factor
    const deltaRatio = Math.min(deltaTime / (1000 / 60), 3);
    const adjustedLerp = 1 - (1 - lerpFactor) ** deltaRatio;

    renderedTime += (targetTime - renderedTime) * adjustedLerp;

    // Snap rendered time to multiples of 1/60s
    const snappedTime = Math.round(renderedTime / frameSnap) * frameSnap;

    if (
      Number.isFinite(snappedTime) &&
      Math.abs(videoElement.currentTime - snappedTime) > 0.001
    ) {
      try {
        videoElement.currentTime = Math.max(
          startTime,
          Math.min(endTime, snappedTime),
        );
      } catch {
        // Guard currentTime assignment
      }
    }
  };

  gsap.ticker.add(tickerCallback);

  // 5. Video Metadata Resolution & Fallback Logic
  function configureMediaBounds() {
    if (!videoElement || isDestroyed) return;

    const duration = videoElement.duration;
    if (Number.isFinite(duration) && duration > 0) {
      hasMedia = true;
      if (options.end === undefined || options.end <= 0) {
        endTime = duration;
      } else {
        endTime = Math.min(options.end, duration);
      }
      if (options.start !== undefined) {
        startTime = Math.min(options.start, endTime);
      }
      targetTime = startTime;
      renderedTime = startTime;

      // Seek to initial frame
      try {
        videoElement.currentTime = startTime;
      } catch {
        // Ignore
      }
    } else if (retryCount === 0) {
      // Retry once if duration is not yet available
      retryCount++;
      setTimeout(() => {
        if (!isDestroyed) {
          configureMediaBounds();
        }
      }, 250);
    } else {
      // Media not available: remain gracefully on placeholder surface without throwing
      hasMedia = false;
    }
  }

  const handleMetadata = () => configureMediaBounds();
  const handleError = () => {
    // Gracefully remain on placeholder
    hasMedia = false;
  };

  if (videoElement) {
    if (
      videoElement.readyState >= 1 &&
      Number.isFinite(videoElement.duration)
    ) {
      configureMediaBounds();
    } else {
      videoElement.addEventListener("loadedmetadata", handleMetadata, {
        once: true,
      });
      videoElement.addEventListener("durationchange", handleMetadata, {
        once: true,
      });
      videoElement.addEventListener("canplay", handleMetadata, { once: true });
      videoElement.addEventListener("error", handleError, { once: true });
    }
  }

  // 6. Cleanup handler
  const cleanup = () => {
    if (isDestroyed) return;
    isDestroyed = true;

    if (tickerCallback) {
      gsap.ticker.remove(tickerCallback);
      tickerCallback = null;
    }

    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
      scrollTriggerInstance = null;
    }

    if (observer) {
      observer.disconnect();
      observer = null;
    }

    if (videoElement) {
      videoElement.removeEventListener("loadedmetadata", handleMetadata);
      videoElement.removeEventListener("durationchange", handleMetadata);
      videoElement.removeEventListener("canplay", handleMetadata);
      videoElement.removeEventListener("error", handleError);
    }
  };

  window.addEventListener("pagehide", cleanup, { once: true });

  return {
    scrollTrigger: scrollTriggerInstance,
    destroy: cleanup,
  };
}
