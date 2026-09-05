import { useState, useEffect } from 'react';
import { API_BASE_URL, fetchWithAuth } from '../config.js';
import { Download, Search, CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react';
import AuditLogModal from './AuditLogModal.jsx';

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAuditEmergencyId, setSelectedAuditEmergencyId] = useState(null);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`${API_BASE_URL}/api/emergencies?status=CLOSED`);
            if (!response.ok) throw new Error('Failed to fetch history');
            const data = await response.json();
            setHistory(data);
        } catch (err) {
            console.error('Error fetching history:', err);
            // Fallback for demonstration when backend is not ready or has no closed emergencies
            setHistory([
                { id: 'E-8821', eventType: 'INCENDIO_URBANO', closedAt: '2023-11-20 18:45', duration: '2h 15m', resolution: 'RESOLVED' },
                { id: 'E-8822', eventType: 'INCIDENTE_STRADALE', closedAt: '2023-11-20 16:30', duration: '45m', resolution: 'RESOLVED' },
                { id: 'E-8825', eventType: 'ALLARME_INTRUSIONE', closedAt: '2023-11-20 14:10', duration: '12m', resolution: 'FALSE_ALARM' },
                { id: 'E-8829', eventType: 'EMERGENZA_MEDICA', closedAt: '2023-11-19 23:55', duration: '1h 05m', resolution: 'CANCELED' }
            ]);
            setError('Backend non raggiungibile per lo storico, mostro dati mockati.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const getResolutionBadge = (resolution) => {
        switch (resolution) {
            case 'RESOLVED':
                return <span className="px-2.5 py-1 text-[11px] font-bold text-[#2e7d32] bg-[#e8f5e9] border border-[#c8e6c9] rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Risolto</span>;
            case 'FALSE_ALARM':
                return <span className="px-2.5 py-1 text-[11px] font-bold text-[#ed6c02] bg-[#fff3e0] border border-[#ffe0b2] rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Falso Allarme</span>;
            case 'CANCELED':
                return <span className="px-2.5 py-1 text-[11px] font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded flex items-center gap-1"><XCircle className="w-3 h-3"/> Annullato</span>;
            default:
                return <span className="px-2.5 py-1 text-[11px] font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded">{resolution}</span>;
        }
    };

    const filteredHistory = history.filter(h => 
        String(h.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        String(h.eventType || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 p-8 bg-transparent min-h-screen">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-[28px] font-bold text-[#0B1B32]">Storico Eventi Conclusi</h1>
                    <p className="text-gray-500 mt-1">Archivio delle emergenze gestite e chiuse. I log di audit sono disponibili per la tracciabilità legale delle operazioni.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Esporta CSV
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-fit overflow-hidden">
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 bg-gray-50/30">
                    <div className="relative w-72">
                        <input 
                            type="text" 
                            placeholder="Cerca per ID o tipologia..." 
                            className="w-full pl-9 pr-4 py-2 text-[13px] border border-gray-300 rounded outline-none focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    
                    <span className="bg-[#e3f2fd] text-[#1976d2] text-[12px] font-bold px-3 py-1 rounded-full">
                        {filteredHistory.length} Eventi
                    </span>
                </div>

                {error && (
                    <div className="px-6 py-3 bg-yellow-50 text-yellow-800 text-[13px] flex items-center border-b border-yellow-200">
                        <i className="fas fa-exclamation-triangle mr-2 text-yellow-600"></i>
                        {error}
                    </div>
                )}

                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-500 text-[11px] font-bold tracking-wider uppercase border-b border-gray-200 bg-gray-50/50">
                            <th className="px-6 py-4">ID Evento</th>
                            <th className="px-6 py-4">Chiusura</th>
                            <th className="px-6 py-4">Tipologia</th>
                            <th className="px-6 py-4">Durata</th>
                            <th className="px-6 py-4">Risoluzione Finale</th>
                            <th className="px-6 py-4 text-right">Audit Log</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-500">
                                    <i className="fas fa-spinner fa-spin mr-2"></i> Caricamento storico...
                                </td>
                            </tr>
                        ) : filteredHistory.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-500">
                                    Nessun evento trovato.
                                </td>
                            </tr>
                        ) : filteredHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-[13px] font-bold text-[#0B1B32] font-mono">{item.id}</td>
                                <td className="px-6 py-4 text-[13px] text-gray-600">{item.closedAt || item.timestamp}</td>
                                <td className="px-6 py-4 text-[13px] font-medium text-[#0B1B32]">{item.eventType.replace('_', ' ')}</td>
                                <td className="px-6 py-4 text-[13px] text-gray-500">{item.duration || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    {getResolutionBadge(item.resolution || 'RESOLVED')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => setSelectedAuditEmergencyId(item.id)}
                                        className="text-[#1976d2] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded transition-colors" 
                                        title="Visualizza Audit Log"
                                    >
                                        <FileText className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedAuditEmergencyId && (
                <AuditLogModal 
                    emergencyId={selectedAuditEmergencyId} 
                    onClose={() => setSelectedAuditEmergencyId(null)} 
                />
            )}
        </div>
    );
}
