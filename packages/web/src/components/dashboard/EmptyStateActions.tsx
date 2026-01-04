import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { FolderOpen, Tag, Lightbulb, Github, BookOpen, Code } from 'lucide-react';

export function EmptyStateActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <FolderOpen className="h-12 w-12" />,
      title: 'Browse Files',
      description: 'Explore videos, documents, transcripts, and notes from your libraries',
      onClick: () => navigate('/browse'),
    },
    {
      icon: <Tag className="h-12 w-12" />,
      title: 'Organize Highlights',
      description: 'Group and tag insights, create themes, and build affinity maps',
      onClick: () => navigate('/clusters'),
    },
    {
      icon: <Lightbulb className="h-12 w-12" />,
      title: 'Generate Insights',
      description: 'Transform highlights into evidence-backed findings and recommendations',
      onClick: () => navigate('/insights'),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {actions.map((action, index) => (
          <Card
            key={index}
            onClick={action.onClick}
            className="cursor-pointer hover:bg-gray-50 transition-all hover:shadow-xl hover:scale-105 group border-gray-200 min-h-[280px] flex flex-col animate-fade-in-up"
            style={{
              animationDelay: `${index * 333}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <CardHeader className="flex-1">
              <CardTitle className="flex items-center gap-3 text-xl text-gray-900 group-hover:text-primary transition-colors mb-4">
                <span className="text-primary group-hover:scale-110 transition-transform">{action.icon}</span>
                {action.title}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                {action.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-center text-sm text-gray-500 mb-6">
          New to Cluster? Check out these resources to get started
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-primary"
            asChild
          >
            <a href="#" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learn More
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-primary"
            asChild
          >
            <a href="#" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API Docs
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-primary"
            asChild
          >
            <a
              href="https://github.com/ericsson-colborn/sharepoint-insights"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}
