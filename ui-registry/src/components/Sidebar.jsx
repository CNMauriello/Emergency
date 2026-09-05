export default function Sidebar({ currentView, setCurrentView }) {
  return (
    <aside className="w-[280px] bg-[#0B1B32] text-white flex flex-col h-full flex-shrink-0 shadow-lg z-10 font-sans">
      {/* Profilo Utente / Logo */}
      <div className="p-6 pt-10 border-b border-white/5 flex flex-col items-center gap-3">
        {/* Avatar Placeholder */}
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 border-white/10 shadow-sm bg-gray-500">
          <img src="https://i.pravatar.cc/150?img=47" alt="User" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <h1 className="font-bold text-lg tracking-wide text-white">Sala Operativa</h1>
          <p className="text-[10px] text-[#6ea8fe] uppercase tracking-wider leading-tight mt-1 font-semibold">Centralized Emergency Mgmt</p>
        </div>
      </div>
      
      {/* Navigazione */}
      <nav className="flex-1 py-8 space-y-1">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentView('active'); }}
          className={`flex items-center gap-4 px-6 py-3 transition-colors ${
            currentView === 'active' || currentView === 'detail'
              ? 'border-l-4 border-[#6ea8fe] bg-white/5 text-white font-semibold'
              : 'border-l-4 border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <i className="fas fa-exclamation-triangle w-5 text-center text-[15px]"></i> 
          <span className="text-[15px]">Active Emergencies</span>
        </a>

        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setCurrentView('history'); }}
          className={`flex items-center gap-4 px-6 py-3 transition-colors ${
            currentView === 'history'
              ? 'border-l-4 border-[#6ea8fe] bg-white/5 text-white font-semibold'
              : 'border-l-4 border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <i className="fas fa-history w-5 text-center text-[15px]"></i> 
          <span className="text-[15px]">History</span>
        </a>

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentView('directory'); }}
          className={`flex items-center gap-4 px-6 py-3 transition-colors ${
            currentView === 'directory'
              ? 'border-l-4 border-[#6ea8fe] bg-white/5 text-white font-semibold' 
              : 'border-l-4 border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <i className="fas fa-folder-open w-5 text-center text-[15px]"></i> 
          <span className="text-[15px]">Resource Directory</span>
        </a>

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentView('workflows'); }}
          className={`flex items-center gap-4 px-6 py-3 transition-colors ${
            currentView === 'workflows'
              ? 'border-l-4 border-[#6ea8fe] bg-white/5 text-white font-semibold' 
              : 'border-l-4 border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <i className="fas fa-project-diagram w-5 text-center text-[15px]"></i> 
          <span className="text-[15px]">Workflows</span>
        </a>

        <a 
          href="#" 
          className="flex items-center gap-4 px-6 py-3 border-l-4 border-transparent text-gray-400 hover:bg-white/5 hover:text-white transition-colors mt-6"
        >
          <i className="far fa-user-circle w-5 text-center text-[15px]"></i> 
          <span className="text-[15px]">Profile</span>
        </a>
      </nav>

      {/* Footer Area (New Incident) */}
      <div className="p-6 mt-auto">
        <button className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-md text-sm mb-6 transition-colors flex items-center justify-center gap-2 border border-white/10">
           <i className="fas fa-plus"></i> NEW INCIDENT
        </button>
        <div className="flex items-center gap-3 bg-[#071324] p-3 rounded-lg border border-white/5">
          <div className="w-8 h-8 rounded-full overflow-hidden">
             <img src="https://i.pravatar.cc/150?img=47" alt="User small" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs text-white font-bold tracking-wide">Op. ID: 8942</div>
            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">Turno A <span className="w-1 h-1 rounded-full bg-gray-500"></span> Offline</div>
          </div>
          <button className="ml-auto text-gray-400 hover:text-white"><i className="fas fa-sign-out-alt text-xs"></i></button>
        </div>
      </div>
    </aside>
  )
}

