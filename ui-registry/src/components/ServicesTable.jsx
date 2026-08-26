import { CategoryBadge, StatusBadge } from './Badges.jsx'

export default function ServicesTable({ services, loading, error, onRefresh }) {
  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-network-wired text-gray-500"></i> Registered Endpoints
        </h2>
        <button onClick={onRefresh} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          <i className="fas fa-sync-alt"></i> Aggiorna
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
            <th className="p-4 border-b font-medium">ID</th>
            <th className="p-4 border-b font-medium">Endpoint</th>
            <th className="p-4 border-b font-medium">Category</th>
            <th className="p-4 border-b font-medium">Status</th>
            <th className="p-4 border-b font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                Caricamento servizi in corso...
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-red-500 bg-red-50">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Errore di connessione al backend (Spring Boot non avviato o problema di CORS).
              </td>
            </tr>
          )}

          {!loading && !error && services.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                Nessun servizio registrato. Aggiungine uno usando il form.
              </td>
            </tr>
          )}

          {!loading && !error && services.map((s) => (
            <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
              <td className="p-4 text-sm font-medium text-gray-500">{s.id}</td>
              <td className="p-4 text-sm font-semibold">{s.endpoint}</td>
              <td className="p-4"><CategoryBadge category={s.type} /></td>
              <td className="p-4"><StatusBadge status={s.status} /></td>
              <td className="p-4 text-right space-x-2 text-gray-400">
                <button className="hover:text-blue-600"><i className="fas fa-pen"></i></button>
                <button className="hover:text-red-600"><i className="fas fa-trash"></i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
