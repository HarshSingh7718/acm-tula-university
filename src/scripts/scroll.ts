import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerListener: ((time: number) => void) | null = null;
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Checks if the user prefers reduced motion.
 */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Updates the reduced-motion class on <html> and returns the current state.
 */
export function updateReducedMotionState(): boolean {
  if (typeof document === "undefined") return false;
  const reduced = isReducedMotion();
  if (reduced) {
    document.documentElement.classList.add("reduced-motion");
  } else {
    document.documentElement.classList.remove("reduced-motion");
  }
  return reduced;
}

/**
 * Smoothly scrolls to a selector or element using Lenis when available,
 * falling back to native smooth scrolling.
 */
export function scrollTo(
  target: string | HTMLElement,
  options?: {
    offset?: number;
    immediate?: boolean;
    duration?: number;
    easing?: (t: number) => number;
  },
): void {
  if (typeof window === "undefined") return;

  if (lenisInstance && !isReducedMotion()) {
    lenisInstance.scrollTo(target, {
      offset: options?.offset ?? -80, // Offset for fixed header
      immediate: options?.immediate ?? false,
      duration: options?.duration,
      easing: options?.easing,
    });
    return;
  }

  const element =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;

  if (element) {
    const headerOffset = options?.offset ?? 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: options?.immediate || isReducedMotion() ? "auto" : "smooth",
    });
  }
}

/**
 * Returns the active Lenis instance or null.
 */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Initializes Lenis smooth scrolling driven by the GSAP ticker.
 * Respects prefers-reduced-motion by skipping Lenis and applying the 'reduced-motion' class.
 * Call this exactly once from Layout.
 */
export function initScroll(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  // 1. Check reduced motion preference
  const reduced = updateReducedMotionState();

  // Listen for live OS preference changes
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handleMotionChange = () => {
    updateReducedMotionState();
    if (isReducedMotion() && lenisInstance) {
      cleanupScroll();
    } else if (!isReducedMotion() && !lenisInstance) {
      initScroll();
    }
  };

  motionQuery.addEventListener("change", handleMotionChange);

  if (reduced) {
    // Reduced motion: completely skip Lenis, settle ScrollTrigger
    ScrollTrigger.refresh();
    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }

  // Cleanup existing instance if already initialized
  if (lenisInstance) {
    cleanupScroll();
  }

  // 2. Initialize Lenis with autoRaf: false
  lenisInstance = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    touchMultiplier: 1.5,
  });

  // 3. Drive Lenis with GSAP ticker & sync ScrollTrigger
  lenisInstance.on("scroll", ScrollTrigger.update);

  tickerListener = (time: number) => {
    if (lenisInstance) {
      lenisInstance.raf(time * 1000);
    }
  };

  gsap.ticker.add(tickerListener);
  gsap.ticker.lagSmoothing(0);

  // 4. Handle resize and orientation change with 200ms debounce
  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
  };

  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", handleResize, { passive: true });

  // 5. Intercept internal anchor link clicks for smooth Lenis scrolling
  const handleAnchorClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    if (!target) return;

    const href = target.getAttribute("href");
    if (!href || href === "#" || !href.startsWith("#")) return;

    const targetElement = document.querySelector(href);
    if (targetElement) {
      event.preventDefault();
      scrollTo(href, { offset: -80 });
      history.pushState(null, "", href);
    }
  };

  document.addEventListener("click", handleAnchorClick);

  // 6. Cleanup on pagehide
  const handlePageHide = () => {
    cleanupScroll();
  };
  window.addEventListener("pagehide", handlePageHide, { once: true });

  return () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    window.removeEventListener("pagehide", handlePageHide);
    document.removeEventListener("click", handleAnchorClick);
    motionQuery.removeEventListener("change", handleMotionChange);
    cleanupScroll();
  };
}

/**
 * Destroys the active Lenis instance and removes ticker callbacks.
 */
function cleanupScroll(): void {
  if (tickerListener) {
    gsap.ticker.remove(tickerListener);
    tickerListener = null;
  }

  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }

  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }
}
