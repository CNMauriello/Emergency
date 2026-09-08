import { useState } from 'react';
import { OPERATOR_SERVICE_URL, AUTH_SERVICE_URL, setAuthTokens } from '../config.js';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('operator'); // 'operator' or 'user'
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (activeTab === 'user' && isRegistering) {
      try {
        const roleMapping = {
          'service_operator': 'ROLE_SERVICE_OPERATOR',
          'workflow_expert': 'ROLE_WORKFLOW_EXPERT',
          'user': 'ROLE_USER'
        };
        const role = roleMapping[activeTab] || 'ROLE_USER';

        const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, name, surname, email, role }),
        });

        if (!response.ok) {
          if (response.status === 409) throw new Error('Username o Email già in uso.');
          if (response.status === 401) throw new Error('Dati non validi (es. formato email).');
          throw new Error('Errore durante la registrazione.');
        }

        // Registrazione ok, torna al login
        setIsRegistering(false);
        setPassword('');
        setError(null);
        alert('Registrazione completata con successo! Ora puoi effettuare l\'accesso.');
      } catch (err) {
        setError(err.message || 'Errore durante la registrazione.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {


      let response;
      if (activeTab === 'operator') {
        response = await fetch(`${OPERATOR_SERVICE_URL}/api/operators/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      } else {
        // Usa l'API dell'AuthMicroService per utenti e operatori non di sala
        response = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      }

      if (!response.ok) {
        throw new Error('Credenziali non valide o backend non raggiungibile.');
      }

      let data = await response.json();

      // Se l'accesso è tramite AuthMicroService, recuperiamo i dettagli del profilo
      if (activeTab !== 'operator') {
        try {
          const profileRes = await fetch(`${AUTH_SERVICE_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${data.accessToken}` }
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            data.user = { ...profile, ruolo: profile.ruolo || 'ROLE_USER' };
          } else {
            data.user = { username, ruolo: 'ROLE_USER' };
          }
        } catch (e) {
          data.user = { username, ruolo: 'ROLE_USER' };
        }
      }

      // Salva in sessionStorage per isolamento tab
      setAuthTokens(data.accessToken, data.refreshToken);
      sessionStorage.setItem('operator_user', JSON.stringify(data.operatore || data.user || data));

      // Notifica App.jsx
      onLoginSuccess(data.operatore || data.user || data);
    } catch (err) {
      console.error('Errore di login:', err);
      setError(err.message || 'Errore durante l\'autenticazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
      <div className="bg-white p-10 rounded-xl shadow-xl w-[400px] border border-gray-100 flex flex-col items-center max-h-[90vh] overflow-y-auto">

        {/* Toggle tabs */}
        <div className="flex w-full mb-8 bg-gray-100 rounded-lg p-1 relative z-10 shrink-0 overflow-x-auto hide-scrollbar">
          <button
            type="button"
            onClick={() => { setActiveTab('operator'); setIsRegistering(false); }}
            className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-md transition-all duration-200 whitespace-nowrap ${activeTab === 'operator' ? 'bg-white shadow-sm text-[#0B1B32]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            S. Operativa
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('service_operator'); setIsRegistering(false); }}
            className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-md transition-all duration-200 whitespace-nowrap ${activeTab === 'service_operator' ? 'bg-white shadow-sm text-[#0B1B32]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Op. Servizi
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('workflow_expert'); setIsRegistering(false); }}
            className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-md transition-all duration-200 whitespace-nowrap ${activeTab === 'workflow_expert' ? 'bg-white shadow-sm text-[#0B1B32]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Exp. Workflow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-md transition-all duration-200 whitespace-nowrap ${activeTab === 'user' ? 'bg-white shadow-sm text-[#0B1B32]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Utente
          </button>
        </div>

        <div className={`w-16 h-16 shrink-0 ${activeTab === 'operator' ? 'bg-[#0B1B32]' : 'bg-[#1976d2]'} rounded-2xl flex items-center justify-center shadow-lg mb-6 transition-colors duration-300`}>
          <i className={`fas ${activeTab === 'operator' ? 'fa-shield-alt' : (isRegistering ? 'fa-user-plus' : 'fa-user')} text-white text-3xl`}></i>
        </div>

        <h1 className="text-2xl font-bold text-[#0B1B32] mb-1 tracking-wide text-center">
          {activeTab === 'operator' ? 'Sala Operativa' : (activeTab === 'service_operator' ? (isRegistering ? 'Registrazione' : 'Operatore Servizi') : (activeTab === 'workflow_expert' ? (isRegistering ? 'Registrazione' : 'Esperto Workflow') : (isRegistering ? 'Registrazione' : 'Consultazione')))}
        </h1>
        <p className={`text-xs ${activeTab === 'operator' ? 'text-[#1976d2]' : 'text-gray-500'} uppercase font-bold tracking-widest mb-6 transition-colors text-center`}>
          {activeTab === 'operator' ? 'Accesso Autorizzato' : (isRegistering ? 'Crea un Account' : 'Accesso Esterno')}
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3 rounded text-sm font-medium mb-6 flex items-center gap-2 border border-red-100">
            <i className="fas fa-exclamation-circle shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">

          {activeTab === 'user' && isRegistering && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Inserisci nome"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cognome</label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Inserisci cognome"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Inserisci email"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent transition-all"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={activeTab === 'operator' ? "Inserisci matricola" : "Scegli uno username"}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent transition-all"
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
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#1976d2] hover:bg-[#1565c0] text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className={activeTab === 'user' && isRegistering ? "fas fa-user-plus" : "fas fa-sign-in-alt"}></i>}
            {loading ? 'Attendere...' : (activeTab === 'user' && isRegistering ? 'Registrati' : 'Accedi al Sistema')}
          </button>
        </form>

        {activeTab === 'user' && (
          <div className="mt-6 text-sm text-center">
            {isRegistering ? (
              <p className="text-gray-500">
                Hai già un account?{' '}
                <button type="button" onClick={() => setIsRegistering(false)} className="text-[#1976d2] font-bold hover:underline">
                  Accedi
                </button>
              </p>
            ) : (
              <p className="text-gray-500">
                Non hai un account?{' '}
                <button type="button" onClick={() => setIsRegistering(true)} className="text-[#1976d2] font-bold hover:underline">
                  Registrati
                </button>
              </p>
            )}
          </div>
        )}

        <div className="mt-8 text-[11px] text-gray-400 text-center uppercase tracking-widest shrink-0">
          Sistema Centralizzato Gestione Emergenze<br />FARO © 2026
        </div>
      </div>
    </div>
  );
}
