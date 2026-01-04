import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { FolderOpen, Tag, Lightbulb, ChevronUp, ChevronDown } from 'lucide-react';
import { smoothScrollTo } from '../../lib/animations';

export function FeaturesSection() {
  return (
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
            Research synthesis, <span className="shimmer-text">reimagined</span>
          </h2>
          <style>{`
            .shimmer-text {
              background: linear-gradient(
                90deg,
                #1e293b 0%,
                #1e293b 40%,
                #f59e0b 50%,
                #1e293b 60%,
                #1e293b 100%
              );
              background-size: 200% 100%;
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: shimmer 6s linear infinite;
            }

            @keyframes shimmer {
              0% {
                background-position: 200% 0;
              }
              100% {
                background-position: -200% 0;
              }
            }
          `}</style>
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
  );
}
