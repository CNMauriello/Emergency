import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Clock, MapPin, Loader2, AlertTriangle, Filter, Ticket, ShieldAlert, Play, Terminal, Maximize, Copy } from 'lucide-react';
import { API_BASE_URL, fetchWithAuth } from '../config.js';
import ProcessBpmnViewer from './ProcessBpmnViewer.jsx';
import EscalationResolutionModal from './EscalationResolutionModal.jsx';
import { MapContainer, TileLayer, Marker, Popup, Circle as MapCircle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix per l'icona di default di leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const EmergencyDetail = ({ emergencyId, onBack, userRole }) => {
    const isUser = userRole?.toString().toUpperCase() === 'ROLE_USER' || userRole?.toString().toUpperCase() === 'USER';
    const [emergency, setEmergency] = useState(null);
    const [services, setServices] = useState([]);
    const [capabilities, setCapabilities] = useState([]);

    const [selectedCapability, setSelectedCapability] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dispatching, setDispatching] = useState(false);
    const [tickets, setTickets] = useState([]);

    // Status per la modale di risoluzione escalation
    const [resolvingTicket, setResolvingTicket] = useState(null);

    // Status per la visualizzazione BPMN
    const [visualizationData, setVisualizationData] = useState(null);
    const [viewStack, setViewStack] = useState([]); // Stack of child workflow instance IDs

    const [fetchedAddress, setFetchedAddress] = useState('');
    const [playTrigger, setPlayTrigger] = useState(0);
    const [recenterTrigger, setRecenterTrigger] = useState(0);

    useEffect(() => {
        if (!emergencyId) return;
        const loadCapabilities = async () => {
            try {
                const res = await fetchWithAuth(`${API_BASE_URL}/api/capabilities`);
                if (res.ok) {
                    const data = await res.json();
                    setCapabilities(data);
                }
            } catch (err) {
                console.error("Capabilities error", err);
            }
        };
        loadCapabilities();
    }, [emergencyId]);

    useEffect(() => {
        if (!emergencyId) return;

        const fetchData = async () => {
            try {
                const headers = {
                    //'Authorization': `Bearer ${localStorage.getItem('faro_token')}`,
                    'Content-Type': 'application/json'
                };

                // Usa GET /emergencies/{id}
                const emRes = await fetchWithAuth(`${API_BASE_URL}/api/emergencies/${emergencyId}`, { headers });
                if (!emRes.ok) throw new Error(`Emergency not found (Status: ${emRes.status})`);
                const emData = await emRes.json();
                setEmergency(emData);

                const serviceUrl = selectedCapability
                    ? `${API_BASE_URL}/api/services?capability=${selectedCapability}`
                    : `${API_BASE_URL}/api/services?capability=`;

                const srvRes = await fetchWithAuth(serviceUrl, { headers });
                if (srvRes.ok) {
                    const srvData = await srvRes.json();
                    setServices(srvData);
                }

                const tktRes = await fetchWithAuth(`${API_BASE_URL}/api/operators/escalations/active`, { headers });
                if (tktRes.ok) {
                    const tktData = await tktRes.json();
                    setTickets(tktData);
                }

                setError(null);
            } catch (err) {
                console.error("Connection error", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [emergencyId, selectedCapability]);

    // Recupero indirizzo dalle coordinate
    useEffect(() => {
        if (emergency && emergency.latitude && emergency.longitude && !emergency.address && !fetchedAddress) {
            const fetchAddress = async () => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${emergency.latitude}&lon=${emergency.longitude}`);
                    if (res.ok) {
                        const data = await res.json();
                        setFetchedAddress(data.display_name || 'Address non trovato');
                    }
                } catch (err) {
                    console.error("Error retrieving address from Nominatim", err);
                }
            };
            fetchAddress();
        }
    }, [emergency, fetchedAddress]);

    // Polling separato per i dati di visualizzazione del processo BPMN
    const currentWorkflowInstanceId = viewStack.length > 0 ? viewStack[viewStack.length - 1] : emergency?.workflowInstanceId;

    useEffect(() => {
        if (!currentWorkflowInstanceId) return;

        const fetchVisualization = async () => {
            try {
                const res = await fetchWithAuth(`${API_BASE_URL}/api/process-instances/${currentWorkflowInstanceId}/visualization`);
                if (res.ok) {
                    const data = await res.json();
                    setVisualizationData(data);
                }
            } catch (err) {
                console.error("Error retrieving BPMN data", err);
            }
        };

        fetchVisualization();
        const interval = setInterval(fetchVisualization, 2000); // 2 secondi come richiesto
        return () => clearInterval(interval);
    }, [currentWorkflowInstanceId]);

    const handleManualDispatch = async () => {
        if (!selectedUnit) return;
        setDispatching(true);
        try {
            // Use the new PATCH /emergencies/{id}/status endpoint instead of POST
            const response = await fetchWithAuth(`${API_BASE_URL}/api/emergencies/${emergencyId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                    //'Authorization': `Bearer ${localStorage.getItem('faro_token')}`
                },
                // Allineato al StatusUpdateRequestDto previsto dal controller
                body: JSON.stringify({
                    status: 'MONITORING',
                    workflowInstanceId: emergency.workflowInstanceId
                })
            });

            if (!response.ok) throw new Error('Error updating status from backend');

            setSelectedUnit('');
        } catch (err) {
            console.error("Error during engagement", err);
            alert("Unable to confirm status update: " + err.message);
        } finally {
            setDispatching(false);
        }
    };

    if (!emergencyId) return <div className="p-8 text-gray-500">Noa emergenza selezionata.</div>;
    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 bg-[#0B1B32]" /></div>;

    if (error || !emergency) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 text-sm font-bold">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to list
                </button>
                <div className="flex flex-col items-center justify-center py-20">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to load details</h2>
                    <p className="text-red-600 font-mono text-sm">{error || "Dati non disponibili"}</p>
                </div>
            </div>
        );
    }

    const isDispatchCompleted = emergency.status === 'MONITORING' || emergency.status === 'CLOSED' ||
        (emergency.history && emergency.history.some(h => h.includes('INGAGGIATA')));

    const emergencyTickets = tickets.filter(t => (t.eventId === emergency.eventId || t.event_id === emergency.eventId));

    const severityUpper = (emergency?.severity || '').toUpperCase();
    let severityBg = 'bg-gray-400';
    let severityText = 'text-gray-500';
    let markerColor = '#9ca3af';

    if (severityUpper === 'CRITICA' || severityUpper === 'CRITICAL') {
        severityBg = 'bg-[#d32f2f] shadow-[0_0_15px_rgba(211,47,47,0.8)] border border-[#d32f2f]';
        severityText = 'text-[#d32f2f]';
        markerColor = '#d32f2f';
    } else if (severityUpper === 'ALTA' || severityUpper === 'HIGH') {
        severityBg = 'bg-[#ef5350] shadow-[0_0_12px_rgba(239,83,80,0.7)] border border-[#ef5350]';
        severityText = 'text-[#ef5350]';
        markerColor = '#ef5350';
    } else if (severityUpper === 'MEDIA' || severityUpper === 'MEDIUM') {
        severityBg = 'bg-[#ed6c02] shadow-[0_0_12px_rgba(237,108,2,0.7)] border border-[#ed6c02]';
        severityText = 'text-[#ed6c02]';
        markerColor = '#ed6c02';
    } else if (severityUpper === 'BASSA' || severityUpper === 'LOW') {
        severityBg = 'bg-[#eab308] shadow-[0_0_12px_rgba(234,179,8,0.7)] border border-[#eab308]';
        severityText = 'text-[#eab308]';
        markerColor = '#eab308';
    }

    const customMarkerIcon = L.divIcon({
        className: 'custom-pulsing-icon bg-transparent border-0',
        html: `
            <div class="relative flex items-center justify-center w-8 h-8">
                <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style="background-color: ${markerColor}"></span>
                <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-white shadow-md" style="background-color: ${markerColor}"></span>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    return (
        <div className="p-8 bg-transparent min-h-screen">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 text-sm font-bold tracking-wide transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to list
            </button>

            <div className="flex items-center space-x-4 mb-8">
                <h1 className="text-[28px] font-black text-[#0B1B32] tracking-wide">{emergency.eventType.replace('_', ' ')}</h1>
                <span className={`px-2.5 py-1 text-[11px] font-bold text-white rounded shadow-sm ${severityBg}`}>
                    {emergency.severity}
                </span>
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded shadow-sm ${emergency.status === 'CLOSED' ? 'bg-gray-200 text-gray-700' : 'bg-[#0088cc] text-white shadow-[0_0_12px_rgba(0,136,204,0.7)] border border-[#0088cc]'}`}>
                    {emergency.status}
                </span>
            </div>

            <div className="flex flex-col gap-8">
                {/* TOP SECTION: Operational Details e Mappa */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card Operational Details */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200/60 lg:col-span-2 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#0B1B32]"></div>
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                            <h2 className="text-lg font-bold text-[#0B1B32] flex items-center tracking-wide">
                                <div className="bg-[#0B1B32]/10 p-1.5 rounded mr-3">
                                    <i className="fas fa-layer-group text-[#0B1B32] text-[14px]"></i>
                                </div>
                                Operational Details
                            </h2>
                            <span className="bg-gray-50 border border-gray-200 text-gray-500 px-3 py-1.5 text-[12px] font-mono rounded font-bold uppercase tracking-wider">ID: {emergency.eventId}</span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6 text-[13px] items-start">
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold tracking-widest mb-1.5 uppercase">TYPE</p>
                                <p className="font-bold text-[#0B1B32] text-[15px]">{emergency.eventType.replace('_', ' ')}</p>
                                <p className="text-gray-500 text-[11px] mt-1">{emergency.eventType.includes('CRASH') ? 'Absolute priority' : 'Absolute priority'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold tracking-widest mb-1.5 uppercase">DETECTION TIME</p>
                                <p className="font-mono bg-gray-50 border border-gray-200 px-2.5 py-1 rounded font-bold inline-block text-[13px] text-gray-700 shadow-sm">{emergency.timestamp}</p>
                                <p className="text-gray-500 text-[11px] mt-1.5">IoT Sensor & eCall</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold tracking-widest mb-1.5 uppercase">COORDINATES (LAT/LONG)</p>
                                <div className="flex items-center text-[#0088cc] font-mono font-bold text-[13px] bg-[#e0f2fe] px-2.5 py-1 rounded border border-[#bae6fd] w-max">
                                    {emergency.latitude.toFixed(4)}° N, {emergency.longitude.toFixed(4)}° E
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-gray-50 rounded-lg border border-gray-100 p-4 relative">
                            <p className="text-gray-400 text-[10px] font-bold tracking-widest mb-2 uppercase ml-7">PHYSICAL ADDRESS</p>
                            <div className="flex items-start">
                                <div className="bg-red-100 p-1.5 rounded-full mr-3 shrink-0 mt-0.5">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                </div>
                                <p className="text-[#0B1B32] font-semibold text-[14px] leading-relaxed">{emergency.address || fetchedAddress || 'Corso Nicolangelo Protopisani, San Giovanni a Teduccio, Napoli, Italia'}</p>
                            </div>
                        </div>

                    </div>

                    {/* Card Mappa */}
                    <div className="bg-white p-1.5 rounded-xl shadow-lg border border-gray-200/60 h-[300px] lg:h-auto lg:col-span-1 overflow-hidden relative">
                        <div className="absolute inset-0 border-2 border-[#0088cc]/10 rounded-xl pointer-events-none z-[401]"></div>
                        <MapContainer
                            center={[emergency.latitude, emergency.longitude]}
                            zoom={15}
                            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                attribution='&copy; Google Maps'
                                maxZoom={20}
                                detectRetina={true}
                            />

                            {/* Area di intervento */}
                            <MapCircle
                                center={[emergency.latitude, emergency.longitude]}
                                radius={200}
                                pathOptions={{
                                    color: '#ef4444',
                                    fillColor: '#ef4444',
                                    fillOpacity: 0.15,
                                    weight: 1,
                                    dashArray: '4, 4'
                                }}
                            />

                            <Marker position={[emergency.latitude, emergency.longitude]} icon={customMarkerIcon}>
                                <Popup>
                                    <div className="text-center p-1">
                                        <strong className="text-[#0B1B32]">{emergency.eventType.replace('_', ' ')}</strong><br />
                                        <span className={`${severityText} font-bold text-xs`}>{emergency.severity}</span>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>

                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-md shadow-sm z-[400] text-[10px] font-bold text-gray-700 border border-gray-200/50 flex items-center tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 animate-pulse"></div> SATELLITE FEED • EO-COPERNICUS
                        </div>




                    </div>
                </div>

                {/* MIDDLE SECTION: Tickets di Escalation */}
                {emergencyTickets.length > 0 && (
                    <div className="bg-red-50 p-6 rounded-xl shadow-lg border border-red-200 w-full hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <div className="flex items-center justify-between border-b border-red-200 pb-4 mb-5 bg-gradient-to-r from-red-50 to-white/50">
                            <h2 className="text-lg font-bold text-red-800 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-red-600 animate-pulse" /> Open Escalation Tickets (Intervention Request)
                            </h2>
                            <span className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-1 text-[11px] font-bold rounded uppercase shadow-sm">
                                {emergencyTickets.length} Active
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {emergencyTickets.map((ticket, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm border-l-4 border-l-red-500 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800">{ticket.taskName || ticket.name || 'Intervention Requested'}</h3>
                                            <span className="text-[10px] font-mono bg-red-50 border border-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold shadow-sm">
                                                {ticket.taskId || ticket.id || ticket.ticketId}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {ticket.message || ticket.description || 'Intervention or human validation request required to advance the BPMN process.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        <div className="text-[11px] text-gray-400">
                                            <span className="font-semibold text-gray-600">Created:</span> {ticket.timestamp || ticket.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' ')}
                                        </div>
                                        <button
                                            onClick={() => setResolvingTicket({ ...ticket, severity: emergency?.severity })}
                                            disabled={isUser}
                                            title={isUser ? "Non hai i permessi per risolvere le escalation" : "Resolve Escalation"}
                                            className={`px-3 py-1.5 text-white text-xs font-bold rounded flex items-center transition-colors shadow-sm ${isUser
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700 hover:shadow-md'
                                                }`}
                                        >
                                            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Resolve Escalation
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BOTTOM SECTION: Status Esecuzione Workflow (BPMN) */}
                <div className="relative z-0 w-full mt-4">
                    {/* Sfondo tridimensionale / Glassmorphism */}
                    <div className="absolute -top-10 -left-10 w-96 h-96 bg-[#0088cc]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                    <div className="absolute bottom-10 -right-10 w-[500px] h-[300px] bg-cyan-400/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-[#0B1B32]/2 to-transparent -z-10 pointer-events-none rounded-[2rem]"></div>

                    <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 w-full flex flex-col h-full min-h-[600px] relative overflow-hidden hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#0B1B32] to-[#0088cc]"></div>
                        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-5">
                            <div className="flex items-center">
                                <div className="bg-[#0B1B32] p-2 rounded-lg mr-4 text-white shadow-sm">
                                    <i className="fas fa-project-diagram text-[20px]"></i>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#0B1B32] tracking-wide">
                                        BPMN Workflow Execution Status
                                    </h2>
                                    <p className="text-gray-400 text-[13px] mt-0.5">Automated response and event escalation pipeline</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {visualizationData && (
                                    <>
                                        <button
                                            onClick={() => setRecenterTrigger(prev => prev + 1)}
                                            className="w-[150px] justify-center bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0f172a] border border-gray-200 px-3 py-1.5 rounded flex items-center text-[11px] font-bold transition-all shadow-sm hover:shadow"
                                            title="Center BPMN diagram"
                                        >
                                            <Maximize className="w-3.5 h-3.5 mr-1.5" /> Center
                                        </button>
                                        <button
                                            onClick={() => setPlayTrigger(prev => prev + 1)}
                                            className="w-[150px] justify-center bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0f172a] border border-gray-200 px-3 py-1.5 rounded flex items-center text-[11px] font-bold transition-all shadow-sm hover:shadow"
                                            title="Riproduci animazione percorso BPMN"
                                        >
                                            <Play className="w-3.5 h-3.5 mr-1.5" /> Play
                                        </button>
                                    </>
                                )}
                                <span className={`min-w-[120px] whitespace-nowrap justify-center flex items-center px-4 py-1.5 text-[11px] font-bold rounded shadow-sm ${visualizationData?.state === 'COMPLETED' ? 'bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]' : 'bg-[#e0f2fe] text-[#0B1B32] border border-[#bae6fd]'}`}>
                                    {visualizationData?.state === 'ACTIVE' ? 'RUNNING' : (visualizationData?.state === 'COMPLETED' ? '✓ COMPLETED' : (visualizationData?.state || 'Please wait...'))}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 w-full relative min-h-[400px]">
                            {visualizationData ? (
                                <>
                                    {viewStack.length > 0 && (
                                        <button
                                            onClick={() => setViewStack(viewStack.slice(0, -1))}
                                            className="absolute top-2 left-2 z-10 bg-white border border-gray-300 shadow-sm px-3 py-1.5 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-1" /> Upper Level
                                        </button>
                                    )}
                                    <ProcessBpmnViewer
                                        bpmnXml={visualizationData.bpmnXml}
                                        activeNodes={visualizationData.activeNodes}
                                        completedNodes={visualizationData.completedNodes}
                                        sequenceFlows={visualizationData.sequenceFlows}
                                        incidents={visualizationData.incidents}
                                        calledProcessInstances={visualizationData.calledProcessInstances}
                                        onChildProcessClick={(childKey) => setViewStack([...viewStack, childKey])}
                                        playTrigger={playTrigger}
                                        recenterTrigger={recenterTrigger}
                                    />
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 flex-col">
                                    {emergency?.workflowInstanceId ? (
                                        <>
                                            <Loader2 className="animate-spin mb-3 w-8 h-8" />
                                            <span>Loading BPMN diagram and status...</span>
                                        </>
                                    ) : (
                                        <span>No workflow instance ID associated.</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <div className="bg-[#0B1221] rounded-xl border border-gray-800 font-mono text-[12px] text-gray-300 overflow-hidden flex flex-col shadow-2xl">
                                {/* Mac-like Header */}
                                <div className="bg-[#151E32] px-4 py-2.5 flex items-center justify-between border-b border-gray-800">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="text-gray-400 text-[11px] font-semibold tracking-wider flex items-center">
                                        <Terminal className="w-3.5 h-3.5 mr-2 text-[#0088cc]" /> BPMN Services Log • Execution Stream
                                    </div>
                                    <div className="flex space-x-1">
                                        <span className="bg-[#003366] text-[#6ea8fe] px-3 py-1 rounded text-[10px] font-bold cursor-pointer">SYSTEM_LOG</span>
                                    </div>
                                </div>

                                {/* Terminal Body */}
                                <div className="p-5 max-h-[250px] overflow-y-auto space-y-2">
                                    <div className="text-gray-500 mb-4 pb-3 border-b border-gray-800 border-dashed">
                                        {'>_'} SYSTEM_LOG INITIALIZED
                                    </div>

                                    {emergency.history && emergency.history.map((step, index) => (
                                        <div key={index} className="flex items-start">
                                            <span className="text-gray-500 mr-3 w-[70px] shrink-0">[{new Date().toLocaleTimeString().slice(0, 5)}:0{index + 1}]</span>
                                            <span className="text-[#10b981] font-bold mr-2">[TRANSITION]</span>
                                            <span>Transition: <span className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-[10px] mx-1">{step}</span> — Executed successfully</span>
                                        </div>
                                    ))}
                                    {(!emergency.history || emergency.history.length === 0) && (
                                        <div className="text-gray-500 italic">No logs available.</div>
                                    )}

                                    <div className="text-gray-500 mt-4 animate-pulse">
                                        {'>_'} <span className="inline-block w-2 h-4 bg-gray-500 align-middle"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale Escalation Resolution */}
            <EscalationResolutionModal
                ticket={resolvingTicket}
                isOpen={!!resolvingTicket}
                onClose={() => setResolvingTicket(null)}
                onSuccess={() => {
                    // La prossima iterazione del polling aggiornerà automaticamente la lista
                    // O potremmo fare un re-fetch immediato se volessimo
                }}
            />
        </div>
    );
};

export default EmergencyDetail;
