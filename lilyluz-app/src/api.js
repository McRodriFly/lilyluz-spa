// En producción (servido desde Spring Boot en :8080) usa la misma origin.
// En desarrollo (Vite en :5173) apunta al backend en :8080.
const port = window.location.port;
const isDevServer = port === '5173';
export const API_URL = isDevServer
  ? `http://${window.location.hostname}:8080/api`
  : `${window.location.origin}/api`;
