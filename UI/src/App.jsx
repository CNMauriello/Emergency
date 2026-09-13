import { useCallback, useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import ServicesTable from './components/ServicesTable.jsx'
import ServiceForm from './components/ServiceForm.jsx'
import ActiveEmergencies from './components/ActiveEmergencies.jsx';
import EmergencyDetail from './components/EmergencyDetail.jsx';
import WorkflowsTable from './components/WorkflowsTable.jsx';
import History from './components/History.jsx';
import Login from './components/Login.jsx';
import Profile from './components/Profile.jsx';
import { API_BASE_URL, fetchWithAuth, getAuthUser, clearAuthSession } from './config.js';

export default function App() {
  const [user, setUser] = useState(getAuthUser());
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const getInitialView = (role) => {
    if (!role) return 'active';
    const r = role.toString().toUpperCase();
    if (r.includes('WORKFLOW_EXPERT')) return 'workflows';
    if (r.includes('SERVICE_OPERATOR')) return 'directory';
    return 'active';
  };
  const [currentView, setCurrentView] = useState(() => getInitialView(user?.ruolo)); 
  const [selectedEmergencyId, setSelectedEmergencyId] = useState(null)
  const [isServiceFormVisible, setIsServiceFormVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const loadServices = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/services`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setServices(data)
    } catch (err) {
      console.error('Error retrieving services:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setSearchQuery('') // Clear search on view change
    if (currentView === 'directory') {
      loadServices()
    }
  }, [currentView, loadServices])

  const handleViewDetail = (id) => {
    setSelectedEmergencyId(id)
    setCurrentView('detail')
  }

  const handleBackToList = () => {
    setSelectedEmergencyId(null)
    setCurrentView('active')
  }

  const handleServiceRegistered = () => {
    loadServices()
    setIsServiceFormVisible(false)
  }

  const handleLogout = useCallback(async () => {
    if (user && (user.id || user.matricola)) {
      try {
        await fetchWithAuth(`${API_BASE_URL}/api/operators/${user.id || user.matricola}/logout`, {
          method: 'PATCH'
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    clearAuthSession();
    setUser(null);
  }, [user]);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentView(getInitialView(loggedInUser?.ruolo || loggedInUser?.role));
  };

  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="bg-[#f4f7f6] text-gray-800 font-sans h-screen flex overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header currentView={currentView} user={user} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {currentView === 'directory' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-end shrink-0">
              <div>

                <h2 className="text-[28px] font-bold text-[#0B1B32]">Territorial Services Registry</h2>
                <p className="text-gray-500 mt-1">Management of operational units and monitoring of service status.</p>
              </div>
              <button
                onClick={() => setIsServiceFormVisible(!isServiceFormVisible)}
                className="bg-[#0B1B32] hover:bg-slate-800 text-white px-5 py-2.5 rounded text-sm font-medium shadow flex items-center gap-2 transition-colors"
              >
                <i className={`fas ${isServiceFormVisible ? 'fa-minus' : 'fa-plus'}`}></i>
                {isServiceFormVisible ? 'Close Form' : 'Register New Service'}
              </button>
            </div>

            <div className="px-8 pb-8 flex-1 overflow-y-auto flex gap-6">
              <div className="flex-1 flex flex-col gap-6">
                <ServicesTable
                  services={services.filter(s => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (s.name || '').toLowerCase().includes(q) ||
                           (s.type || '').toLowerCase().includes(q) ||
                           (s.status || '').toLowerCase().includes(q) ||
                           String(s.id || '').toLowerCase().includes(q);
                  })}
                  loading={loading}
                  error={error}
                  onRefresh={loadServices}
                  compactMode={isServiceFormVisible}
                />
              </div>

              {isServiceFormVisible && (
                <div className="w-96 flex flex-col shrink-0">
                  <ServiceForm onServiceRegistered={handleServiceRegistered} onClose={() => setIsServiceFormVisible(false)} />
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'active' && (
          <div className="flex-1 overflow-y-auto">
            <ActiveEmergencies onViewDetail={handleViewDetail} searchQuery={searchQuery} />
          </div>
        )}

        {currentView === 'history' && (
          <History searchQuery={searchQuery} />
        )}

        {currentView === 'workflows' && (
          <WorkflowsTable searchQuery={searchQuery} />
        )}

        {currentView === 'detail' && (
          <div className="flex-1 overflow-y-auto">
            <EmergencyDetail emergencyId={selectedEmergencyId} onBack={handleBackToList} userRole={user?.ruolo} />
          </div>
        )}

        {currentView === 'profile' && (
          <Profile />
        )}
      </main>
    </div>
  )
}
