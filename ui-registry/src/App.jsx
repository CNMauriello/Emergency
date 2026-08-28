import { useCallback, useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import ServicesTable from './components/ServicesTable.jsx'
import ServiceForm from './components/ServiceForm.jsx'
// Importa le nuove pagine per le emergenze
import ActiveEmergencies from './components/ActiveEmergencies.jsx';
import EmergencyDetail from './components/EmergencyDetail.jsx';
import { API_BASE_URL } from './config.js'

export default function App() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // NUOVI STATI PER LA NAVIGAZIONE
  const [currentView, setCurrentView] = useState('directory') // mostriamo la tua directory di default
  const [selectedEmergencyId, setSelectedEmergencyId] = useState(null)
  const [isServiceFormVisible, setIsServiceFormVisible] = useState(false)

  const loadServices = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetch(`${API_BASE_URL}/services`)
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

  // NUOVE FUNZIONI DI NAVIGAZIONE
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
      {/* Passiamo lo stato alla sidebar per gestire i click */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />

        {/*CODICE ORIGINALE MOSTRATO QUANDO LA VISTA È 'directory' */}
        {currentView === 'directory' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Page Header */}
            <div className="px-8 py-6 flex justify-between items-end shrink-0">
              <div>
                <div className="text-gray-500 text-sm mb-1.5 flex items-center gap-2">
                  <span className="hover:underline cursor-pointer">Directory</span>
                  <i className="fas fa-chevron-right text-[10px]"></i>
                  <span className="text-gray-700">Registro Servizi</span>
                </div>
                <h2 className="text-[28px] font-bold text-[#0B1B32]">Registro Servizi del Territorio</h2>
              </div>
              <button
                onClick={() => setIsServiceFormVisible(!isServiceFormVisible)}
                className="bg-[#0B1B32] hover:bg-slate-800 text-white px-5 py-2.5 rounded text-sm font-medium shadow flex items-center gap-2 transition-colors"
              >
                <i className={`fas ${isServiceFormVisible ? 'fa-minus' : 'fa-plus'}`}></i>
                {isServiceFormVisible ? 'Chiudi Form' : 'Register New Service'}
              </button>
            </div>

            {/* Content Area */}
            <div className="px-8 pb-8 flex-1 overflow-y-auto flex gap-6">
              <div className="flex-1 flex flex-col gap-6">
                <ServicesTable
                  services={services}
                  loading={loading}
                  error={error}
                  onRefresh={loadServices}
                  compactMode={isServiceFormVisible}
                />

                {/* Network Integrity Card */}
                <div className="bg-[#0B1B32] text-white rounded-lg p-6 shadow-sm">
                  <p className="text-xs text-gray-400 tracking-widest mb-2 uppercase">Network Integrity</p>
                  <h3 className="text-base font-medium mb-1">Global Operational Sync</h3>
                  <p className="text-sm text-gray-400">All connected nodes reporting 99.8% stability across the metropolitan area.</p>
                </div>
              </div>

              {isServiceFormVisible && (
                <div className="flex-1 flex flex-col">
                  <ServiceForm onServiceRegistered={handleServiceRegistered} onClose={() => setIsServiceFormVisible(false)} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* NUOVA SCHERMATA: LISTA EMERGENZE */}
        {currentView === 'active' && (
          <div className="flex-1 overflow-y-auto">
            <ActiveEmergencies onViewDetail={handleViewDetail} />
          </div>
        )}

        {/* NUOVA SCHERMATA: DETTAGLIO EMERGENZA */}
        {currentView === 'detail' && (
          <div className="flex-1 overflow-y-auto">
            <EmergencyDetail emergencyId={selectedEmergencyId} onBack={handleBackToList} />
          </div>
        )}
      </main>
    </div>
  )
}
