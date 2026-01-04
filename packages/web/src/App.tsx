import { MsalProvider, useIsAuthenticated, useMsal } from '@azure/msal-react';
import { msalInstance } from './lib/msal';
import { useHealth } from './api/hooks/useHealth';
import { useAccessToken } from './hooks/useAccessToken';
import { useAuthStatus } from './api/hooks/useAuthStatus';
import { useSharePointSites } from './api/hooks/useSharePointSites';
import { LoginButton } from './components/auth/LoginButton';
import { LandingPage } from './pages/LandingPage';
import { FilesPage } from './pages/FilesPage';
import { OrganizePageCanvas } from './pages/OrganizePageCanvas';
import { ClusterPlaybackPage } from './pages/ClusterPlaybackPage';
import { useRecentActivity } from './api/hooks/useActivity';
import { useAnnotations } from './api/hooks/useAnnotations';
import { ContinueWatchingCard } from './components/dashboard/ContinueWatchingCard';
import { RecentHighlightsCard } from './components/dashboard/RecentHighlightsCard';
import { RecentFilesCard } from './components/dashboard/RecentFilesCard';
import { QuickActionsRow } from './components/dashboard/QuickActionsRow';
import { EmptyStateActions } from './components/dashboard/EmptyStateActions';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppNavigation } from './components/layout/AppNavigation';
import { AppFooter } from './components/layout/AppFooter';
import collabLogo from '../assets/logo.png';
import { Toaster, toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { RecentActivityCard } from './components/dashboard/RecentActivityCard';

// Add cursor blink animation styles
const cursorBlinkStyles = `
  @keyframes cursorBlink {
    0%, 49% {
      opacity: 1;
    }
    50%, 100% {
      opacity: 0;
    }
  }

  @keyframes logoPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

function Workspace() {
  const { accounts } = useMsal();
  const { accessToken } = useAccessToken();
  const { data: authStatus } = useAuthStatus(accessToken);
  const { data: sites, isLoading: sitesLoading } = useSharePointSites(accessToken);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUser = accounts[0];

  // Handle refresh SharePoint data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all SharePoint-related queries
      await queryClient.invalidateQueries({ queryKey: ['sharepoint'] });
      await queryClient.invalidateQueries({ queryKey: ['drives'] });
      await queryClient.invalidateQueries({ queryKey: ['driveItems'] });

      toast.success('SharePoint data refreshed');
    } catch (error) {
      console.error('Failed to refresh:', error);
      toast.error('Failed to refresh SharePoint data');
    } finally {
      // Add a small delay to show the animation
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavigation
        isAuthenticated={true}
        currentUser={currentUser}
        authStatus={authStatus}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/browse/*" element={<FilesPage />} />
          <Route path="/clusters/:clusterId/play" element={<ClusterPlaybackPage />} />
          <Route path="/clusters" element={<OrganizePageCanvas />} />
          <Route path="/studies" element={<StudiesPlaceholder />} />
          <Route path="/insights" element={<InsightsPlaceholder />} />
          <Route path="/" element={<HomePage sites={sites} sitesLoading={sitesLoading} currentUser={currentUser} authStatus={authStatus} />} />
        </Routes>
      </div>
      <AppFooter />
    </div>
  );
}

function HomePage({ sites, sitesLoading, currentUser, authStatus }: any) {
  const { accessToken } = useAccessToken();
  const { data: recentActivity } = useRecentActivity(accessToken, 3);
  const [displayedText, setDisplayedText] = useState('');
  const [displayedSubtext, setDisplayedSubtext] = useState('');
  const [showSubtext, setShowSubtext] = useState(false);
  const [currentSubtextIndex, setCurrentSubtextIndex] = useState(0);

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const fullText = `Welcome back, ${firstName}.`;

  // Custom cursor blink animation style
  const cursorStyle = {
    animation: 'cursorBlink 1060ms step-end infinite',
  };

  const subtextOptions = [
    "Let's pick up where you left off.",
    "Let's dive back in.",
    "Let's get started.",
    "Time to explore your research.",
    "This is where the magic happens.",
    "They're not ready for this.",
    "It's go time. Jump back in.",
    "Synthesis session incoming.",
    "Insight engine preparing for launch."
  ];

  const subtext = subtextOptions[currentSubtextIndex] || subtextOptions[Math.floor(Math.random() * subtextOptions.length)];

  // Typewriter effect for main text
  useEffect(() => {
    if (displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 50); // 50ms per character
      return () => clearTimeout(timeout);
    } else {
      // Start subtext after main text completes
      setShowSubtext(true);
    }
  }, [displayedText, fullText]);

  // Typewriter effect for subtext
  useEffect(() => {
    if (showSubtext && displayedSubtext.length < subtext.length) {
      const timeout = setTimeout(() => {
        setDisplayedSubtext(subtext.slice(0, displayedSubtext.length + 1));
      }, 40); // 40ms per character
      return () => clearTimeout(timeout);
    }
  }, [displayedSubtext, showSubtext, subtext]);

  // Rotate subtext every 10 seconds
  useEffect(() => {
    if (showSubtext && displayedSubtext.length === subtext.length) {
      const rotateInterval = setInterval(() => {
        // Clear displayed text to trigger re-type
        setDisplayedSubtext('');
        // Pick a random index different from current
        setCurrentSubtextIndex((prevIndex) => {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * subtextOptions.length);
          } while (newIndex === prevIndex && subtextOptions.length > 1);
          return newIndex;
        });
      }, 10000); // 10 seconds

      return () => clearInterval(rotateInterval);
    }
  }, [showSubtext, displayedSubtext, subtext, subtextOptions.length]);

  const hasRecentActivity = recentActivity && recentActivity.length > 0;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 via-white to-primary/10 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Welcome Header */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img
              src={collabLogo}
              alt="Cluster Logo"
              className="h-32 w-32 flex-shrink-0"
              style={{ animation: 'logoPulse 3s ease-in-out infinite' }}
            />
            <div className="flex flex-col items-start -ml-1">
              <h1 className="text-6xl font-bold text-gray-900 mb-3 min-h-[4rem] leading-tight">
                {displayedText}
                {displayedText.length < fullText.length && (
                  <span className="text-primary" style={cursorStyle}>|</span>
                )}
              </h1>
              <p className="text-2xl text-gray-600 min-h-[2.5rem] tracking-tight pl-2">
                {displayedSubtext}
                {showSubtext && (
                  <span className="text-primary" style={cursorStyle}>|</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Cards or Empty State */}
        {hasRecentActivity ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentActivity.map((fileView) => (
              <RecentActivityCard key={fileView.id} fileView={fileView} />
            ))}
          </div>
        ) : (
          <EmptyStateActions />
        )}
      </div>
    </main>
  );
}

function StudiesPlaceholder() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Studies</h2>
        <p className="text-gray-600">Studies management coming soon</p>
      </div>
    </main>
  );
}

function InsightsPlaceholder() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Synthesize</h2>
        <p className="text-gray-600">Insights management coming soon</p>
      </div>
    </main>
  );
}


function AppContent() {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress, accounts } = useMsal();

  // Debug logging
  console.log('Auth state:', { isAuthenticated, inProgress, accountsCount: accounts.length });

  // Show loading state while MSAL is processing
  if (inProgress !== 'none') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isAuthenticated ? <Workspace /> : <LandingPage />}
    </BrowserRouter>
  );
}

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <style>{cursorBlinkStyles}</style>
      <AppContent />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            padding: '16px',
          },
        }}
      />
    </MsalProvider>
  );
}

export default App;
