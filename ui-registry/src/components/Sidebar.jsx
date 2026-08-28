export default function Sidebar({ currentView, setCurrentView }) {
  return (
    <aside className="w-64 bg-[#0B1B32] text-white flex flex-col h-full flex-shrink-0 shadow-lg z-10">
      {/* Profilo Utente */}
      <div className="p-6 border-b border-white/10 flex items-center gap-4">
        {/* Avatar Placeholder */}
        <div className="w-10 h-10 rounded bg-gray-500 overflow-hidden shrink-0 border border-white/20">
          <img src="https://i.pravatar.cc/150?img=47" alt="User" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide">Sala Operativa</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight mt-1">Centralized<br/>Emergency Mgmt</p>
        </div>
      </div>
      
      {/* Navigazione */}
      <nav className="flex-1 py-6 space-y-2">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentView('active'); }}
          className={`mx-4 flex items-center gap-3 px-4 py-2.5 rounded transition-colors ${
            currentView === 'active' || currentView === 'detail'
              ? 'bg-[#6ea8fe] text-[#0B1B32] font-semibold'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <i className="fas fa-exclamation-triangle w-5 text-center text-sm"></i> 
          <span className="text-sm">Active Emergencies</span>
        </a>

        <a href="#" className="mx-4 flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors rounded">
          <i className="fas fa-history w-5 text-center text-sm"></i> 
          <span className="text-sm">History</span>
        </a>

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentView('directory'); }}
          className={`mx-4 flex items-center gap-3 px-4 py-2.5 rounded transition-colors ${
            currentView === 'directory'
              ? 'bg-[#6ea8fe] text-[#0B1B32] font-semibold' 
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <i className="fas fa-folder-open w-5 text-center text-sm"></i> 
          <span className="text-sm">Resource Directory</span>
        </a>

        <a href="#" className="mx-4 flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors rounded mt-4">
          <i className="far fa-user-circle w-5 text-center text-sm"></i> 
          <span className="text-sm">Profile</span>
        </a>
      </nav>

      {/* Footer Area (New Incident) */}
      <div className="p-6 mt-auto">
        <button className="w-full bg-[#0066cc] hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded text-sm mb-6 shadow flex items-center justify-center gap-2">
           <i className="fas fa-plus-circle"></i> NEW INCIDENT
        </button>
        <div className="text-xs text-gray-400 space-y-2">
          <div className="flex items-center gap-3">
            <i className="far fa-id-badge w-4 text-center"></i> Op. ID: 8942
          </div>
          <div className="flex items-center gap-3">
            <i className="far fa-clock w-4 text-center"></i> Turno A
          </div>
        </div>
      </div>
    </aside>
  )
}
