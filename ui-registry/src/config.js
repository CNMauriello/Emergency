// In sviluppo usa il fallback locale (assicurati coincida con la porta di Spring Boot).
// In produzione, imposta VITE_API_BASE_URL in un file .env.production
// (es. VITE_API_BASE_URL=https://api.faro.tuodominio.it) e Vite lo userà
// automaticamente in fase di build, senza bisogno di modificare questo file.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';