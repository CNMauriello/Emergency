export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 text-center border-b border-slate-700">
        <h1 className="text-2xl font-bold">FARO</h1>
        <p className="text-xs text-slate-400 mt-1">Sala Operativa</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <a href="#" className="block p-3 rounded hover:bg-slate-800">
          <i className="fas fa-exclamation-triangle w-6"></i> Active Emergencies
        </a>
        <a href="#" className="block p-3 rounded hover:bg-slate-800">
          <i className="fas fa-history w-6"></i> History
        </a>
        <a href="#" className="block p-3 rounded bg-blue-600 text-white">
          <i className="fas fa-folder-open w-6"></i> Resource Directory
        </a>
      </nav>
    </aside>
  )
}
