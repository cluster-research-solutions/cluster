import collabLogo from '../../../assets/logo.png';

export function AppFooter() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={collabLogo} alt="Cluster Logo" className="h-6 w-6" />
            <span className="text-sm text-gray-400">© 2026 Cluster. All rights reserved.</span>
          </div>
          <nav className="flex gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              About
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Support
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
