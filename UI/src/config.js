export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';

export const AUTH_SERVICE_URL = `${API_BASE_URL}`;
export const OPERATOR_SERVICE_URL = `${API_BASE_URL}`;
export const ORCHESTRATOR_URL = `${API_BASE_URL}`;
export const EMERGENCY_MANAGER_URL = `${API_BASE_URL}`;
export const REGISTRY_SERVICE_URL = `${API_BASE_URL}`;

// Gestione Token
export function getAuthToken() {
    return localStorage.getItem('operator_access_token');
}

export function getRefreshToken() {
    return localStorage.getItem('operator_refresh_token');
}

export function setAuthTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem('operator_access_token', accessToken);
    if (refreshToken) localStorage.setItem('operator_refresh_token', refreshToken);
}

export function clearAuthSession() {
    localStorage.removeItem('operator_access_token');
    localStorage.removeItem('operator_refresh_token');
    localStorage.removeItem('operator_user');
}

// Helper per ottenere l'utente autenticato
export function getAuthUser() {
    const userStr = localStorage.getItem('operator_user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Wrapper globale per le fetch autenticate con dual-token interceptor
export const fetchWithAuth = async (url, options = {}) => {
    let token = getAuthToken();
    let headers = {
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    let response = await fetch(url, { ...options, headers });

    // Intercetta il 401 Unauthorized per provare il refresh token (Silenzioso)
    if (response.status === 401) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });

                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    const newAccessToken = refreshData.accessToken || refreshData.token;
                    const newRefreshToken = refreshData.refreshToken;

                    setAuthTokens(newAccessToken, newRefreshToken);

                    // Riprova la chiamata originale con il nuovo access token
                    headers = {
                        ...options.headers,
                        'Authorization': `Bearer ${newAccessToken}`
                    };
                    response = await fetch(url, { ...options, headers });
                } else {
                    // Refresh token scaduto o non valido (es. ruotato)
                    triggerLogout();
                }
            } catch (e) {
                console.error("Errore durante il refresh del token", e);
                triggerLogout();
            }
        } else {
            // Nessun refresh token disponibile
            triggerLogout();
        }
    }

    return response;
};

// Forza l'uscita se il refresh fallisce (catturato da App.jsx)
function triggerLogout() {
    clearAuthSession();
    window.dispatchEvent(new Event('auth:logout'));
}