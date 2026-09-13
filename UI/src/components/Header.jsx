import { useEffect, useState } from 'react'
import { Bell, Clock, Search, ChevronRight } from 'lucide-react'
import { API_BASE_URL, fetchWithAuth } from '../config.js'

export default function Header({ currentView, user, searchQuery, setSearchQuery }) {
  const [time, setTime] = useState('')
  const [hasActiveEmergencies, setHasActiveEmergencies] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      setTime(`${hh}:${mm}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000 * 30)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkEmergencies = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/emergencies`);
        if (response.ok) {
          const data = await response.json();
          const active = data ? data.filter(e => (e.status || '').toUpperCase() !== 'CLOSED') : [];
          setHasActiveEmergencies(active.length > 0);
        }
      } catch (err) {
        console.error('Error checking active emergencies:', err);
      }
    };
    checkEmergencies();
    const emergencyInterval = setInterval(checkEmergencies, 1000 * 30);
    return () => clearInterval(emergencyInterval);
  }, []);

  const getViewName = () => {
    switch (currentView) {
      case 'active': return 'Active Emergencies'
      case 'history': return 'Emergency History'
      case 'directory': return 'Resource Directory'
      case 'workflows': return 'Workflows'
      case 'detail': return 'Emergency Details'
      case 'profile': return 'User Profile'
      default: return 'Dashboard'
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-3.5 flex justify-between items-center shrink-0 shadow-sm z-10 relative">
      {/* Breadcrumbs / Page Title */}
      <div className="flex flex-col">
        <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
          <span>FARO</span>
          <ChevronRight className="w-3 h-3" strokeWidth={3} />
          <span className="text-[#6ea8fe]">{getViewName()}</span>
        </div>
        <h1 className="text-xl font-bold text-[#0B1B32] leading-tight">
          {getViewName()}
        </h1>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-6">
        {/* Search Bar (Visual Only) */}
        {currentView !== 'profile' && (
          <div className="hidden md:flex relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#6ea8fe] focus:ring-1 focus:ring-[#6ea8fe] sm:text-sm transition-colors"
              placeholder="Search something..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

        <div className="flex items-center gap-5">
          <span className="text-sm font-semibold text-gray-600 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-inner">
            <Clock className="w-4 h-4 text-[#6ea8fe]" /> {time}
          </span>
          <button className={`relative transition-colors ${hasActiveEmergencies ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-600'}`}>
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
