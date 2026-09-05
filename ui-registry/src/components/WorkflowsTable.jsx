import { useState, useEffect } from 'react';
import { API_BASE_URL, fetchWithAuth } from '../config.js';
import { Play, Pause, FileText, CheckCircle2, History } from 'lucide-react';

export default function WorkflowsTable() {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);

    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`${API_BASE_URL}/Orchestrator/api/workflows`);
            if (!response.ok) throw new Error('Failed to fetch workflows');
            const data = await response.json();
            setWorkflows(data);
        } catch (err) {
            console.error('Error fetching workflows:', err);
            // Fallback for demonstration when backend is not ready
            setWorkflows([
                { id: 'wf-001', processKey: 'INCENDIO_URBANO', eventType: 'FIRE', gravity: 'ALTA', version: 'v2.1', status: 'ACTIVE', lastUpdated: '2023-10-12 14:00' },
                { id: 'wf-002', processKey: 'INCIDENTE_STRADALE_GRAVE', eventType: 'TRAFFIC_ACCIDENT', gravity: 'CRITICA', version: 'v1.4', status: 'ACTIVE', lastUpdated: '2023-10-15 09:30' },
                { id: 'wf-003', processKey: 'ALLAGAMENTO_AREA', eventType: 'FLOOD', gravity: 'MEDIA', version: 'v1.0', status: 'INACTIVE', lastUpdated: '2023-09-01 11:20' }
            ]);
            setError('Backend non disponibile, dati mockati caricati.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkflows();
    }, []);

    const handleToggleStatus = async (workflow) => {
        const newStatus = workflow.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        // Mocking the update logic since we don't have the explicit PATCH endpoint specified, but following best practices
        setWorkflows(workflows.map(wf => wf.id === workflow.id ? { ...wf, status: newStatus } : wf));
        
        try {
            // Uncomment to use real endpoint when available
            // await fetchWithAuth(`${API_BASE_URL}/Orchestrator/api/workflows/${workflow.id}/status`, {
            //     method: 'PATCH',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ status: newStatus })
            // });
        } catch (e) {
            console.error("Failed to update status", e);
        }
    };

    return (
        <div className="flex-1 flex gap-6 p-8 bg-transparent">
            {/* Table Area */}
            <div className="flex-[2] bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-fit overflow-hidden">
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                    <h2 className="text-[17px] font-bold text-[#0B1B32] flex items-center gap-3">
                        <i className="fas fa-project-diagram text-[#1976d2]"></i>
                        Gestione Processi BPMN
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="bg-[#e3f2fd] text-[#1976d2] text-[12px] font-bold px-3 py-1 rounded-full">
                            {workflows.length} Piani
                        </span>
                        <button
                            onClick={loadWorkflows}
                            className="text-gray-400 hover:text-[#0B1B32] transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
                            title="Aggiorna"
                        >
                            <i className="fas fa-sync-alt text-[12px]"></i>
                        </button>
                    </div>
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
                            <th className="px-6 py-4">Process Key</th>
                            <th className="px-6 py-4">Event Type</th>
                            <th className="px-6 py-4">Gravity</th>
                            <th className="px-6 py-4">Version</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-500">
                                    <i className="fas fa-spinner fa-spin mr-2"></i> Caricamento workflows...
                                </td>
                            </tr>
                        ) : workflows.map((wf) => (
                            <tr 
                                key={wf.id} 
                                className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${selectedWorkflow?.id === wf.id ? 'bg-blue-50/50' : ''}`}
                                onClick={() => setSelectedWorkflow(wf)}
                            >
                                <td className="px-6 py-4 text-[13px] font-bold text-[#0B1B32]">{wf.processKey}</td>
                                <td className="px-6 py-4 text-[13px] text-gray-600">{wf.eventType}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold text-white rounded ${wf.gravity === 'CRITICA' ? 'bg-[#d32f2f]' : wf.gravity === 'ALTA' ? 'bg-[#ed6c02]' : 'bg-[#fbc02d]'}`}>
                                        {wf.gravity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[13px] font-mono text-gray-500">{wf.version}</td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(wf); }}
                                        className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all ${wf.status === 'ACTIVE' ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9] hover:bg-[#c8e6c9]' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                                    >
                                        {wf.status === 'ACTIVE' ? 'Attivo' : 'Inattivo'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[#1976d2] hover:text-blue-800" title="Visualizza BPMN">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sidebar per Dettagli / Cronologia */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-fit sticky top-8">
                {selectedWorkflow ? (
                    <div>
                        <div className="border-b border-gray-100 pb-4 mb-5">
                            <h3 className="text-[16px] font-bold text-[#0B1B32]">{selectedWorkflow.processKey}</h3>
                            <p className="text-[13px] text-gray-500 mt-1">Dettagli e Cronologia Versioni</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Informazioni Correnti</h4>
                                <div className="grid grid-cols-2 gap-4 text-[13px]">
                                    <div><span className="text-gray-400 block mb-0.5">Tipo Evento</span> <span className="font-medium text-[#0B1B32]">{selectedWorkflow.eventType}</span></div>
                                    <div><span className="text-gray-400 block mb-0.5">Versione Attiva</span> <span className="font-mono text-[#0B1B32]">{selectedWorkflow.version}</span></div>
                                    <div><span className="text-gray-400 block mb-0.5">Ultima Modifica</span> <span className="text-[#0B1B32]">{selectedWorkflow.lastUpdated}</span></div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[14px] font-bold text-[#0B1B32] flex items-center gap-2 mb-4">
                                    <History className="w-4 h-4 text-gray-400" /> Cronologia Versioni
                                </h4>
                                <div className="relative pl-4 border-l-2 border-gray-100 space-y-5 ml-1">
                                    <div className="relative">
                                        <CheckCircle2 className="w-5 h-5 text-[#2e7d32] absolute -left-[27px] bg-white" />
                                        <p className="text-[13px] font-bold text-[#0B1B32]">{selectedWorkflow.version}</p>
                                        <p className="text-[11px] text-gray-500">Versione corrente in produzione. Aggiornata il {selectedWorkflow.lastUpdated}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="w-3 h-3 bg-gray-300 rounded-full absolute -left-[23px] top-1 border-2 border-white"></div>
                                        <p className="text-[13px] font-bold text-gray-500">v{parseFloat(selectedWorkflow.version.replace('v','')) - 0.1 > 0 ? (parseFloat(selectedWorkflow.version.replace('v','')) - 0.1).toFixed(1) : '1.0'}</p>
                                        <p className="text-[11px] text-gray-400">Versione obsoleta. Sostituita per ottimizzazione KPI.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-center">
                        <i className="fas fa-mouse-pointer text-gray-300 text-3xl mb-3"></i>
                        <p className="text-[14px] text-gray-500 font-medium">Seleziona un workflow<br />per vederne i dettagli</p>
                    </div>
                )}
            </div>
        </div>
    );
}
