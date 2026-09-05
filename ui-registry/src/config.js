export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';

// Cache dei token per ruolo per evitare di chiederli continuamente
const tokens = {};

async function getTokenForRoute(url) {
    // Determiniamo il ruolo richiesto in base al microservizio
    let role = 'ROLE_ROOM_OPERATOR'; // default
    if (url.includes('/Registry/')) role = 'ROLE_SERVICE_OPERATOR';
    if (url.includes('/Orchestrator/')) role = 'ROLE_WORKFLOW_EXPERT';

    if (tokens[role]) return tokens[role];

    try {
        const res = await fetch(`${API_BASE_URL}/gateway/generate-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "operator_auto", role: role })
        });
        if (res.ok) {
            const data = await res.json();
            tokens[role] = data.token;
            return data.token;
        }
    } catch (e) {
        console.warn("Impossibile generare token (Backend offline o auth non necessaria)", e);
    }
    return null;
}

// Wrapper globale per le fetch autenticate
export const fetchWithAuth = async (url, options = {}) => {
    const token = await getTokenForRoute(url);
    const headers = {
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    return fetch(url, { ...options, headers });
};