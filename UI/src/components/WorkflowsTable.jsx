import { useState, useEffect } from 'react';
import { API_BASE_URL, fetchWithAuth } from '../config.js';
import { FileText, Network } from 'lucide-react';
import WorkflowModal from './WorkflowModal.jsx';
import BpmnViewerModal from './BpmnViewerModal.jsx';

export default function WorkflowsTable({ searchQuery }) {
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
            const response = await fetchWithAuth(`${API_BASE_URL}/api/workflows`);
            if (!response.ok) throw new Error('Failed to fetch workflows');
            const data = await response.json();
            setWorkflows(data);
        } catch (err) {
            console.error('Error fetching workflows:', err);
            setWorkflows([]);
            setError(err.message || 'Error retrieving workflows from the backend.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkflows();
    }, []);

    const handleActiveVersionChange = async (processKey, newVersion) => {
        try {
            const url = `${API_BASE_URL}/api/workflows/active-version?processKey=${processKey}&targetVersion=${newVersion}`;
            


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
            alert("Error updating the active version: " + err.message);
        }
    };

    const handleViewBpmn = async (processKey) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/workflows/${processKey}/xml`);
            if (!response.ok) throw new Error('Error retrieving the BPMN');
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('The server returned an HTML page instead of the BPMN diagram.');
            }
            
            const xml = await response.text();
            if (!xml.includes('<bpmn:definitions') && !xml.includes('<definitions')) {
                throw new Error('The returned content is not a valid BPMN file.');
            }
            
            setViewerXml(xml);
            setViewerProcessKey(processKey);
            setViewerOpen(true);
        } catch (err) {
            console.error(err);
            alert("Unable to load the BPMN diagram. Make sure the backend is running and the active version exists. (" + err.message + ")");
        }
    };

    // Group workflows by processKey
    const filteredWorkflows = workflows.filter(wf => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (wf.processKey || '').toLowerCase().includes(q) ||
               (wf.eventType || '').toLowerCase().includes(q) ||
               (wf.gravity || '').toLowerCase().includes(q);
    });

    const groupedWorkflows = filteredWorkflows.reduce((acc, wf) => {
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
        <div className="flex-1 flex flex-col p-8 bg-transparent min-h-0 h-full overflow-hidden">
            <div className="mb-6 flex justify-between items-end flex-shrink-0">
                <div>
                    <h1 className="text-[28px] font-bold text-[#0B1B32] flex items-center gap-2">
                        <Network className="w-6 h-6 text-[#6ea8fe]" /> BPMN Process Management
                    </h1>
                    <p className="text-gray-500 mt-1">Configuration and monitoring of operational workflows for emergencies.</p>
                </div>
            </div>

            {/* Table Area */}
            <div className="relative z-0 flex flex-col flex-1 min-h-0 mt-2">
                <div className="absolute -top-10 -left-10 w-96 h-96 bg-[#0088cc]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                <div className="absolute bottom-10 -right-10 w-[500px] h-[300px] bg-cyan-400/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-[#0B1B32]/2 to-transparent -z-10 pointer-events-none rounded-[2rem]"></div>
                
                <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col flex-1 overflow-hidden min-h-0 relative">
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 shrink-0">
                    <h2 className="text-[17px] font-bold text-[#0B1B32] flex items-center gap-3">
                        <i className="fas fa-list text-[#0B1B32]"></i>
                        Process List
                    </h2>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsWorkflowModalOpen(true)}
                            className="bg-[#0B1B32] hover:bg-slate-800 text-white px-4 py-2 rounded text-[11px] uppercase font-bold shadow-sm transition-colors"
                        >
                            <i className="fas fa-plus mr-1"></i> Register New Plan
                        </button>
                        <span className="bg-[#e3f2fd] text-[#1976d2] text-[12px] font-bold px-3 py-1 rounded-full">
                            {workflowGroups.length} Processes
                        </span>
                        <button
                            onClick={loadWorkflows}
                            className="text-gray-400 hover:text-[#0B1B32] transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
                            title="Refresh"
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

                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left relative">
                        <thead className="sticky top-0 bg-white/40 backdrop-blur z-10 shadow-sm border-b border-white/40">
                            <tr className="text-[#0B1B32] text-[11px] font-extrabold tracking-wider uppercase">
                            <th className="px-6 py-4">Process Key</th>
                            <th className="px-6 py-4">Event Type</th>
                            <th className="px-6 py-4">Gravity</th>
                            <th className="px-6 py-4">Active Version</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20 bg-transparent">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                    <i className="fas fa-spinner fa-spin mr-2"></i> Loading processes...
                                </td>
                            </tr>
                        ) : workflowGroups.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-16">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <i className="fas fa-exclamation-triangle text-4xl text-yellow-400 mb-4 shadow-sm rounded-full bg-yellow-50 p-3"></i>
                                        <p className="text-[15px] font-bold text-gray-700">No BPMN plan registered</p>
                                        <p className="text-[13px] mt-1">There are currently no workflows configured in the system.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : workflowGroups.map((group) => (
                            <tr key={group.processKey} className="hover:bg-white/40 transition-colors border-b border-white/20">
                                <td className="px-6 py-4 text-[13px] font-bold text-[#0B1B32]">{group.processKey}</td>
                                <td className="px-6 py-4 text-[13px] text-gray-600">{group.eventType}</td>
                                <td className="px-6 py-4">
                                    {(() => {
                                        const derivedGravity = group.gravity || (group.processKey.includes('_') ? group.processKey.split('_').pop() : 'UNKNOWN');
                                        const severityUpper = derivedGravity.toUpperCase();
                                        let severityBg = 'bg-gray-400';
                                        if (severityUpper === 'CRITICA' || severityUpper === 'CRITICAL') severityBg = 'bg-[#d32f2f] shadow-[0_0_15px_rgba(211,47,47,0.8)] border border-[#d32f2f]';
                                        else if (severityUpper === 'ALTA' || severityUpper === 'HIGH') severityBg = 'bg-[#ef5350] shadow-[0_0_12px_rgba(239,83,80,0.7)] border border-[#ef5350]';
                                        else if (severityUpper === 'MEDIA' || severityUpper === 'MEDIUM') severityBg = 'bg-[#ed6c02] shadow-[0_0_12px_rgba(237,108,2,0.7)] border border-[#ed6c02]';
                                        else if (severityUpper === 'BASSA' || severityUpper === 'LOW') severityBg = 'bg-[#eab308] shadow-[0_0_12px_rgba(234,179,8,0.7)] border border-[#eab308]';
                                        
                                        return (
                                            <span className={`px-2.5 py-1 text-[10px] font-bold text-white rounded ${severityBg}`}>
                                                {derivedGravity}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="px-6 py-4 text-[13px] font-mono text-gray-500">
                                    <select 
                                        value={group.activeVersion || ''} 
                                        onChange={(e) => handleActiveVersionChange(group.processKey, e.target.value)}
                                        className="border border-gray-300 rounded p-1 text-[12px] bg-white outline-none focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] text-gray-800"
                                    >
                                        <option value="" disabled>Select version...</option>
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
            </div>
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
