import { useState, useEffect } from 'react';
import { OPERATOR_SERVICE_URL, fetchWithAuth } from '../config.js';
import { Download, Search, CheckCircle2, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

export default function History({ searchQuery }) {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAuditLogs = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`${OPERATOR_SERVICE_URL}/api/audit`);
            if (!response.ok) throw new Error('Failed to fetch audit logs');
            const data = await response.json();
            setAuditLogs(data);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            setError(err.message || 'Error retrieving audit logs from backend.');
            setAuditLogs([]);
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

    const filteredLogs = auditLogs.filter(log => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return String(log.emergencyId || '').toLowerCase().includes(q) || 
               String(log.operator || '').toLowerCase().includes(q) ||
               String(log.action || '').toLowerCase().includes(q) ||
               String(log.details || '').toLowerCase().includes(q) ||
               String(log.outcome || '').toLowerCase().includes(q);
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const exportToCSV = () => {
        if (!filteredLogs || filteredLogs.length === 0) return;
        
        const headers = ['Event ID', 'Date', 'Operator', 'Action', 'Details', 'Outcome'];
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
                        <ShieldAlert className="w-6 h-6 text-[#6ea8fe]" /> Audit Log History
                    </h1>
                    <p className="text-gray-500 mt-1">Immutable record of all operations and actions performed in the system.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportToCSV} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="relative z-0 flex flex-col flex-1 min-h-0 mt-2">
                <div className="absolute -top-10 -left-10 w-96 h-96 bg-[#0088cc]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                <div className="absolute bottom-10 -right-10 w-[500px] h-[300px] bg-cyan-400/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-[#0B1B32]/2 to-transparent -z-10 pointer-events-none rounded-[2rem]"></div>
                
                <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col flex-1 overflow-hidden min-h-0 relative">
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 bg-gray-50/30 flex-shrink-0">

                    
                    <span className="bg-[#e3f2fd] text-[#1976d2] text-[12px] font-bold px-3 py-1 rounded-full">
                        {filteredLogs.length} Registered Logs
                    </span>
                </div>

                {error && (
                    <div className="px-6 py-3 bg-yellow-50 text-yellow-800 text-[13px] flex items-center border-b border-yellow-200 flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left relative">
                        <thead className="sticky top-0 bg-white/40 backdrop-blur-md z-10 shadow-sm border-b border-white/40">
                            <tr className="text-[#0B1B32] text-[11px] font-extrabold tracking-wider uppercase">
                                <th className="px-6 py-4">Event ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Operator</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4 text-center">Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20 bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        <i className="fas fa-spinner fa-spin mr-2"></i> Loading audit log...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <i className="fas fa-exclamation-triangle text-4xl text-yellow-400 mb-4 shadow-sm rounded-full bg-yellow-50 p-3"></i>
                                            <h2 className="text-[15px] font-bold text-gray-700">No audit log registered</h2>
                                            <p className="text-[13px] mt-1 text-gray-500">There are currently no operations or actions performed in the system.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className={`hover:bg-white/40 transition-colors border-b border-white/20 ${log.override ? 'bg-yellow-50/20' : ''}`}>
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
                                        <div className={`p-1.5 rounded-full border shadow-sm ${
                                            log.outcome === 'SUCCESS' ? 'bg-green-50 border-green-200 shadow-[0_0_8px_rgba(34,197,94,0.3)]' :
                                            log.outcome === 'WARNING' ? 'bg-yellow-50 border-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.3)]' :
                                            'bg-blue-50 border-blue-200 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                                        }`}>
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
        </div>
    );
}
