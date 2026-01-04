import { useMsal } from '@azure/msal-react';

export function LogoutButton() {
  const { instance } = useMsal();

  const handleLogout = async () => {
    try {
      await instance.logoutPopup();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
    >
      Sign out
    </button>
  );
}
