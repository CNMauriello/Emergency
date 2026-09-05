import { useState, useEffect } from 'react';
import { OPERATOR_SERVICE_URL, fetchWithAuth } from '../config.js';
import { X, Download, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export default function AuditLogModal({ emergencyId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${OPERATOR_SERVICE_URL}/api/audit/${emergencyId}`);
        if (!response.ok) {
          throw new Error('Impossibile recuperare i log di audit.');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
        // Fallback mock
        setLogs([
          { id: 1, timestamp: '2023-11-20T18:45:00', operator: 'OP-8942', action: 'EMERGENCY_CLOSED', details: 'Chiusura intervento', outcome: 'SUCCESS', override: false },
          { id: 2, timestamp: '2023-11-20T17:30:12', operator: 'OP-8942', action: 'DISPATCH_TEAM', details: 'Invio squadra VVF-01', outcome: 'SUCCESS', override: false },
          { id: 3, timestamp: '2023-11-20T16:45:33', operator: 'SYSTEM', action: 'WORKFLOW_TRIGGERED', details: 'Innesco processo INCENDIO_URBANO', outcome: 'SUCCESS', override: false },
          { id: 4, timestamp: '2023-11-20T16:40:05', operator: 'OP-7731', action: 'VALIDATION_OVERRIDE', details: 'Forzatura severità ad ALTA', outcome: 'WARNING', override: true },
        ]);
        setError('Dati caricati in modalità mock. Backend offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [emergencyId]);

  const handleExport = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(logs, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `audit_log_${emergencyId}.json`;
    link.click();
  };

  const getActionIcon = (outcome) => {
    switch (outcome) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'WARNING': return <ShieldAlert className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0B1B32] p-5 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#6ea8fe]" /> 
              Audit Log: Registro Immutabile Operazioni
            </h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Evento {emergencyId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tools */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="text-sm font-semibold text-gray-600">Tracciabilità e Conformità</div>
          <button 
            onClick={handleExport}
            disabled={loading || logs.length === 0}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-[#0B1B32] font-bold text-xs py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Esporta JSON
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs font-bold rounded border border-yellow-200 flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-yellow-600" /> {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <i className="fas fa-circle-notch fa-spin text-3xl mb-3 text-[#1976d2]"></i>
              <p className="text-sm font-medium">Recupero log sicuri in corso...</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  <div className="absolute -left-[11px] top-1 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                    {getActionIcon(log.outcome)}
                  </div>
                  
                  <div className={`bg-white border p-4 rounded-lg shadow-sm ${log.override ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="text-[11px] font-mono bg-blue-50 text-[#1976d2] px-2 py-0.5 rounded border border-blue-100">
                        {log.operator}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-[#0B1B32] mb-1">{log.action.replace(/_/g, ' ')}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{log.details}</p>
                    
                    {log.override && (
                      <div className="mt-3 text-[10px] uppercase font-bold text-yellow-700 bg-yellow-100 inline-block px-2 py-1 rounded">
                        <i className="fas fa-exclamation-triangle mr-1"></i> Override Manuale Rilevato
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
