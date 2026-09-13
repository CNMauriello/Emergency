import { UserCircle, TriangleAlert, History, FolderOpen, Network, LogOut } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, user, onLogout }) {
  const role = (user?.ruolo || user?.role || '').toString().toUpperCase();
  const isRoomOperator = role.includes('ROOM_OPERATOR') || role === 'OPERATOR' || role === 'ROLE_ROOM_OPERATOR' || role === 'SUPERVISOR';
  const isUser = role === 'USER' || role === 'ROLE_USER';
  const isServiceOperator = role.includes('SERVICE_OPERATOR');
  const isWorkflowExpert = role.includes('WORKFLOW_EXPERT');

  return (
    <aside className="w-[280px] bg-gradient-to-b from-[#0B1B32] to-[#12233f] text-white flex flex-col h-full flex-shrink-0 shadow-lg z-10 font-sans border-r border-slate-800/50">
      {/* Profilo Utente / Logo */}
      <div className="p-6 pt-10 flex flex-col items-center gap-3">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center mb-2">
          <img src="/logo-bianco.png" alt="FARO Logo" className="h-full w-auto object-contain" />
        </div>
        <div className="text-center">
          <h1 className="font-bold text-lg tracking-wide text-white">Operations Center</h1>
          <p className="text-[10px] text-[#6ea8fe] uppercase tracking-wider leading-tight mt-1 font-semibold">Centralized Emergency Mgmt</p>
        </div>
      </div>

      {/* Navigazione */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {(isRoomOperator || isUser) && (
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setCurrentView('active'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'active' || currentView === 'detail'
                ? 'bg-[#6ea8fe]/15 text-[#6ea8fe] font-bold shadow-sm'
                : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
          >
            <TriangleAlert className={`w-5 h-5 ${currentView === 'active' || currentView === 'detail' ? 'text-[#6ea8fe]' : 'opacity-70'}`} />
            <span className="text-[14px]">Emergencies</span>
          </a>
        )}

        {isRoomOperator && (
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setCurrentView('history'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'history'
                ? 'bg-[#6ea8fe]/15 text-[#6ea8fe] font-bold shadow-sm'
                : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
          >
            <History className={`w-5 h-5 ${currentView === 'history' ? 'text-[#6ea8fe]' : 'opacity-70'}`} />
            <span className="text-[14px]">History</span>
          </a>
        )}

        {(isRoomOperator || isServiceOperator) && (
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setCurrentView('directory'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'directory'
                ? 'bg-[#6ea8fe]/15 text-[#6ea8fe] font-bold shadow-sm'
                : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
          >
            <FolderOpen className={`w-5 h-5 ${currentView === 'directory' ? 'text-[#6ea8fe]' : 'opacity-70'}`} />
            <span className="text-[14px]">Resource Directory</span>
          </a>
        )}

        {(isRoomOperator || isWorkflowExpert) && (
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setCurrentView('workflows'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'workflows'
                ? 'bg-[#6ea8fe]/15 text-[#6ea8fe] font-bold shadow-sm'
                : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
          >
            <Network className={`w-5 h-5 ${currentView === 'workflows' ? 'text-[#6ea8fe]' : 'opacity-70'}`} />
            <span className="text-[14px]">Workflows</span>
          </a>
        )}

        {isRoomOperator && (
          <>
            <div className="h-px bg-slate-700/50 my-4 mx-2"></div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setCurrentView('profile'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'profile'
                  ? 'bg-[#6ea8fe]/15 text-[#6ea8fe] font-bold shadow-sm'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`}
            >
              <UserCircle className={`w-5 h-5 ${currentView === 'profile' ? 'text-[#6ea8fe]' : 'opacity-70'}`} />
              <span className="text-[14px]">Profile</span>
            </a>
          </>
        )}
      </nav>

      {/* Footer Area */}
      <div className="p-4 mt-auto">
        {!isRoomOperator ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#071324] hover:bg-white/5 text-gray-300 hover:text-white py-3 rounded-xl border border-white/5 transition-colors font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-[#0a1526]/80 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-slate-700 shrink-0 shadow-inner">
              <UserCircle className="w-5 h-5 text-gray-300" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-bold tracking-wide truncate" title={user?.nome ? `${user.nome} ${user.cognome}` : 'Operator'}>
                {user?.nome ? `${user.nome} ${user.cognome}` : 'Operator'}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${user?.stato?.toLowerCase() === 'online' ? 'bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]' : user?.stato?.toLowerCase() === 'occupato' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
                {user?.stato || 'Offline'}
              </div>
            </div>
            <button onClick={onLogout} className="text-gray-400 hover:text-red-400 transition-colors p-1" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

