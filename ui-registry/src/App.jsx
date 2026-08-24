import { useCallback, useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import ServicesTable from './components/ServicesTable.jsx'
import ServiceForm from './components/ServiceForm.jsx'
import { API_BASE_URL } from './config.js'

export default function App() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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

  return (
    <div className="bg-gray-50 text-gray-800 font-sans h-screen flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="p-6 flex-1 overflow-y-auto flex gap-6">
          <ServicesTable
            services={services}
            loading={loading}
            error={error}
            onRefresh={loadServices}
          />
          <ServiceForm onServiceRegistered={loadServices} />
        </div>
      </main>
    </div>
  )
}
