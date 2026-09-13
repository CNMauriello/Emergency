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
          if (response.status === 409) throw new Error('Username or Email already in use.');
          if (response.status === 401) throw new Error('Invalid data (e.g. email format).');
          throw new Error('Error during registration.');
        }

        // Registrazione ok, torna al login
        setIsRegistering(false);
        setPassword('');
        setError(null);
        alert('Registration completed successfully! You can now log in.');
      } catch (err) {
        setError(err.message || 'Error during registration.');
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
        throw new Error('Invalid credentials or backend unreachable.');
      }

      let data = await response.json();

      // If access is via AuthMicroService, retrieve profile details
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

      // Verifica congruenza tra tab scelta e ruolo effettivo
      if (activeTab === 'workflow_expert' && data.user.ruolo !== 'ROLE_WORKFLOW_EXPERT') {
        throw new Error('Access denied: you are not a Workflow Expert.');
      }
      if (activeTab === 'service_operator' && data.user.ruolo !== 'ROLE_SERVICE_OPERATOR') {
        throw new Error('Access denied: you are not a Service Operator.');
      }
      if (activeTab === 'user' && data.user.ruolo !== 'ROLE_USER') {
        throw new Error('Access denied: use the tab corresponding to your role.');
      }

      // Save in sessionStorage for tab isolation
      setAuthTokens(data.accessToken, data.refreshToken);
      sessionStorage.setItem('operator_user', JSON.stringify(data.operatore || data.user || data));

      // Notifica App.jsx
      onLoginSuccess(data.operatore || data.user || data);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Error during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1B32] relative overflow-hidden z-0">
      {/* Sfondo tridimensionale / Luci centrali dietro il form */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0088cc]/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ml-20 mt-20 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      
      <div className="bg-white/95 backdrop-blur-3xl p-10 rounded-[2rem] shadow-[0_15px_50px_rgba(0,136,204,0.1)] w-[400px] border border-white/50 flex flex-col items-center max-h-[90vh] overflow-y-auto relative">
        {/* Toggle tabs */}
        <div className="flex w-full mb-8 bg-white/50 backdrop-blur-md rounded-lg p-1 relative z-10 shrink-0 overflow-x-auto hide-scrollbar border border-white/60">
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
            User
          </button>
        </div>

        <div className="w-auto h-16 shrink-0 flex items-center justify-center mb-6">
          <img src="/logo-blu.png" alt="FARO Logo" className="h-full w-auto object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-[#0B1B32] mb-1 tracking-wide text-center">
          {activeTab === 'operator' ? 'Operations Room' : (activeTab === 'service_operator' ? (isRegistering ? 'Registration' : 'Service Operator') : (activeTab === 'workflow_expert' ? (isRegistering ? 'Registration' : 'Workflow Expert') : (isRegistering ? 'Registration' : 'Consultation')))}
        </h1>
        <p className={`text-xs ${activeTab === 'operator' ? 'text-[#0B1B32]' : 'text-gray-500'} uppercase font-bold tracking-widest mb-6 transition-colors text-center`}>
          {activeTab === 'operator' ? 'Authorized Access' : (isRegistering ? 'Create an Account' : 'External Access')}
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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Surname</label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Enter surname"
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
                  placeholder="Enter email"
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
              placeholder={activeTab === 'operator' ? "Enter badge number" : "Choose a username"}
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
            className={`w-full bg-[#0B1B32] hover:bg-[#0B1B32] text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className={activeTab === 'user' && isRegistering ? "fas fa-user-plus" : "fas fa-sign-in-alt"}></i>}
            {loading ? 'Please wait...' : (activeTab === 'user' && isRegistering ? 'Register' : 'Login')}
          </button>
        </form>

        {activeTab === 'user' && (
          <div className="mt-6 text-sm text-center">
            {isRegistering ? (
              <p className="text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => setIsRegistering(false)} className="text-[#1976d2] font-bold hover:underline">
                  Accedi
                </button>
              </p>
            ) : (
              <p className="text-gray-500">
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsRegistering(true)} className="text-[#1976d2] font-bold hover:underline">
                  Registrati
                </button>
              </p>
            )}
          </div>
        )}

        <div className="mt-8 text-[11px] text-gray-400 text-center uppercase tracking-widest shrink-0">
          Centralized Emergency Management System<br />FARO © 2026
        </div>
      </div>
    </div>
  );
}
