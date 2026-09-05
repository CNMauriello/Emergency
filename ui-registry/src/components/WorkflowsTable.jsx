import { useState, useEffect } from 'react';
import { API_BASE_URL, fetchWithAuth } from '../config.js';
import { FileText } from 'lucide-react';
import WorkflowModal from './WorkflowModal.jsx';
import BpmnViewerModal from './BpmnViewerModal.jsx';

export default function WorkflowsTable() {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
    
    // Viewer states
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerXml, setViewerXml] = useState('');
    const [viewerProcessKey, setViewerProcessKey] = useState('');

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
                { id: 'wf-001', processKey: 'INCENDIO_URBANO', eventType: 'FIRE', gravity: 'ALTA', version: '2', enabled: true, lastUpdated: '2023-10-12 14:00' },
                { id: 'wf-001-old', processKey: 'INCENDIO_URBANO', eventType: 'FIRE', gravity: 'ALTA', version: '1', enabled: false, lastUpdated: '2023-10-10 10:00' },
                { id: 'wf-002', processKey: 'INCIDENTE_STRADALE_GRAVE', eventType: 'TRAFFIC_ACCIDENT', gravity: 'CRITICA', version: '1', enabled: true, lastUpdated: '2023-10-15 09:30' },
                { id: 'wf-003', processKey: 'ALLAGAMENTO_AREA', eventType: 'FLOOD', gravity: 'MEDIA', version: '1', enabled: false, lastUpdated: '2023-09-01 11:20' },
                { id: 'wf-003-new', processKey: 'ALLAGAMENTO_AREA', eventType: 'FLOOD', gravity: 'MEDIA', version: '2', enabled: true, lastUpdated: '2023-09-10 11:20' }
            ]);
            setError('Backend non disponibile, dati mockati caricati.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkflows();
    }, []);

    const handleActiveVersionChange = async (processKey, newVersion) => {
        try {
            const url = `${API_BASE_URL}/Orchestrator/api/workflows/active-version?processKey=${processKey}&targetVersion=${newVersion}`;
            
            // In case we want to mock the behavior when the backend is offline:
            if (error) {
                setWorkflows(workflows.map(wf => {
                    if (wf.processKey === processKey) {
                        return { ...wf, enabled: wf.version.toString() === newVersion.toString() };
                    }
                    return wf;
                }));
                return;
            }

            const response = await fetchWithAuth(url, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error("Failed to change active version");
            }

            // Refresh data from the server
            loadWorkflows();
        } catch (err) {
            console.error(err);
            alert("Errore nell'aggiornamento della versione attiva: " + err.message);
        }
    };

    const handleViewBpmn = async (processKey) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/Orchestrator/api/workflows/${processKey}/xml`);
            if (!response.ok) throw new Error('Errore nel recupero del BPMN');
            const xml = await response.text();
            setViewerXml(xml);
            setViewerProcessKey(processKey);
            setViewerOpen(true);
        } catch (err) {
            console.error(err);
            alert("Impossibile caricare il diagramma BPMN. Assicurati che il backend sia attivo e che la versione attiva esista.");
        }
    };

    // Group workflows by processKey
    const groupedWorkflows = workflows.reduce((acc, wf) => {
        if (!acc[wf.processKey]) {
            acc[wf.processKey] = {
                processKey: wf.processKey,
                eventType: wf.eventType,
                gravity: wf.gravity,
                versions: [],
                activeVersion: null
            };
        }
        if (!acc[wf.processKey].versions.includes(wf.version)) {
            acc[wf.processKey].versions.push(wf.version);
        }
        if (wf.enabled) {
            acc[wf.processKey].activeVersion = wf.version;
        }
        return acc;
    }, {});
    
    // Sort versions inside each group so they appear in a predictable order
    Object.values(groupedWorkflows).forEach(group => {
        group.versions.sort((a, b) => {
            const numA = parseFloat(String(a).replace(/[^\d.]/g, '')) || 0;
            const numB = parseFloat(String(b).replace(/[^\d.]/g, '')) || 0;
            return numB - numA;
        });
    });

    const workflowGroups = Object.values(groupedWorkflows);

    return (
        <div className="flex-1 flex gap-6 p-8 bg-transparent">
            {/* Table Area */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-fit overflow-hidden">
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                    <h2 className="text-[17px] font-bold text-[#0B1B32] flex items-center gap-3">
                        <i className="fas fa-project-diagram text-[#1976d2]"></i>
                        Gestione Processi BPMN
                    </h2>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsWorkflowModalOpen(true)}
                            className="bg-[#0B1B32] hover:bg-slate-800 text-white px-4 py-2 rounded text-[11px] uppercase font-bold shadow-sm transition-colors"
                        >
                            <i className="fas fa-plus mr-1"></i> Registra Nuovo Piano
                        </button>
                        <span className="bg-[#e3f2fd] text-[#1976d2] text-[12px] font-bold px-3 py-1 rounded-full">
                            {workflowGroups.length} Processi
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
                            <th className="px-6 py-4">Active Version</th>
                            <th className="px-6 py-4 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                    <i className="fas fa-spinner fa-spin mr-2"></i> Caricamento processi...
                                </td>
                            </tr>
                        ) : workflowGroups.map((group) => (
                            <tr key={group.processKey} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 text-[13px] font-bold text-[#0B1B32]">{group.processKey}</td>
                                <td className="px-6 py-4 text-[13px] text-gray-600">{group.eventType}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold text-white rounded ${group.gravity === 'CRITICA' ? 'bg-[#d32f2f]' : group.gravity === 'ALTA' ? 'bg-[#ed6c02]' : 'bg-[#fbc02d]'}`}>
                                        {group.gravity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[13px] font-mono text-gray-500">
                                    <select 
                                        value={group.activeVersion || ''} 
                                        onChange={(e) => handleActiveVersionChange(group.processKey, e.target.value)}
                                        className="border border-gray-300 rounded p-1 text-[12px] bg-white outline-none focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] text-gray-800"
                                    >
                                        <option value="" disabled>Seleziona versione...</option>
                                        {group.versions.map(v => (
                                            <option key={v} value={v}>v{v.toString().replace('v', '')}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        className="text-[#1976d2] hover:text-blue-800 transition-colors" 
                                        title="Visualizza BPMN"
                                        onClick={() => handleViewBpmn(group.processKey)}
                                    >
                                        <FileText className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isWorkflowModalOpen && (
                <WorkflowModal 
                    onClose={() => setIsWorkflowModalOpen(false)}
                    onWorkflowCreated={(newWf) => {
                        setWorkflows([...workflows, newWf]);
                    }}
                />
            )}

            {viewerOpen && (
                <BpmnViewerModal
                    xml={viewerXml}
                    processKey={viewerProcessKey}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </div>
    );
}
