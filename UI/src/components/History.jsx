import { useState, useEffect } from 'react';
import { OPERATOR_SERVICE_URL, fetchWithAuth } from '../config.js';
import { Download, Search, CheckCircle2, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

export default function History() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadAuditLogs = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`${OPERATOR_SERVICE_URL}/api/audit`);
            if (!response.ok) throw new Error('Failed to fetch audit logs');
            const data = await response.json();
            setAuditLogs(data);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            // Fallback mock
            setAuditLogs([
                { id: 1, emergencyId: 'E-8821', timestamp: '2023-11-20T18:45:00', operator: 'OP-8942', action: 'EMERGENCY_CLOSED', details: 'Chiusura intervento', outcome: 'SUCCESS', override: false },
                { id: 2, emergencyId: 'E-8822', timestamp: '2023-11-20T17:30:12', operator: 'OP-8942', action: 'DISPATCH_TEAM', details: 'Invio squadra VVF-01', outcome: 'SUCCESS', override: false },
                { id: 3, emergencyId: 'E-8825', timestamp: '2023-11-20T16:45:33', operator: 'SYSTEM', action: 'WORKFLOW_TRIGGERED', details: 'Innesco processo INCENDIO_URBANO', outcome: 'SUCCESS', override: false },
                { id: 4, emergencyId: 'E-8829', timestamp: '2023-11-20T16:40:05', operator: 'OP-7731', action: 'VALIDATION_OVERRIDE', details: 'Forzatura severità ad ALTA', outcome: 'WARNING', override: true },
            ]);
            setError('Backend non raggiungibile per gli audit log, mostro dati mockati.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuditLogs();
    }, []);

    const getActionIcon = (outcome) => {
        switch (outcome) {
            case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const filteredLogs = auditLogs.filter(log => 
        String(log.emergencyId || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        String(log.operator || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(log.action || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const exportToCSV = () => {
        if (!filteredLogs || filteredLogs.length === 0) return;
        
        const headers = ['ID Evento', 'Data', 'Operatore', 'Azione', 'Dettagli', 'Esito'];
        const csvRows = [headers.join(';')];
        
        filteredLogs.forEach(log => {
            const row = [
                log.emergencyId || '',
                log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'N/A',
                log.operator || '',
                log.action || '',
                `"${(log.details || '').replace(/"/g, '""')}"`,
                log.outcome || ''
            ];
            csvRows.push(row.join(';'));
        });
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'audit_logs.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 p-8 bg-transparent h-screen max-h-screen flex flex-col">
            <div className="mb-6 flex justify-between items-end flex-shrink-0">
                <div>
                    <h1 className="text-[28px] font-bold text-[#0B1B32] flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-[#6ea8fe]" /> Storico Audit Log
                    </h1>
                    <p className="text-gray-500 mt-1">Registro immutabile di tutte le operazioni e azioni eseguite nel sistema.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportToCSV} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Esporta CSV
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 bg-gray-50/30 flex-shrink-0">
                    <div className="relative w-72">
                        <input 
                            type="text" 
                            placeholder="Cerca per ID, Operatore o Azione..." 
                            className="w-full pl-9 pr-4 py-2 text-[13px] border border-gray-300 rounded outline-none focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    
                    <span className="bg-[#e3f2fd] text-[#1976d2] text-[12px] font-bold px-3 py-1 rounded-full">
                        {filteredLogs.length} Log Registrati
                    </span>
                </div>

                {error && (
                    <div className="px-6 py-3 bg-yellow-50 text-yellow-800 text-[13px] flex items-center border-b border-yellow-200 flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 z-10">
                            <tr className="text-gray-500 text-[11px] font-bold tracking-wider uppercase border-b border-gray-200">
                                <th className="px-6 py-4 bg-gray-50">ID Evento</th>
                                <th className="px-6 py-4 bg-gray-50">Data</th>
                                <th className="px-6 py-4 bg-gray-50">Operatore</th>
                                <th className="px-6 py-4 bg-gray-50">Azione</th>
                                <th className="px-6 py-4 bg-gray-50">Dettagli</th>
                                <th className="px-6 py-4 text-center bg-gray-50">Esito</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        <i className="fas fa-spinner fa-spin mr-2"></i> Caricamento audit log...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        Nessun log di audit trovato.
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className={`hover:bg-gray-50 transition-colors ${log.override ? 'bg-yellow-50/20' : ''}`}>
                                    <td className="px-6 py-4 text-[13px] font-bold text-[#0B1B32] font-mono">{log.emergencyId}</td>
                                    <td className="px-6 py-4 text-[13px] text-gray-600">
                                        {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[11px] font-mono bg-blue-50 text-[#1976d2] px-2 py-0.5 rounded border border-blue-100">
                                            {log.operator}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-bold text-[#0B1B32]">
                                        {log.action?.replace(/_/g, ' ')}
                                    </td>
                                    <td className="px-6 py-4 text-[12px] text-gray-600 max-w-xs truncate" title={log.details}>
                                        {log.details}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center items-center">
                                        <div className="p-1.5 bg-gray-50 rounded-full border border-gray-200">
                                            {getActionIcon(log.outcome)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
