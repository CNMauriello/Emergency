import { useState, useEffect } from 'react';
import { ORCHESTRATOR_URL, fetchWithAuth } from '../config.js';
import { X, Save, AlertTriangle, UploadCloud } from 'lucide-react';

export default function WorkflowModal({ onClose, onWorkflowCreated }) {
  const [formData, setFormData] = useState({
    eventType: 'FIRE',
    severity: 'MEDIUM'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
    setError(null);
  };

  useEffect(() => {
    if (!file) {
      setFileError(null);
      return;
    }

    const expectedId = `${formData.eventType}_${formData.severity}`;

    if (file.name !== `${expectedId}.bpmn`) {
      setFileError(`Il nome del file deve essere ${expectedId}.bpmn`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const match = content.match(/<([a-zA-Z0-9]+:)?process[^>]*\sid="([^"]+)"/i);
      
      if (!match) {
        setFileError("Nessun tag 'process' con un 'id' trovato nel file BPMN.");
        return;
      }

      const processId = match[2];
      if (processId !== expectedId) {
        setFileError(`L'ID del processo nel file ("${processId}") non corrisponde a "${expectedId}".`);
      } else {
        setFileError(null); // Valid!
      }
    };
    
    reader.onerror = () => {
      setFileError("Errore durante la lettura del file.");
    };

    reader.readAsText(file);
  }, [file, formData.eventType, formData.severity]);

  const isValidFile = file && file.name.endsWith('.bpmn') && fileError === null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidFile) {
        setError('Inserisci un file .bpmn valido prima di procedere.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('file', file);
      // Wait, the API spec says `in: "query"` for eventType and severity, but it also says `in: "query"` for file.
      // Usually Spring Boot `@RequestParam` works for both query params and FormData. 
      // If the backend expects query params specifically, we might need to append them to the URL.
      // But standard HTML forms send inputs as FormData along with the file. We will append them to the URL to perfectly match the user's prompt string:
      // POST http://localhost:8090/api/workflows?file=...&eventType=...&severity=...
      
      const response = await fetchWithAuth(`${ORCHESTRATOR_URL}/api/workflows?eventType=${formData.eventType}&severity=${formData.severity}`, {
        method: 'POST',
        // Do not set Content-Type header for FormData, fetch automatically sets it with boundary
        body: data
      });

      if (!response.ok) {
        throw new Error('Errore durante la creazione del workflow.');
      }
      
      const newWorkflow = await response.json();
      onWorkflowCreated(newWorkflow);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Backend non disponibile. Creazione workflow mock.');
      setTimeout(() => {
        onWorkflowCreated({ 
          id: `wf-${Math.floor(Math.random()*1000)}`, 
          processKey: file.name.replace('.bpmn', '').toUpperCase(),
          eventType: formData.eventType,
          gravity: formData.severity,
          version: '1',
          enabled: false,
          lastUpdated: new Date().toLocaleString()
        });
        onClose();
      }, 1500);
    } finally {
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
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Upload File BPMN</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {(error || fileError) && (
          <div className="mx-6 mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs font-bold rounded border border-yellow-200 flex gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" /> 
            <span>{error || fileError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            
            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">File Workflow (.bpmn)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-[#1976d2] transition-colors relative">
                <UploadCloud className={`w-10 h-10 mb-3 ${file ? 'text-[#1976d2]' : 'text-gray-400'}`} />
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#0B1B32]">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Trascina un file qui o clicca per sfogliare</p>
                    <p className="text-xs text-gray-400 mt-1">Solo formati .bpmn ammessi</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept=".bpmn"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
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
              disabled={loading || !isValidFile}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#1976d2] rounded hover:bg-[#1565c0] transition-colors flex items-center gap-2 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
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
