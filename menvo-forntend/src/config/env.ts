export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  appDomain: import.meta.env.VITE_APP_DOMAIN ?? '',
  allowOpenRoutes: import.meta.env.VITE_ALLOW_OPEN_ROUTES === 'true',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
}
