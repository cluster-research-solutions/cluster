import { memo } from 'react';
import { Button } from '../ui/button';
import { smoothScrollTo } from '../../lib/animations';
import { GradientText } from './GradientText';
import { ScrollButton } from './ScrollButton';

/**
 * Final call-to-action section with dramatic 3D visual effects.
 * Features gradient text, floating geometric shapes with 3D transforms,
 * and trust indicators. Includes primary CTA buttons and back-to-top navigation.
 *
 * @example
 * ```tsx
 * <CTASection onLogin={() => handleLogin()} />
 * ```
 */
interface CTASectionProps {
  /** Callback fired when user clicks the CTA button */
  onLogin: () => void;
}

export const CTASection = memo(function CTASection({ onLogin }: CTASectionProps) {
  return (
    <section id="cta-section" className="py-40 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative overflow-hidden">
      {/* 3D Perspective Grid Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ perspective: '1000px' }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(148, 163, 184) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(148, 163, 184) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'rotateX(60deg) scale(2)',
            transformOrigin: 'center center',
            backgroundPosition: 'center center'
          }}
        />
      </div>

      {/* Animated gradient orbs - steel blue theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-slate-500/20 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* 3D Geometric accents with depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ perspective: '1200px' }}>
        {/* Floating 3D boxes */}
        <div
          className="absolute top-20 left-20 w-32 h-32 border-2 border-blue-400/30"
          style={{
            transform: 'rotateX(45deg) rotateY(45deg) rotateZ(12deg)',
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        </div>

        <div
          className="absolute bottom-20 right-20 w-40 h-40 border-2 border-primary/30"
          style={{
            transform: 'rotateX(-45deg) rotateY(-45deg) rotateZ(-12deg)',
            boxShadow: '0 20px 60px rgba(34, 197, 94, 0.15)',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        </div>

        <div
          className="absolute top-1/3 right-1/4 w-24 h-24 border-2 border-slate-400/20"
          style={{
            transform: 'rotateX(30deg) rotateY(30deg) rotateZ(45deg)',
            boxShadow: '0 15px 40px rgba(148, 163, 184, 0.1)',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent" />
        </div>

        {/* Floating lines with depth */}
        <div
          className="absolute top-1/2 left-10 w-2 h-40 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"
          style={{
            transform: 'rotateY(30deg)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
          }}
        />
        <div
          className="absolute top-1/2 right-10 w-2 h-40 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
          style={{
            transform: 'rotateY(-30deg)',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <div className="mb-6">
          <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full mb-6">
            <span className="text-sm font-semibold text-blue-300 tracking-wide uppercase">Start Free Today</span>
          </div>
        </div>

        <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          <GradientText from="white" via="blue-100" to="white">
            Ready to transform your
          </GradientText>
          <br />
          <GradientText from="white" via="blue-100" to="white">
            research workflow?
          </GradientText>
        </h2>

        <p className="text-2xl mb-14 text-slate-300 font-light max-w-3xl mx-auto leading-relaxed">
          Start organizing highlights and generating insights today.
          <br />
          <span className="text-slate-400">No credit card required. Cancel anytime.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            size="lg"
            className="text-xl px-14 py-8 bg-gradient-to-r from-primary via-blue-600 to-primary hover:from-primary/90 hover:via-blue-600/90 hover:to-primary/90 hover:scale-105 font-bold shadow-2xl shadow-primary/50 transition-all duration-300 border border-blue-400/30"
            onClick={onLogin}
          >
            Get Started Free
            <svg className="ml-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-xl px-14 py-8 border-2 border-slate-400/50 text-white hover:border-blue-400/50 hover:scale-105 bg-slate-800/50 backdrop-blur-sm font-bold transition-all duration-300"
            onClick={() => window.location.href = 'mailto:sales@cluster.app'}
          >
            Talk to Sales
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-12 border-t border-slate-700/50">
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>W3C Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your Data Stays Yours</span>
            </div>
          </div>

          {/* Back to Top button */}
          <div className="mt-12 flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <ScrollButton
                direction="up"
                onClick={() => smoothScrollTo('#hero-section')}
                label="Back to top"
              />
              <span className="text-xs font-medium text-slate-500">Back to Top</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
