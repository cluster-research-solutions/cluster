import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/lib/msal';

/**
 * Hook to get a valid access token for API calls
 */
export function useAccessToken() {
  const { instance, accounts } = useMsal();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getToken = async () => {
      if (accounts.length === 0) {
        setAccessToken(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });
        setAccessToken(response.accessToken);
        setError(null);
      } catch (err) {
        console.error('Failed to acquire token:', err);
        setError(err as Error);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    getToken();
  }, [instance, accounts]);

  return { accessToken, isLoading, error };
}
