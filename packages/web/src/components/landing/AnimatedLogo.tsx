import { useEffect, useState } from 'react';
import collabLogo from '../../../assets/logo.png';

export function AnimatedLogo() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative flex flex-col items-center transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Animated rays container */}
      <div className="relative">
        {/* Emanating rays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 md:w-1.5 bg-primary/40"
              style={{
                height: '60px',
                transformOrigin: 'center',
                transform: `rotate(${i * 45}deg) translateY(90px)`,
                animation: 'ray-pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Bouncing logo with shadow */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Logo */}
          <img
            src={collabLogo}
            alt="Cluster Logo"
            className="h-32 w-32 md:h-48 md:w-48"
            style={{
              animation: 'logo-bounce 1s ease-in-out infinite',
            }}
          />

          {/* Shadow below logo */}
          <div
            className="w-24 md:w-32 h-3 md:h-4 bg-black/60 rounded-full blur-lg"
            style={{
              animation: 'shadow-pulse 1s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes ray-pulse {
          0%, 100% {
            opacity: 0.2;
            height: 40px;
          }
          50% {
            opacity: 0.6;
            height: 60px;
          }
        }

        @keyframes logo-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shadow-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(0.7);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
