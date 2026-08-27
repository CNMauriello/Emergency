export default function Sidebar({ currentView, setCurrentView }) {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 text-center border-b border-slate-700">
        <h1 className="text-2xl font-bold">FARO</h1>
        <p className="text-xs text-slate-400 mt-1">Sala Operativa</p>
      </div>
        <nav className="flex-1 p-4 space-y-2">

            {/* Pulsante Active Emergencies */}
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); setCurrentView('active'); }}
                className={`block p-3 rounded ${
                    currentView === 'active' || currentView === 'detail'
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-800'
                }`}
            >
                <i className="fas fa-exclamation-triangle w-6"></i> Active Emergencies
            </a>

            {/* Pulsante History */}
            <a href="#" className="block p-3 rounded hover:bg-slate-800">
                <i className="fas fa-history w-6"></i> History
            </a>

            {/* Pulsante Resource Directory (IL TUO ORIGINALE) */}
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); setCurrentView('directory'); }}
                className={`block p-3 rounded ${
                    currentView === 'directory'
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-800'
                }`}
            >
                <i className="fas fa-folder-open w-6"></i> Resource Directory
            </a>

        </nav>
    </aside>
  )
}
