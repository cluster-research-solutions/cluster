import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { AnimatedLogo } from './AnimatedLogo';
import { TypewriterCarousel } from './TypewriterCarousel';
import { cursorBlinkKeyframes, ANIMATION_DURATIONS } from './animations';
import wallpaper from '../../../assets/wallpaper.png';

interface HeroSectionProps {
  onLogin: () => void;
  onScrollToFeatures: () => void;
}

export function HeroSection({ onLogin, onScrollToFeatures }: HeroSectionProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);

  const lines = ['Your research.', 'Your data.'];
  const carouselPhrases = [
    'Better insights.',
    'Clearer patterns.',
    'Stronger evidence.',
    'Faster synthesis.',
  ];

  // Typewriter effect for first two lines
  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const targetText = lines.slice(0, currentLineIndex + 1).join('\n');

      if (displayedText.length < targetText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(targetText.slice(0, displayedText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else if (currentLineIndex < lines.length - 1) {
        const timeout = setTimeout(() => {
          setCurrentLineIndex(currentLineIndex + 1);
        }, 200);
        return () => clearTimeout(timeout);
      } else {
        // Both lines are complete, show carousel
        const timeout = setTimeout(() => {
          setShowCarousel(true);
        }, 300);
        return () => clearTimeout(timeout);
      }
    }
  }, [displayedText, currentLineIndex, lines]);

  const displayLines = displayedText.split('\n');

  return (
    <section id="hero-section" className="relative min-h-[94vh] flex items-center justify-center overflow-hidden pt-16 pb-32" style={{ perspective: '1500px' }}>
      {/* Wallpaper Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${wallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'translateZ(-100px) scale(1.07)',
            transformStyle: 'preserve-3d',
          }}
        />
        {/* Enhanced Gradient Overlay with more drama */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-primary/45 shadow-[inset_0_0_200px_rgba(15,23,42,0.14)]"
          style={{
            transform: 'translateZ(-50px) scale(1.03)',
            transformStyle: 'preserve-3d',
          }}
        />
        {/* 3D Grid overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(100, 116, 139) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(100, 116, 139) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'translateZ(-80px) scale(1.06) rotateX(2deg)',
            transformStyle: 'preserve-3d',
          }}
        />
        {/* Animated gradient orbs for depth */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{
            animationDuration: '4s',
            transform: 'translateZ(20px)',
            transformStyle: 'preserve-3d',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
          style={{
            animationDuration: '6s',
            animationDelay: '1s',
            transform: 'translateZ(30px)',
            transformStyle: 'preserve-3d',
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 -mt-16">
        <div className="flex items-center gap-6 mb-6 ml-28">
          <AnimatedLogo />
          <div className="text-left w-[600px] md:w-[700px]">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
              <div className="h-[1.2em]">
                {displayLines[0] && <>{displayLines[0]}</>}
              </div>
              <div className="h-[1.2em]">
                {displayLines[1] && <>{displayLines[1]}</>}
              </div>
              <div className="h-[1.2em]">
                {showCarousel && (
                  <TypewriterCarousel
                    phrases={carouselPhrases}
                    className="text-primary"
                    typingSpeed={50}
                    pauseDuration={3000}
                    deletingSpeed={30}
                  />
                )}
              </div>
            </h1>
            <style>{`
              .cursor-blink {
                animation: cursorBlink ${ANIMATION_DURATIONS.cursorBlink}ms step-end infinite;
              }
              ${cursorBlinkKeyframes}
            `}</style>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Cluster brings visual synthesis to your existing files—
            <br />
            no importing, no lock-in, no worries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              className="text-lg px-10 py-7 shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 font-semibold"
              onClick={onLogin}
            >
              Try for Free
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-7 border-2 border-gray-300 hover:border-primary hover:bg-primary/5 hover:scale-105 transition-all font-semibold"
              onClick={() => window.location.href = 'mailto:sales@cluster.app'}
            >
              Contact Sales
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Works with SharePoint & Teams • No credit card required • W3C standard exports
            </p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <span>Cluster is open source • </span>
              <a
                href="https://github.com/ericsson-colborn/sharepoint-insights"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </p>
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">Want to self-host but need SLAs? See below.</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={onScrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer hover:opacity-70 transition-opacity"
        aria-label="Scroll to features"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white rounded-full animate-bounce" />
        </div>
      </button>
    </section>
  );
}
