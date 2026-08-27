import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config.js'

const INITIAL_FORM = {
  type: 'FIRE_STATION',
  status: 'UP',
  endpoint: '',
  latitude: '',
  longitude: '',
  capabilities: [],
}

export default function ServiceForm({ onServiceRegistered }) {
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

        const response = await fetch(`${API_BASE_URL}/capabilities`)

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
      const response = await fetch(`${API_BASE_URL}/services`, {
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
    <div className="w-1/3 bg-white border border-gray-200 rounded-lg shadow-sm h-fit">
      
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-sliders-h text-gray-500"></i>
          Configurazione Servizio
        </h2>

        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
          MODO: NEW
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 space-y-4"
      >

        {/* =========================
            TIPO + STATO
        ========================= */}
        <div className="flex gap-4">

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Tipo Servizio
            </label>

            <select
              value={form.type}
              onChange={handleChange('type')}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              required
            >
              <option value="FIRE_STATION">
                FIRE_STATION
              </option>

              <option value="HOSPITAL">
                HOSPITAL
              </option>

              <option value="POLICE">
                POLICE
              </option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Stato Operativo
            </label>

            <select
              value={form.status}
              onChange={handleChange('status')}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              required
            >
              <option value="UP">
                UP (Active)
              </option>

              <option value="DOWN">
                DOWN (Offline)
              </option>

              <option value="DEGRADED">
                DEGRADED (Degraded)
              </option>
            </select>
          </div>

        </div>

        {/* =========================
            ENDPOINT
        ========================= */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            REST Endpoint URL
          </label>

          <input
            type="url"
            value={form.endpoint}
            onChange={handleChange('endpoint')}
            placeholder="es. http://caserma-01.local/engage"
            className="w-full border border-gray-300 rounded p-2 text-sm"
            required
          />
        </div>

        {/* =========================
            POSIZIONE
        ========================= */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Posizione Geografica
          </label>

          <div className="flex gap-4">

            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={handleChange('latitude')}
              placeholder="Latitudine"
              className="w-full border border-gray-300 rounded p-2 text-sm"
              required
            />

            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={handleChange('longitude')}
              placeholder="Longitudine"
              className="w-full border border-gray-300 rounded p-2 text-sm"
              required
            />

          </div>

          <div className="mt-2 w-full h-24 bg-blue-50 border border-blue-100 rounded flex items-center justify-center text-blue-300">
            <i className="fas fa-map-marker-alt text-2xl"></i>
          </div>
        </div>

        {/* =========================
            CAPABILITY DROPDOWN
        ========================= */}
        <div className="relative">

          <label className="block text-xs font-medium text-gray-500 mb-1">
            Capability Offerte
          </label>

          {loadingCapabilities ? (
            <div className="w-full border border-gray-300 rounded p-2 text-sm text-gray-400">
              Caricamento capability...
            </div>
          ) : capabilityError ? (
            <div className="w-full border border-red-300 bg-red-50 rounded p-2 text-sm text-red-500">
              Errore nel caricamento delle capability.
            </div>
          ) : (
            <>
              {/* CAMPO DROPDOWN */}
              <button
                type="button"
                onClick={() =>
                  setShowCapabilities((prev) => !prev)
                }
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-left flex items-center justify-between hover:border-blue-400"
              >
                <span
                  className={
                    form.capabilities.length === 0
                      ? 'text-gray-400'
                      : 'text-gray-800'
                  }
                >
                  {capabilityLabel}
                </span>

                <i
                  className={`fas ${
                    showCapabilities
                      ? 'fa-chevron-up'
                      : 'fa-chevron-down'
                  } text-gray-400`}
                ></i>
              </button>

              {/* MENU */}
              {showCapabilities && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">

                  {capabilities.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      Nessuna capability disponibile.
                    </div>
                  ) : (
                    capabilities.map((capability) => {

                      const selected =
                        form.capabilities.includes(
                          capability.name
                        )

                      return (
                        <button
                          type="button"
                          key={capability.name}
                          onClick={() =>
                            toggleCapability(
                              capability.name
                            )
                          }
                          className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-blue-50 ${
                            selected
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700'
                          }`}
                        >
                          <span>
                            {capability.name}
                          </span>

                          {selected && (
                            <i className="fas fa-check text-blue-600"></i>
                          )}
                        </button>
                      )
                    })
                  )}

                </div>
              )}

              {/* CAPABILITY SELEZIONATE */}
              {form.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">

                  {form.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                      {capability}

                      <button
                        type="button"
                        onClick={() =>
                          toggleCapability(capability)
                        }
                        className="text-blue-500 hover:text-red-500"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}

                </div>
              )}
            </>
          )}
        </div>

        {/* =========================
            SUBMIT
        ========================= */}
        <button
          type="submit"
          disabled={
            submitting ||
            loadingCapabilities ||
            capabilityError
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition shadow-sm disabled:opacity-50"
        >
          {submitting
            ? 'Registrazione in corso...'
            : 'Registra Servizio'}
        </button>

      </form>
    </div>
  )
}
