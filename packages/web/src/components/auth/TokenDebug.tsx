import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../lib/msal';

export function TokenDebug() {
  const { instance, accounts } = useMsal();

  const handleForceRefresh = async () => {
    try {
      await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
        forceRefresh: true,
      });
      window.location.reload();
    } catch (error) {
      console.error('Force refresh failed:', error);
      // Fall back to interactive login
      await instance.loginRedirect(loginRequest);
    }
  };

  const handleInteractiveLogin = async () => {
    await instance.loginRedirect({
      ...loginRequest,
      prompt: 'consent', // Force consent screen
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Token Debug</h3>
      <div className="space-y-2">
        <button
          onClick={handleForceRefresh}
          className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Force Token Refresh
        </button>
        <button
          onClick={handleInteractiveLogin}
          className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          Force Re-Consent
        </button>
      </div>
    </div>
  );
}
