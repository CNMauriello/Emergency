import { useState } from 'react'
import { API_BASE_URL } from '../config.js'

const CAPABILITY_OPTIONS = [
  { value: 'FireSuppression', label: 'Antincendio Urbano' },
  { value: 'TechnicalRescue', label: 'Soccorso Tecnico' },
  { value: 'AirSupport', label: 'Supporto Aereo' },
  { value: 'MedicalAssistance', label: 'Emergenza Medica' },
]

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
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const toggleCapability = (value) => {
    setForm((prev) => {
      const has = prev.capabilities.includes(value)
      return {
        ...prev,
        capabilities: has
          ? prev.capabilities.filter((c) => c !== value)
          : [...prev.capabilities, value],
      }
    })
  }

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert('Servizio registrato con successo!')
        setForm(INITIAL_FORM)
        onServiceRegistered()
      } else {
        const err = await response.text()
        alert(`Errore dal backend (${response.status}): ${err}`)
      }
    } catch (error) {
      console.error('Errore durante il salvataggio:', error)
      alert('Impossibile comunicare con il server. Controlla la console.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-1/3 bg-white border border-gray-200 rounded-lg shadow-sm h-fit">
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-sliders-h text-gray-500"></i> Configurazione Servizio
        </h2>
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">MODO: NEW</span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo Servizio</label>
            <select
              value={form.type}
              onChange={handleChange('type')}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              required
            >
              <option value="FIRE_STATION">FIRE_STATION</option>
              <option value="HOSPITAL">HOSPITAL</option>
              <option value="POLICE">POLICE</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Stato Operativo</label>
            <select
              value={form.status}
              onChange={handleChange('status')}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              required
            >
              <option value="UP">UP (Active)</option>
              <option value="DOWN">DOWN (Offline)</option>
              <option value="BUSY">BUSY (Occupato)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">REST Endpoint URL</label>
          <input
            type="url"
            value={form.endpoint}
            onChange={handleChange('endpoint')}
            placeholder="es. http://caserma-01.local/engage"
            className="w-full border border-gray-300 rounded p-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Posizione Geografica</label>
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

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Capability Offerte</label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {CAPABILITY_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.capabilities.includes(opt.value)}
                  onChange={() => toggleCapability(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition shadow-sm disabled:opacity-50"
        >
          {submitting ? 'Registrazione in corso...' : 'Registra Servizio'}
        </button>
      </form>
    </div>
  )
}
