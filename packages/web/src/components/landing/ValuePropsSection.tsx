import { Shield, Zap, Users, ChevronUp } from 'lucide-react';
import { smoothScrollTo } from '../../lib/animations';
import collabLogo from '../../../assets/logo.png';

export function ValuePropsSection() {
  return (
    <section id="value-props-section" className="py-16 relative">
      {/* Up Arrow at Top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => smoothScrollTo('#features-section')}
          className="hover:opacity-70 transition-opacity"
          aria-label="Scroll to previous section"
        >
          <ChevronUp className="h-5 w-5 text-white/70 hover:text-white" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-10 mt-4">
          <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3">
            Why teams choose <span className="font-medium border-b-4 border-primary pb-1 inline-flex items-center gap-2 group cursor-default transition-all duration-300 hover:text-primary">
              <span className="inline-block group-hover:animate-wiggle mt-1">cluster</span>
              <img
                src={collabLogo}
                alt="Cluster"
                className="h-12 w-12 inline-block group-hover:animate-logo-spin"
              />
            </span>
            <style>{`
              @keyframes logo-spin {
                from { transform: rotateY(0deg); }
                to { transform: rotateY(360deg); }
              }
              .animate-logo-spin {
                animation: logo-spin 2.5s ease-in-out infinite;
              }
            `}</style>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div className="group text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 icon-flip-container shadow-lg shadow-green-500/50">
              <Shield className="h-10 w-10 text-white icon-flip" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">Your Data Stays Yours</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              No data migration. No vendor lock-in. Your research files stay in SharePoint, under your control.
            </p>
          </div>

          <div className="group text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 icon-flip-container shadow-lg shadow-blue-500/50">
              <Zap className="h-10 w-10 text-white icon-flip" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">Lightweight & Fast</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              Add visual synthesis to your existing workflow. No heavy platform, no steep learning curve.
            </p>
          </div>

          <div className="group text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 icon-flip-container shadow-lg shadow-purple-500/50">
              <Users className="h-10 w-10 text-white icon-flip" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">Built for Teams</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
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
    </section>
  );
}
