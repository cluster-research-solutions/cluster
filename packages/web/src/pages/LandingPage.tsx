import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { FolderOpen, Tag, Lightbulb, Shield, Zap, Users, ChevronUp, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { msalInstance, loginRequest } from '../lib/msal';
import { AppNavigation } from '../components/layout/AppNavigation';
import { AppFooter } from '../components/layout/AppFooter';
import { AnimatedLogo } from '../components/landing/AnimatedLogo';
import { TypewriterCarousel } from '../components/landing/TypewriterCarousel';
import wallpaper from '../../assets/wallpaper.png';
import dovetailLogo from '../../assets/dovetail.webp';
import marvinLogo from '../../assets/marvin.png';
import condensLogo from '../../assets/condens.png';

export function LandingPage() {
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

  const handleLogin = () => {
    msalInstance.loginRedirect(loginRequest);
  };

  const smoothScrollTo = (targetId: string) => {
    // Special case: scroll to absolute top for hero section
    if (targetId === '#hero-section') {
      const startPosition = window.pageYOffset;
      const distance = -startPosition; // Scroll to 0
      const duration = 1200;
      let start: number | null = null;

      const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };

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
      const duration = 1200;
      let start: number | null = null;

      const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };

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
  };

  const handleScrollToFeatures = () => smoothScrollTo('#features-section');

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
    <div className="min-h-screen bg-white flex flex-col">
      <AppNavigation isAuthenticated={false} isLandingPage={true} />

      {/* Hero Section */}
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
          {/*bg-gradient-to-br from-white/95 via-blue-50/90 to-primary/25*/}
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
                  animation: cursorBlink 1060ms step-end infinite;
                }
                @keyframes cursorBlink {
                  0%, 49% {
                    opacity: 1;
                  }
                  50%, 100% {
                    opacity: 0;
                  }
                }
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
                onClick={handleLogin}
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
          onClick={handleScrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer hover:opacity-70 transition-opacity"
          aria-label="Scroll to features"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white rounded-full animate-bounce" />
          </div>
        </button>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-24 bg-white relative">
        {/* Up Arrow at Top */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#hero-section')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Research synthesis, reimagined
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to turn scattered highlights into compelling insights, without the overhead
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group border-2 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-102 transition-transform duration-300">
                  <FolderOpen className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3 font-bold">Browse Your Research</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Connect to SharePoint, watch recordings, read transcripts, and create highlights—all without moving your files.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 border-primary/50 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-primary/5 to-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <CardHeader className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-102 transition-transform duration-300">
                  <Tag className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3 font-bold">Organize Visually</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Drag highlights into clusters. Build affinity maps. Think spatially with an infinite canvas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-102 transition-transform duration-300">
                  <Lightbulb className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3 font-bold">Generate Insights</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Export findings with evidence links. Share boards with stakeholders. Tell the story.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Down Arrow at Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#value-props-section')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* Value Props Section */}
      <section id="value-props-section" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-green-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl" />
        </div>

        {/* Up Arrow at Top */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#features-section')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to previous section"
          >
            <ChevronUp className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Why teams choose <span className="font-medium border-b-4 border-primary pb-1">cluster</span>
            </h2>
            {/* <div className="w-24 h-1 bg-gradient-to-r from-primary to-blue-600 mx-auto mt-4 rounded-full" /> */}
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="group text-center p-8 rounded-2xl hover:bg-white hover:shadow-2xl hover:shadow-green-100/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 icon-flip-container">
                <Shield className="h-10 w-10 text-green-600 icon-flip" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Data Stays Yours</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                No data migration. No vendor lock-in. Your research files stay in SharePoint, under your control.
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl hover:bg-white hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 icon-flip-container">
                <Zap className="h-10 w-10 text-blue-600 icon-flip" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Lightweight & Fast</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Add visual synthesis to your existing workflow. No heavy platform, no steep learning curve.
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl hover:bg-white hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 icon-flip-container">
                <Users className="h-10 w-10 text-purple-600 icon-flip" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Built for Teams</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Share boards, collaborate on insights, and integrate with your enterprise tools seamlessly.
              </p>
            </div>
          </div>

          <style>{`
            .icon-flip-container {
              perspective: 1000px;
            }

            .icon-flip {
              transform-style: preserve-3d;
              transition: transform 0.6s ease-in-out;
            }

            .group:hover .icon-flip {
              animation: flipHorizontal 0.6s ease-in-out;
            }

            @keyframes flipHorizontal {
              from {
                transform: rotateY(0deg);
              }
              to {
                transform: rotateY(360deg);
              }
            }
          `}</style>
        </div>

        {/* Down Arrow at Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#comparisons-section')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* Comparisons Section */}
      <section id="comparisons-section" className="py-24 bg-white relative">
        {/* Up Arrow at Top */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#value-props-section')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to previous section"
          >
            <ChevronUp className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How <span className="font-medium">cluster</span> compares
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how we stack up against other research tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Dovetail Comparison */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl mb-2">
                  <span>vs. Dovetail</span>
                  <img src={dovetailLogo} alt="Dovetail" className="h-8 w-8 object-contain" />
                </CardTitle>
                <CardDescription className="text-base">
                  <div className="space-y-2 text-left">
                    <p className="font-semibold text-gray-900">What's similar:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Visual synthesis & affinity mapping</li>
                      <li>Highlight-based insights</li>
                    </ul>
                    <p className="font-semibold text-gray-900 mt-4">What's different:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Files stay in your SharePoint</li>
                      <li>W3C standard exports (no lock-in)</li>
                      <li>Open source & self-hostable</li>
                    </ul>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Marvin Comparison */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl mb-2">
                  <span>vs. Marvin</span>
                  <img src={marvinLogo} alt="Marvin" className="h-8 w-8 object-contain" />
                </CardTitle>
                <CardDescription className="text-base">
                  <div className="space-y-2 text-left">
                    <p className="font-semibold text-gray-900">What's similar:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Interview transcripts & highlights</li>
                      <li>Research repository</li>
                    </ul>
                    <p className="font-semibold text-gray-900 mt-4">What's different:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>No data migration required</li>
                      <li>Enterprise-ready (M365 native)</li>
                      <li>Infinite canvas for synthesis</li>
                    </ul>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Condens Comparison */}
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl mb-2">
                  <span>vs. Condens</span>
                  <img src={condensLogo} alt="Condens" className="h-8 w-8 object-contain" />
                </CardTitle>
                <CardDescription className="text-base">
                  <div className="space-y-2 text-left">
                    <p className="font-semibold text-gray-900">What's similar:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Qualitative data analysis</li>
                      <li>Tag-based organization</li>
                    </ul>
                    <p className="font-semibold text-gray-900 mt-4">What's different:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Your data stays in your cloud</li>
                      <li>Lightweight, not a heavy platform</li>
                      <li>Focus on visual synthesis</li>
                    </ul>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Down Arrow at Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#pricing')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50 relative">
        {/* Up Arrow at Top */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#comparisons-section')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to previous section"
          >
            <ChevronUp className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your research needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl mb-2">Free</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-2">forever</span>
                </div>
                <CardDescription className="text-base">
                  Perfect for individuals getting started
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Up to 3 studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Unlimited highlights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">SharePoint integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">W3C standard exports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Community support</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleLogin}
                >
                  Get Started Free
                </Button>
              </div>
            </Card>

            {/* Professional Tier */}
            <Card className="border-2 border-primary shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <CardHeader>
                <CardTitle className="text-2xl mb-2">Professional</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600 ml-2">/ month</span>
                </div>
                <CardDescription className="text-base">
                  For teams and power users
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Unlimited studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Advanced tagging & taxonomies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Collaboration features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Priority email support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Custom branding</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                  onClick={handleLogin}
                >
                  Start Free Trial
                </Button>
              </div>
            </Card>

            {/* Enterprise Tier */}
            <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">Custom</span>
                </div>
                <CardDescription className="text-base">
                  For large organizations
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Self-hosted or hosted deployment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">SSO & advanced security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Dedicated support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">SLA guarantees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Custom integrations</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:sales@cluster.app'}
                >
                  Contact Sales
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Down Arrow at Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#support-section')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* Support Section */}
      <section id="support-section" className="py-24 bg-white relative">
        {/* Up Arrow at Top */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#pricing')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to previous section"
          >
            <ChevronUp className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Need help?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to support you every step of the way
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://github.com/ericsson-colborn/sharepoint-insights#readme', '_blank');
              }}
              className="group"
            >
              <Card className="h-full border-2 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    Documentation
                    <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Comprehensive guides and tutorials to get you started
                  </CardDescription>
                </CardHeader>
              </Card>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://github.com/ericsson-colborn/sharepoint-insights/discussions', '_blank');
              }}
              className="group"
            >
              <Card className="h-full border-2 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    Community
                    <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Join our community forum to connect with other users
                  </CardDescription>
                </CardHeader>
              </Card>
            </a>

            <a
              href="mailto:support@cluster.app"
              className="group"
            >
              <Card className="h-full border-2 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    Email Support
                    <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Get help from our team at support@cluster.app
                  </CardDescription>
                </CardHeader>
              </Card>
            </a>
          </div>
        </div>

        {/* Down Arrow at Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => smoothScrollTo('#cta-section')}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* CTA Section */}
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
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Ready to transform your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-primary to-cyan-400 bg-clip-text text-transparent">
              research workflow?
            </span>
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
              onClick={handleLogin}
            >
              Get Started Free
              <svg className="ml-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-xl px-14 py-8 border-2 border-slate-400/50 text-white hover:bg-white/10 hover:border-blue-400/50 hover:scale-105 bg-slate-800/50 backdrop-blur-sm font-bold transition-all duration-300"
              onClick={() => window.location.href = 'mailto:sales@cluster.app'}
            >
              Talk to Sales
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-12 border-t border-slate-700/50">
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>W3C Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Your Data Stays Yours</span>
              </div>
            </div>

            {/* Back to Top button */}
            <div className="mt-12 flex flex-col items-center gap-2">
              <button
                onClick={() => smoothScrollTo('#hero-section')}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors group"
                aria-label="Back to top"
              >
                <ChevronDown className="h-5 w-5 rotate-180 group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs font-medium">Back to Top</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
