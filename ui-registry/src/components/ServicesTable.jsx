import { useState } from 'react'
import { CategoryBadge, StatusBadge } from './Badges.jsx'
import { API_BASE_URL } from '../config.js'

export default function ServicesTable({
  services,
  loading,
  error,
  onRefresh,
}) {
  const [editingService, setEditingService] = useState(null)
  const [expandedService, setExpandedService] = useState(null)

  const [editStatus, setEditStatus] = useState('')
  const [editLatency, setEditLatency] = useState('')
  const [editLoad, setEditLoad] = useState('')
  const [saving, setSaving] = useState(false)

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare il servizio ${id}?`
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await onRefresh()
    } catch (err) {
      console.error(
        "Errore durante l'eliminazione del servizio:",
        err
      )

      alert('Errore durante l\'eliminazione del servizio.')
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setEditStatus(service.status)
    setEditLatency(service.avgLatency)
    setEditLoad(service.currentLoad)
  }

  const handleUpdate = async () => {
    if (!editingService) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/services/${editingService.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: editStatus,
            avgLatency: Number(editLatency),
            currentLoad: Number(editLoad),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setEditingService(null)

      await onRefresh()
    } catch (err) {
      console.error('Errore durante la modifica del servizio:', err)
      alert('Errore durante la modifica del servizio.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingService(null)
  }

  // Apre/chiude i dettagli della riga
  const handleRowClick = (serviceId) => {
    setExpandedService((current) =>
      current === serviceId ? null : serviceId
    )
  }

  return (
    <>
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <i className="fas fa-network-wired text-gray-500"></i>
            Registered Endpoints
          </h2>

          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <i className="fas fa-sync-alt"></i> Aggiorna
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
              <th className="p-4 border-b font-medium">
                ID
              </th>

              <th className="p-4 border-b font-medium">
                Endpoint
              </th>

              <th className="p-4 border-b font-medium">
                Category
              </th>

              <th className="p-4 border-b font-medium">
                Status
              </th>

              <th className="p-4 border-b font-medium">
                Latency
              </th>

              <th className="p-4 border-b font-medium">
                Load
              </th>

              <th className="p-4 border-b font-medium text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {/* LOADING */}
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-gray-500"
                >
                  Caricamento servizi in corso...
                </td>
              </tr>
            )}

            {/* ERROR */}
            {!loading && error && (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-red-500 bg-red-50"
                >
                  <i className="fas fa-exclamation-triangle mr-2"></i>

                  Errore di connessione al backend
                  (Spring Boot non avviato o problema di CORS).
                </td>
              </tr>
            )}

            {/* EMPTY */}
            {!loading &&
              !error &&
              services.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-4 text-center text-gray-500"
                  >
                    Nessun servizio registrato.
                    Aggiungine uno usando il form.
                  </td>
                </tr>
              )}

            {/* SERVICES */}
            {!loading &&
              !error &&
              services.map((s) => {
                const isExpanded = expandedService === s.id

                return (
                  <>
                    {/* =========================
                        RIGA SERVIZIO
                    ========================= */}
                    <tr
                      key={s.id}
                      onClick={() => handleRowClick(s.id)}
                      className={`border-b border-gray-100 cursor-pointer transition ${
                        isExpanded
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* ID */}
                      <td className="p-4 text-sm font-medium text-gray-500">
                        {s.id}
                      </td>

                      {/* ENDPOINT */}
                      <td className="p-4 text-sm font-semibold">
                        {s.endpoint}
                      </td>

                      {/* CATEGORY */}
                      <td className="p-4">
                        <CategoryBadge category={s.type} />
                      </td>

                      {/* STATUS */}
                      <td className="p-4">
                        <StatusBadge status={s.status} />
                      </td>

                      {/* LATENCY */}
                      <td className="p-4 text-sm">
                        <span className="font-medium text-gray-700">
                          {s.avgLatency}
                        </span>

                        <span className="text-gray-400 ml-1">
                          ms
                        </span>
                      </td>

                      {/* LOAD */}
                      <td className="p-4 text-sm">
                        <span className="font-medium text-gray-700">
                          {s.currentLoad}
                        </span>

                        <span className="text-gray-400 ml-1">
                          %
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td
                        className="p-4 text-right space-x-2 text-gray-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* EDIT */}
                        <button
                          onClick={() => handleEdit(s)}
                          className="hover:text-blue-600"
                          title="Modifica servizio"
                        >
                          <i className="fas fa-pen"></i>
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="hover:text-red-600"
                          title="Elimina servizio"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>

                    {/* =========================
                        DETTAGLI
                    ========================= */}
                    {isExpanded && (
                      <tr key={`${s.id}-details`}>
                        <td
                          colSpan={7}
                          className="bg-blue-50 border-b border-blue-100"
                        >
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <i className="fas fa-info-circle text-blue-500"></i>

                              <h3 className="font-semibold text-gray-700">
                                Dettagli servizio
                              </h3>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              {/* LATENCY */}
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <p className="text-xs text-gray-500 uppercase mb-1">
                                  Average Latency
                                </p>

                                <p className="text-xl font-semibold text-gray-800">
                                  {s.avgLatency}
                                  <span className="text-sm text-gray-400 ml-1">
                                    ms
                                  </span>
                                </p>
                              </div>

                              {/* LOAD */}
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <p className="text-xs text-gray-500 uppercase mb-1">
                                  Current Load
                                </p>

                                <p className="text-xl font-semibold text-gray-800">
                                  {s.currentLoad}
                                  <span className="text-sm text-gray-400 ml-1">
                                    %
                                  </span>
                                </p>
                              </div>

                              {/* CAPABILITIES */}
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <p className="text-xs text-gray-500 uppercase mb-2">
                                  Capabilities offerte
                                </p>

                                {s.capabilities &&
                                s.capabilities.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {s.capabilities.map(
                                      (capability) => (
                                        <span
                                          key={capability}
                                          className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                                        >
                                          {capability}
                                        </span>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-400">
                                    Nessuna capability
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* POSIZIONE */}
                            <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
                              <p className="text-xs text-gray-500 uppercase mb-2">
                                Posizione
                              </p>

                              <div className="flex gap-6 text-sm text-gray-700">
                                <span>
                                  <strong>Lat:</strong>{' '}
                                  {s.latitude}
                                </span>

                                <span>
                                  <strong>Lon:</strong>{' '}
                                  {s.longitude}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
          </tbody>
        </table>
      </div>

      {/* =========================
          MODALE EDIT
      ========================= */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Modifica servizio
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                ID servizio
              </p>

              <p className="font-semibold">
                {editingService.id}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Endpoint
              </p>

              <p className="font-semibold break-all">
                {editingService.endpoint}
              </p>
            </div>

            {/* STATUS */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>

              <select
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="UP">
                  UP
                </option>

                <option value="DOWN">
                  DOWN
                </option>

                <option value="DEGRADED">
                  DEGRADED
                </option>
              </select>
            </div>

            {/* LATENCY */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Latency
              </label>

              <input
                type="number"
                step="any"
                value={editLatency}
                onChange={(e) =>
                  setEditLatency(e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* LOAD */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Load
              </label>

              <input
                type="number"
                step="any"
                value={editLoad}
                onChange={(e) =>
                  setEditLoad(e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Annulla
              </button>

              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? 'Salvataggio...'
                  : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
