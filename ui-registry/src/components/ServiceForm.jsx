import { useEffect, useState } from 'react'
import { API_BASE_URL, fetchWithAuth } from '../config.js'

const INITIAL_FORM = {
  type: 'FIRE_STATION',
  status: 'UP',
  endpoint: '',
  latitude: '',
  longitude: '',
  capabilities: [],
}

export default function ServiceForm({ onServiceRegistered, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [capabilities, setCapabilities] = useState([])
  const [loadingCapabilities, setLoadingCapabilities] = useState(true)
  const [capabilityError, setCapabilityError] = useState(false)
  const [showCapabilities, setShowCapabilities] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // =========================
  // CARICA CAPABILITY
  // =========================
  useEffect(() => {
    const loadCapabilities = async () => {
      try {
        setLoadingCapabilities(true)
        setCapabilityError(false)

        const response = await fetchWithAuth(`${API_BASE_URL}/Registry/api/capabilities`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        setCapabilities(data)
      } catch (error) {
        console.error(
          'Errore durante il recupero delle capability:',
          error
        )

        setCapabilityError(true)
      } finally {
        setLoadingCapabilities(false)
      }
    }

    loadCapabilities()
  }, [])

  // =========================
  // CAMPI NORMALI
  // =========================
  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  // =========================
  // SELEZIONE CAPABILITY
  // =========================
  const toggleCapability = (name) => {
    setForm((prev) => {
      const alreadySelected = prev.capabilities.includes(name)

      return {
        ...prev,
        capabilities: alreadySelected
          ? prev.capabilities.filter((c) => c !== name)
          : [...prev.capabilities, name],
      }
    })
  }

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.capabilities.length === 0) {
      alert('Seleziona almeno una capability offerta!')
      return
    }

    const payload = {
      endpoint: form.endpoint,
      type: form.type,
      status: form.status,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      capabilities: form.capabilities,
      avgLatency: 0.0,
      currentLoad: 0.0,
    }

    setSubmitting(true)

    try {
      const url = `${API_BASE_URL}/Registry/api/services`
      
      const response = await fetchWithAuth(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert('Servizio registrato con successo!')

        setForm(INITIAL_FORM)

        setShowCapabilities(false)

        onServiceRegistered()
      } else {
        const err = await response.text()

        alert(
          `Errore dal backend (${response.status}): ${err}`
        )
      }
    } catch (error) {
      console.error(
        'Errore durante il salvataggio:',
        error
      )

      alert(
        'Impossibile comunicare con il server. Controlla la console.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Testo mostrato nel campo dropdown
  const capabilityLabel =
    form.capabilities.length === 0
      ? 'Seleziona capability...'
      : `${form.capabilities.length} capability selezionate`

  return (
    <div className="w-full bg-white border border-gray-200 rounded shadow-sm h-fit">
      
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-[14px] font-semibold text-[#0B1B32] flex items-center gap-2">
          <i className="fas fa-sliders-h text-gray-500"></i>
          Configurazione Servizio
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">
            MODO: NEW
          </span>
          {onClose && (
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 space-y-4"
      >
        {/* ROW 1: Tipo Servizio + Stato Operativo */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-600 mb-1">
              Tipo Servizio
            </label>
            <div className="relative">
              <select
                value={form.type}
                onChange={handleChange('type')}
                className="w-full bg-white border border-gray-300 rounded p-2 text-[13px] appearance-none outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800"
                required
              >
                <option value="FIRE_STATION">FIRE_STATION</option>
                <option value="HOSPITAL">HOSPITAL</option>
                <option value="POLICE">POLICE</option>
              </select>
              <i className="fas fa-chevron-down absolute right-2.5 top-2.5 text-gray-500 text-[10px] pointer-events-none"></i>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-600 mb-1">
              Stato Operativo
            </label>
            <div className="relative">
              <select
                value={form.status}
                onChange={handleChange('status')}
                className="w-full bg-white border border-gray-300 rounded p-2 text-[13px] appearance-none outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800"
                required
              >
                <option value="UP">UP (Active)</option>
                <option value="DOWN">DOWN (Offline)</option>
                <option value="DEGRADED">DEGRADED (Degraded)</option>
              </select>
              <i className="fas fa-chevron-down absolute right-2.5 top-2.5 text-gray-500 text-[10px] pointer-events-none"></i>
            </div>
          </div>
        </div>

        {/* ROW 2: REST Endpoint URL */}
        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            REST Endpoint URL
          </label>
          <input
            type="url"
            value={form.endpoint}
            onChange={handleChange('endpoint')}
            placeholder="es. http://caserma-01.local/engage"
            className="w-full bg-white border border-gray-300 rounded p-2 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
            required
          />
        </div>

        {/* ROW 3: Posizione Geografica */}
        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            Posizione Geografica
          </label>
          <div className="flex gap-4">
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={handleChange('latitude')}
              placeholder="Latitudine"
              className="flex-1 bg-white border border-gray-300 rounded p-2 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
              required
            />
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={handleChange('longitude')}
              placeholder="Longitudine"
              className="flex-1 bg-white border border-gray-300 rounded p-2 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
              required
            />
          </div>
          
          {/* MAP DISPLAY */}
          {(() => {
            const lat = parseFloat(form.latitude);
            const lon = parseFloat(form.longitude);
            const isValidCoordinates = !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

            if (isValidCoordinates) {
              return (
                <a 
                  href={`https://www.google.com/maps?q=${lat},${lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 block w-full h-40 bg-gray-100 rounded overflow-hidden shadow-inner border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer relative"
                  title="Apri su Google Maps"
                >
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    className="pointer-events-none"
                    src={`https://maps.google.com/maps?q=${lat},${lon}&z=14&output=embed`}
                    title="Mappa Posizione"
                  ></iframe>
                  <div className="absolute inset-0"></div>
                </a>
              );
            }

            return (
              <div className="mt-1.5 w-full h-20 bg-[#f2f7fd] border border-blue-100 rounded flex flex-col items-center justify-center relative overflow-hidden">
                <i className="fas fa-map-marker-alt text-xl text-[#8eb6f8]"></i>
                <button
                  type="button"
                  className="absolute bottom-2 right-2 bg-white text-[9px] font-bold px-2 py-1.5 rounded shadow-sm text-gray-700 tracking-wider hover:bg-gray-50"
                >
                  EXPAND MAP
                </button>
              </div>
            );
          })()}
        </div>

        {/* ROW 4: Capability Offerte */}
        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            Capability Offerte
          </label>

          {loadingCapabilities ? (
            <div className="text-sm text-gray-400">
              Caricamento capability...
            </div>
          ) : capabilityError ? (
            <div className="text-sm text-red-500">
              Errore.
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCapabilities((prev) => !prev)}
                className="w-full bg-white border border-gray-300 rounded p-2 text-[13px] flex items-center justify-between text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <span className={form.capabilities.length === 0 ? 'text-gray-400' : 'text-gray-800'}>
                  {capabilityLabel}
                </span>
                <i className={`fas ${showCapabilities ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-500 text-[10px]`}></i>
              </button>

              {showCapabilities && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                  {capabilities.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      Nessuna capability disponibile.
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {capabilities.map((cap) => {
                        const isSelected = form.capabilities.includes(cap.name)
                        return (
                          <label
                            key={cap.name}
                            className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              checked={isSelected}
                              onChange={() => toggleCapability(cap.name)}
                            />
                            <span className="text-[13px] text-gray-700 truncate">
                              {cap.name}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={submitting || loadingCapabilities || capabilityError}
          className="w-full bg-[#0B1B32] hover:bg-slate-800 text-white font-medium py-2.5 rounded transition disabled:opacity-50 text-[14px]"
        >
          {submitting ? 'Registrazione...' : 'Registra Servizio'}
        </button>
      </form>
    </div>
  )
}
