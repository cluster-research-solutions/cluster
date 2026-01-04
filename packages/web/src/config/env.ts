export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  AZURE_CLIENT_ID: import.meta.env.VITE_AZURE_CLIENT_ID || '',
  AZURE_TENANT_ID: import.meta.env.VITE_AZURE_TENANT_ID || '',
};
