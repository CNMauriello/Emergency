import { useCallback, useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import ServicesTable from './components/ServicesTable.jsx'
import ServiceForm from './components/ServiceForm.jsx'
import ActiveEmergencies from './components/ActiveEmergencies.jsx';
import EmergencyDetail from './components/EmergencyDetail.jsx';
import WorkflowsTable from './components/WorkflowsTable.jsx';
import History from './components/History.jsx';
import { API_BASE_URL, fetchWithAuth } from './config.js';

export default function App() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Default to active emergencies as it is usually the starting page for operations
  const [currentView, setCurrentView] = useState('active') 
  const [selectedEmergencyId, setSelectedEmergencyId] = useState(null)
  const [isServiceFormVisible, setIsServiceFormVisible] = useState(false)

  const loadServices = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/Registry/api/services`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setServices(data)
    } catch (err) {
      console.error('Errore durante il recupero dei servizi:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServices()
  }, [loadServices])

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

  return (
    <div className="bg-[#f4f7f6] text-gray-800 font-sans h-screen flex overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />

        {currentView === 'directory' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-end shrink-0">
              <div>
                <div className="text-gray-500 text-sm mb-1.5 flex items-center gap-2">
                  <span className="hover:underline cursor-pointer" onClick={() => setCurrentView('active')}>FARO</span>
                  <i className="fas fa-chevron-right text-[10px]"></i>
                  <span className="text-gray-700">Risorse</span>
                </div>
                <h2 className="text-[28px] font-bold text-[#0B1B32]">Registro Servizi Territoriali</h2>
                <p className="text-gray-500 mt-1">Gestione delle unità operative e monitoraggio dello stato dei servizi.</p>
              </div>
              <button
                onClick={() => setIsServiceFormVisible(!isServiceFormVisible)}
                className="bg-[#0B1B32] hover:bg-slate-800 text-white px-5 py-2.5 rounded text-sm font-medium shadow flex items-center gap-2 transition-colors"
              >
                <i className={`fas ${isServiceFormVisible ? 'fa-minus' : 'fa-plus'}`}></i>
                {isServiceFormVisible ? 'Chiudi Form' : 'Registra Nuovo Servizio'}
              </button>
            </div>

            <div className="px-8 pb-8 flex-1 overflow-y-auto flex gap-6">
              <div className="flex-1 flex flex-col gap-6">
                <ServicesTable
                  services={services}
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
            <ActiveEmergencies onViewDetail={handleViewDetail} />
          </div>
        )}

        {currentView === 'history' && (
          <History />
        )}

        {currentView === 'workflows' && (
          <WorkflowsTable />
        )}

        {currentView === 'detail' && (
          <div className="flex-1 overflow-y-auto">
            <EmergencyDetail emergencyId={selectedEmergencyId} onBack={handleBackToList} />
          </div>
        )}
      </main>
    </div>
  )
}
