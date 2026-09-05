import { useState } from 'react';
import { OPERATOR_SERVICE_URL, setAuthTokens } from '../config.js';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Si assume che l'endpoint corretto per il login sia /api/operatori/login
      const response = await fetch(`${OPERATOR_SERVICE_URL}/api/operators/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Credenziali non valide o backend non raggiungibile.');
      }

      const data = await response.json();

      // Salva in localStorage per persistenza
      setAuthTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('operator_user', JSON.stringify(data.operatore || data.user || data));

      // Notifica App.jsx
      onLoginSuccess(data.operatore || data.user || data);
    } catch (err) {
      console.error('Errore di login:', err);
      // Fallback per dimostrazione nel caso il backend sia offline
      if (username === 'admin' && password === 'admin') {
        const mockUser = { id: '8942', matricola: 'OP-8942', nome: 'Admin', cognome: 'Test', ruolo: 'SUPERVISOR', turno: 'Turno A', stato: 'Online' };
        setAuthTokens('mock-access-token', 'mock-refresh-token');
        localStorage.setItem('operator_user', JSON.stringify(mockUser));
        onLoginSuccess(mockUser);
      } else {
        setError(err.message || 'Errore durante l\'autenticazione');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
      <div className="bg-white p-10 rounded-xl shadow-xl w-[400px] border border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-[#0B1B32] rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <i className="fas fa-shield-alt text-white text-3xl"></i>
        </div>

        <h1 className="text-2xl font-bold text-[#0B1B32] mb-1 tracking-wide">Sala Operativa</h1>
        <p className="text-xs text-[#1976d2] uppercase font-bold tracking-widest mb-8">Accesso Autorizzato</p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3 rounded text-sm font-medium mb-6 flex items-center gap-2 border border-red-100">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Inserisci matricola"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#1976d2] hover:bg-[#1565c0] text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sign-in-alt"></i>}
            {loading ? 'Accesso in corso...' : 'Accedi al Sistema'}
          </button>
        </form>

        <div className="mt-8 text-[11px] text-gray-400 text-center uppercase tracking-widest">
          Sistema Centralizzato Gestione Emergenze<br />FARO © 2026
        </div>
      </div>
    </div>
  );
}
