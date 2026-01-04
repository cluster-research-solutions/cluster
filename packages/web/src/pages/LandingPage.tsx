import { msalInstance, loginRequest } from '../lib/msal';
import { AppNavigation } from '../components/layout/AppNavigation';
import { AppFooter } from '../components/layout/AppFooter';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { ValuePropsSection } from '../components/landing/ValuePropsSection';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { PricingSection } from '../components/landing/PricingSection';
import { CTASection } from '../components/landing/CTASection';
import { VideoBackground } from '../components/landing/VideoBackground';
import { smoothScrollTo } from '../lib/animations';
import bkgMoveVideo from '../../assets/bkg_move.mp4';

export function LandingPage() {
  const handleLogin = () => {
    msalInstance.loginRedirect(loginRequest);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppNavigation isAuthenticated={false} isLandingPage={true} />

      <HeroSection
        onLogin={handleLogin}
        onScrollToFeatures={() => smoothScrollTo('#features-section')}
      />

      <FeaturesSection />

      <VideoBackground videoSrc={bkgMoveVideo} overlayOpacity={0.9} enableParallax={true}>
        <ValuePropsSection />
        <ComparisonSection />
      </VideoBackground>

      <PricingSection onLogin={handleLogin} />

      <CTASection onLogin={handleLogin} />

      <AppFooter />
    </div>
  );
}
