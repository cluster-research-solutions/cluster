/**
 * Shared animation styles and constants for landing page components
 */

export const ANIMATION_DURATIONS = {
  typewriter: 50, // ms per character
  typewriterPause: 3000, // ms between phrases
  shimmer: 6000, // ms for shimmer effect
  logoPulse: 3000, // ms for logo pulse
  logoSpin: 2500, // ms for logo spin
  iconFlip: 600, // ms for icon flip
  cursorBlink: 1060, // ms for cursor blink
} as const;

export const cursorBlinkKeyframes = `
  @keyframes cursorBlink {
    0%, 49% {
      opacity: 1;
    }
    50%, 100% {
      opacity: 0;
    }
  }
`;

export const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }
`;

export const logoSpinKeyframes = `
  @keyframes logo-spin {
    from { transform: rotateY(0deg); }
    to { transform: rotateY(360deg); }
  }
`;

export const logoPulseKeyframes = `
  @keyframes logoPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

export const iconFlipKeyframes = `
  @keyframes flipHorizontal {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(360deg);
    }
  }
`;

export const wiggleKeyframes = `
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }
`;

/**
 * CSS class for cursor blink animation
 */
export const cursorBlinkClass = {
  animation: `cursorBlink ${ANIMATION_DURATIONS.cursorBlink}ms step-end infinite`,
};
