import { ComparisonCarousel } from './ComparisonCarousel';
import { smoothScrollTo } from '../../lib/animations';
import { ScrollButton } from './ScrollButton';
import dovetailLogo from '../../../assets/dovetail.webp';
import marvinLogo from '../../../assets/marvin.png';
import condensLogo from '../../../assets/condens.png';
import hypothesisLogo from '../../../assets/hypothesis.svg';

export function ComparisonSection() {
  const comparisons = [
    {
      name: 'Dovetail',
      logo: dovetailLogo,
      similar: [
        'Visual synthesis & affinity mapping',
        'Highlight-based insights',
      ],
      different: [
        'Files stay in your SharePoint',
        'W3C standard exports (no lock-in)',
        'Open source & self-hostable',
      ],
    },
    {
      name: 'Marvin',
      logo: marvinLogo,
      similar: [
        'Interview transcripts & highlights',
        'Research repository',
      ],
      different: [
        'No data migration required',
        'Enterprise-ready (M365 native)',
        'Infinite canvas for synthesis',
      ],
    },
    {
      name: 'Condens',
      logo: condensLogo,
      similar: [
        'Qualitative data analysis',
        'Tag-based organization',
      ],
      different: [
        'Your data stays in your cloud',
        'Lightweight, not a heavy platform',
        'Focus on visual synthesis',
      ],
    },
    {
      name: 'Hypothesis',
      logo: hypothesisLogo,
      similar: [
        'W3C Web Annotation standard',
        'Collaborative annotation',
      ],
      different: [
        'Built for UX research workflows',
        'Visual synthesis & clustering',
        'Enterprise SharePoint integration',
      ],
    },
  ];

  return (
    <div className="mt-18 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          How <span className="font-medium text-primary">cluster</span> compares
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          See how we stack up against other research tools
        </p>
      </div>

      <ComparisonCarousel comparisons={comparisons} />

      {/* Down Arrow at Bottom */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <ScrollButton
          direction="down"
          onClick={() => smoothScrollTo('#pricing')}
          label="Scroll to next section"
          className="p-2"
        />
      </div>
    </div>
  );
}
