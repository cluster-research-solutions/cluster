/**
 * Easing function for smooth animations.
 * Provides a cubic ease-in-out interpolation.
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

/**
 * Smoothly scrolls to a target element or position on the page.
 * Supports special case for scrolling to top (hero section).
 * @param targetId - CSS selector for target element (e.g., '#features-section')
 * @param duration - Animation duration in milliseconds (default: 1200)
 */
export function smoothScrollTo(targetId: string, duration: number = 1200): void {
  // Special case: scroll to absolute top for hero section
  if (targetId === '#hero-section') {
    const startPosition = window.pageYOffset;
    const distance = -startPosition; // Scroll to 0
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
    return;
  }

  // For other sections, scroll normally
  const targetSection = document.querySelector(targetId);
  if (targetSection) {
    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }
}
