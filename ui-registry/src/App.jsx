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

    return (
        <div className="bg-gray-50 text-gray-800 font-sans h-screen flex overflow-hidden">
            {/* Passiamo lo stato alla sidebar per gestire i click */}
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />

                {/*CODICE ORIGINALE MOSTRATO QUANDO LA VISTA È 'directory' */}
                {currentView === 'directory' && (
                    <div className="p-6 flex-1 overflow-y-auto flex gap-6">
                        <ServicesTable
                            services={services}
                            loading={loading}
                            error={error}
                            onRefresh={loadServices}
                        />
                        <ServiceForm onServiceRegistered={loadServices} />
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
