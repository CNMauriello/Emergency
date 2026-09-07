import React, { useState, Fragment } from 'react'
import { CategoryBadge, StatusBadge } from './Badges.jsx'
import { API_BASE_URL, fetchWithAuth } from '../config.js'

export default function ServicesTable({
  services,
  loading,
  error,
  onRefresh,
  compactMode,
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
      const response = await fetchWithAuth(`${API_BASE_URL}/api/services/${id}`, {
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
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/services/${editingService.id}`,
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
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-[#0B1B32] flex items-center gap-3">
            Catalogo Servizi
          </h2>

          <div className="flex items-center gap-3">
            <span className="bg-[#e3f2fd] text-[#1976d2] text-[12px] font-bold px-3 py-1 rounded-full">
              {services.length} Totali
            </span>
            <button
              onClick={onRefresh}
              className="text-gray-400 hover:text-[#0B1B32] transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              title="Aggiorna"
            >
              <i className="fas fa-sync-alt text-[12px]"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-gray-50/95 backdrop-blur z-10 shadow-sm border-b border-gray-200">
              <tr className="text-gray-500 text-[11px] font-bold tracking-wider uppercase">
              <th className="px-6 py-4 font-bold text-[#0B1B32]">
                ID
              </th>

              <th className="px-6 py-4 font-bold text-[#0B1B32]">
                ENDPOINT
              </th>

              <th className="px-6 py-4 font-bold text-[#0B1B32]">
                CATEGORY
              </th>

              <th className="px-6 py-4 font-bold text-[#0B1B32]">
                STATUS
              </th>

              {!compactMode && (
                <>
                  <th className="px-6 py-4 font-bold text-[#0B1B32]">
                    LATENCY
                  </th>

                  <th className="px-6 py-4 font-bold text-[#0B1B32]">
                    LOAD
                  </th>
                </>
              )}

              <th className="px-6 py-4 font-bold text-[#0B1B32] text-right">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody>
            {/* LOADING */}
            {loading && (
              <tr>
                <td
                  colSpan={compactMode ? 5 : 7}
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
                  colSpan={compactMode ? 5 : 7}
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
                    colSpan={compactMode ? 5 : 7}
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
                  <Fragment key={s.id}>
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
                      <td className="px-6 py-5 text-[13px] font-bold text-[#1976d2]">
                        {s.id}
                      </td>

                      {/* ENDPOINT */}
                      <td className="px-6 py-5 text-[13px] font-bold text-[#0B1B32] max-w-[200px] truncate" title={s.endpoint}>
                        {s.endpoint}
                      </td>

                      {/* CATEGORY */}
                      <td className="px-6 py-5">
                        <CategoryBadge category={s.type} />
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <StatusBadge status={s.status} />
                      </td>

                      {/* COMPACT MODE OFF (LATENCY/LOAD) */}
                      {!compactMode && (
                        <>
                          <td className="px-6 py-5 text-sm">
                            <span className="font-bold text-[#0B1B32]">
                              {s.avgLatency}
                            </span>
                            <span className="text-gray-400 ml-1">
                              ms
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm">
                            <span className="font-bold text-[#0B1B32]">
                              {s.currentLoad}
                            </span>
                            <span className="text-gray-400 ml-1">
                              %
                            </span>
                          </td>
                        </>
                      )}

                      {/* ACTIONS */}
                      <td
                        className="px-6 py-5 text-right space-x-4 text-gray-500 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* EDIT */}
                        <button
                          onClick={() => handleEdit(s)}
                          className="hover:text-[#0B1B32] transition-colors"
                          title="Modifica servizio"
                        >
                          <i className="fas fa-pen"></i>
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="hover:text-red-600 transition-colors"
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
                          colSpan={compactMode ? 5 : 7}
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

                                <p className={`${compactMode ? 'text-base' : 'text-xl'} font-semibold text-gray-800 truncate`} title={`${s.avgLatency} ms`}>
                                  {s.avgLatency}
                                  <span className={`${compactMode ? 'text-xs' : 'text-sm'} text-gray-400 ml-1`}>
                                    ms
                                  </span>
                                </p>
                              </div>

                              {/* LOAD */}
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <p className="text-xs text-gray-500 uppercase mb-1">
                                  Current Load
                                </p>

                                <p className={`${compactMode ? 'text-base' : 'text-xl'} font-semibold text-gray-800 truncate`} title={`${s.currentLoad} %`}>
                                  {s.currentLoad}
                                  <span className={`${compactMode ? 'text-xs' : 'text-sm'} text-gray-400 ml-1`}>
                                    %
                                  </span>
                                </p>
                              </div>

                              {/* POSIZIONE */}
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <p className="text-xs text-gray-500 uppercase mb-1">
                                  Posizione
                                </p>

                                <div className={`${compactMode ? 'text-sm' : 'text-xl'} font-semibold text-gray-800 flex flex-col gap-1 break-all`}>
                                  <div><span className="text-xs text-gray-500 font-normal">Lat:</span> {s.latitude}</div>
                                  <div><span className="text-xs text-gray-500 font-normal">Lon:</span> {s.longitude}</div>
                                </div>
                              </div>
                            </div>

                            {/* CAPABILITIES */}
                            <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
                              <p className="text-xs text-gray-500 uppercase mb-3">
                                Capabilities offerte
                              </p>

                              {s.capabilities &&
                              s.capabilities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {s.capabilities.map(
                                    (capability) => (
                                      <span
                                        key={capability}
                                        className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1.5 rounded text-[11px] font-bold tracking-wider"
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
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
          </tbody>
        </table>
      </div>
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
