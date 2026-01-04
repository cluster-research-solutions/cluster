import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';

export function QuickActionsRow() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      label: 'Browse Files',
      description: 'Explore research files',
      onClick: () => navigate('/browse'),
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      label: 'Organize Highlights',
      description: 'Group and tag insights',
      onClick: () => navigate('/clusters'),
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      label: 'Insights',
      description: 'View key findings',
      onClick: () => navigate('/browse'), // TODO: Add insights view when implemented
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
        Or start something new:
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={action.onClick}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3 text-primary">
                {action.icon}
              </div>
              <h3 className="text-base font-medium text-gray-200 mb-1">
                {action.label}
              </h3>
              <p className="text-sm text-gray-500">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
