import { useState } from 'react';
import { ORCHESTRATOR_URL, fetchWithAuth } from '../config.js';
import { X, Save, AlertTriangle } from 'lucide-react';

export default function WorkflowModal({ onClose, onWorkflowCreated }) {
  const [formData, setFormData] = useState({
    processKey: '',
    eventType: 'FIRE',
    severity: 'MEDIUM',
    version: '1.0',
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // API call to create workflow
      const response = await fetchWithAuth(`${ORCHESTRATOR_URL}/api/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Errore durante la creazione del workflow.');
      }
      
      const newWorkflow = await response.json();
      onWorkflowCreated(newWorkflow);
      onClose();
    } catch (err) {
      console.error(err);
      // Fallback in caso di backend offline
      setError('Backend non disponibile. Creazione workflow mock.');
      setTimeout(() => {
        onWorkflowCreated({ 
          id: `wf-${Math.floor(Math.random()*1000)}`, 
          ...formData, 
          status: formData.enabled ? 'ACTIVE' : 'INACTIVE',
          lastUpdated: new Date().toLocaleString()
        });
        onClose();
      }, 1500);
    } finally {
      // In a real app we might not want to set loading to false if we navigate away, but here it's fine.
      if (!error) setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0B1B32] p-5 flex justify-between items-center text-white">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <i className="fas fa-project-diagram text-[#6ea8fe]"></i> Registra Nuovo Piano
            </h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Definizione Workflow BPMN</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs font-bold rounded border border-yellow-200 flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-yellow-600" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Process Key (BPMN)</label>
              <input 
                type="text" 
                name="processKey"
                value={formData.processKey}
                onChange={handleChange}
                placeholder="es. GESTIONE_INCENDIO_V1"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Event Type</label>
                <select 
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                >
                  <option value="FIRE">FIRE (Incendio)</option>
                  <option value="FLOOD">FLOOD (Allagamento)</option>
                  <option value="CAR_CRASH">CAR_CRASH (Incidente)</option>
                  <option value="HEALTH_CRISIS">HEALTH_CRISIS (Sanitaria)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Severity Base</label>
                <select 
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                >
                  <option value="LOW">LOW (Bassa)</option>
                  <option value="MEDIUM">MEDIUM (Media)</option>
                  <option value="HIGH">HIGH (Alta)</option>
                  <option value="CRITICAL">CRITICAL (Critica)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Versione</label>
              <input 
                type="text" 
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="es. 1.0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] font-mono"
              />
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded border border-gray-200 mt-2">
              <input 
                type="checkbox" 
                id="enabled"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                className="w-4 h-4 text-[#1976d2] rounded focus:ring-[#1976d2]"
              />
              <label htmlFor="enabled" className="text-sm font-semibold text-[#0B1B32] cursor-pointer">
                Imposta come Attivo immediatamente
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#1976d2] rounded hover:bg-[#1565c0] transition-colors flex items-center gap-2 shadow-sm"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <Save className="w-4 h-4" />} 
              {loading ? 'Salvataggio...' : 'Registra Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
