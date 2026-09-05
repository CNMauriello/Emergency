import React, {useState, useEffect} from 'react';
import {ArrowLeft, CheckCircle2, Circle, Clock, MapPin, Loader2, AlertTriangle, Filter, Ticket, ShieldAlert} from 'lucide-react';
import {API_BASE_URL, fetchWithAuth} from '../config.js';
import ProcessBpmnViewer from './ProcessBpmnViewer.jsx';
import EscalationResolutionModal from './EscalationResolutionModal.jsx';

const EmergencyDetail = ({emergencyId, onBack}) => {
    const [emergency, setEmergency] = useState(null);
    const [services, setServices] = useState([]);
    const [capabilities, setCapabilities] = useState([]);

    const [selectedCapability, setSelectedCapability] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dispatching, setDispatching] = useState(false);
    const [tickets, setTickets] = useState([]);
    
    // Stato per la modale di risoluzione escalation
    const [resolvingTicket, setResolvingTicket] = useState(null);

    // Stato per la visualizzazione BPMN
    const [visualizationData, setVisualizationData] = useState(null);

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
                console.error("Errore capabilities", err);
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
                const emRes = await fetchWithAuth(`${API_BASE_URL}/api/emergencies/${emergencyId}`, {headers});
                if (!emRes.ok) throw new Error(`Emergenza non trovata (Status: ${emRes.status})`);
                const emData = await emRes.json();
                setEmergency(emData);

                const serviceUrl = selectedCapability
                    ? `${API_BASE_URL}/api/services?capability=${selectedCapability}`
                    : `${API_BASE_URL}/api/services?capability=`;

                const srvRes = await fetchWithAuth(serviceUrl, {headers});
                if (srvRes.ok) {
                    const srvData = await srvRes.json();
                    setServices(srvData);
                }

                const tktRes = await fetchWithAuth(`${API_BASE_URL}/api/operators/escalations/active`, {headers});
                if (tktRes.ok) {
                    const tktData = await tktRes.json();
                    setTickets(tktData);
                }

                setError(null);
            } catch (err) {
                console.error("Errore di connessione", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [emergencyId, selectedCapability]);

    // Polling separato per i dati di visualizzazione del processo BPMN
    useEffect(() => {
        if (!emergency || !emergency.workflowInstanceId) return;

        const fetchVisualization = async () => {
            try {
                // Sostituire l'URL qui se Orchestrator gira su una porta diversa da API_BASE_URL (es. 8080)
                // Ma supponiamo API_BASE_URL passi dal Gateway che instrada a Orchestrator
                const res = await fetchWithAuth(`${API_BASE_URL}/api/process-instances/${emergency.workflowInstanceId}/visualization`);
                if (res.ok) {
                    const data = await res.json();
                    setVisualizationData(data);
                }
            } catch (err) {
                console.error("Errore recupero dati BPMN", err);
            }
        };

        fetchVisualization();
        const interval = setInterval(fetchVisualization, 2000); // 2 secondi come richiesto
        return () => clearInterval(interval);
    }, [emergency]);

    const handleManualDispatch = async () => {
        if (!selectedUnit) return;
        setDispatching(true);
        try {
            // Usa il nuovo endpoint PATCH /emergencies/{id}/status invece del POST
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

            if (!response.ok) throw new Error('Errore durante l\'aggiornamento di stato dal backend');

            setSelectedUnit('');
        } catch (err) {
            console.error("Errore durante l'ingaggio", err);
            alert("Impossibile confermare l'aggiornamento di stato: " + err.message);
        } finally {
            setDispatching(false);
        }
    };

    if (!emergencyId) return <div className="p-8 text-gray-500">Nessuna emergenza selezionata.</div>;
    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-500"/></div>;

    if (error || !emergency) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 text-sm font-bold">
                    <ArrowLeft className="w-4 h-4 mr-1"/> Torna alla lista
                </button>
                <div className="flex flex-col items-center justify-center py-20">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4"/>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Impossibile caricare i dettagli</h2>
                    <p className="text-red-600 font-mono text-sm">{error || "Dati non disponibili"}</p>
                </div>
            </div>
        );
    }

    const isDispatchCompleted = emergency.status === 'MONITORING' || emergency.status === 'CLOSED' ||
        (emergency.history && emergency.history.some(h => h.includes('INGAGGIATA')));

    const emergencyTickets = tickets.filter(t => (t.eventId === emergency.eventId || t.event_id === emergency.eventId));

    return (
        <div className="p-8 bg-transparent min-h-screen">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 text-sm font-bold">
                <ArrowLeft className="w-4 h-4 mr-1"/> Torna alla lista
            </button>

            <div className="flex items-center space-x-4 mb-8">
                <h1 className="text-[28px] font-bold text-[#0B1B32]">{emergency.eventType.replace('_', ' ')}</h1>
                <span className={`px-2.5 py-1 text-[11px] font-bold text-white rounded ${emergency.severity === 'CRITICA' || emergency.severity === 'CRITICAL' ? 'bg-[#d32f2f]' : 'bg-[#ed6c02]'}`}>
                    {emergency.severity}
                </span>
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded ${emergency.status === 'CLOSED' ? 'bg-gray-200 text-gray-700' : 'bg-[#0088cc] text-white'}`}>
                    {emergency.status}
                </span>
            </div>

            <div className="flex flex-col gap-8">
                {/* TOP SECTION: Dettagli Operativi */}
                <div className="w-full">
                    {/* Card Dettagli Operativi */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                            <h2 className="text-lg font-bold text-[#0B1B32] flex items-center">
                                <i className="fas fa-layer-group text-gray-400 mr-2 text-[15px]"></i> Dettagli Operativi
                            </h2>
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 text-[11px] font-mono rounded font-bold uppercase tracking-wider">ID: {emergency.eventId}</span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-y-6 gap-x-6 text-[13px] items-start">
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider mb-1 uppercase">TIPOLOGIA</p>
                                <p className="font-semibold text-[#0B1B32]">{emergency.eventType.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider mb-1 uppercase">ORARIO RILEVAMENTO</p>
                                <p className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 inline-block text-[12px]">{emergency.timestamp || new Date().toISOString().slice(0, 19).replace('T', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider mb-1 uppercase">COORDINATE (LAT/LONG)</p>
                                <p className="text-gray-700 font-mono text-[12px]">{emergency.latitude}° N, {emergency.longitude}° E</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider mb-1 uppercase">FONTE SEGNALAZIONE</p>
                                <p className="text-gray-700 flex items-center"><i className="fas fa-phone-alt text-gray-400 mr-1.5 text-[10px]"></i> 112 Centrale</p>
                            </div>
                            <div className="col-span-2 lg:col-span-1 lg:pl-6 lg:border-l border-dashed border-gray-200">
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider mb-1 uppercase">INDIRIZZO FISICO</p>
                                <p className="text-[#0B1B32] text-[14px]">{emergency.address || 'Indirizzo non disponibile'}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* MIDDLE SECTION: Tickets di Escalation */}
                {emergencyTickets.length > 0 && (
                    <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200 w-full">
                        <div className="flex items-center justify-between border-b border-red-200 pb-4 mb-5">
                            <h2 className="text-lg font-bold text-red-800 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" /> Ticket di Escalation Aperti (Richiesta Intervento)
                            </h2>
                            <span className="bg-red-200 text-red-800 px-2 py-1 text-[11px] font-bold rounded uppercase">
                                {emergencyTickets.length} Attivi
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {emergencyTickets.map((ticket, idx) => (
                                <div key={idx} className="bg-white p-4 rounded border border-red-100 shadow-sm border-l-4 border-l-red-500 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800">{ticket.taskName || ticket.name || 'Intervento Richiesto'}</h3>
                                            <span className="text-[10px] font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                                {ticket.taskId || ticket.id || ticket.ticketId}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {ticket.message || ticket.description || 'Richiesta di intervento o validazione umana necessaria per far avanzare il processo BPMN.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        <div className="text-[11px] text-gray-400">
                                            <span className="font-semibold text-gray-600">Creazione:</span> {ticket.timestamp || ticket.createdAt || new Date().toISOString().slice(0,19).replace('T', ' ')}
                                        </div>
                                        <button 
                                            onClick={() => setResolvingTicket(ticket)}
                                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded flex items-center transition-colors"
                                        >
                                            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Risolvi Escalation
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BOTTOM SECTION: Stato Esecuzione Workflow (BPMN) */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full flex flex-col h-full min-h-[600px]">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-5">
                        <h2 className="text-xl font-bold text-[#0B1B32] flex items-center">
                            <i className="fas fa-project-diagram text-gray-400 mr-3 text-[18px]"></i> Stato Esecuzione Workflow
                        </h2>
                        <span className="bg-[#e3f2fd] text-[#1976d2] px-3 py-1 text-[11px] font-bold rounded">
                            {visualizationData?.state === 'ACTIVE' ? 'Processo BPMN Attivo' : (visualizationData?.state || 'Attendere...')}
                        </span>
                    </div>

                    <div className="flex-1 w-full relative min-h-[400px]">
                        {visualizationData ? (
                            <ProcessBpmnViewer
                                bpmnXml={visualizationData.bpmnXml}
                                activeNodes={visualizationData.activeNodes}
                                completedNodes={visualizationData.completedNodes}
                                sequenceFlows={visualizationData.sequenceFlows}
                                incidents={visualizationData.incidents}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 flex-col">
                                {emergency?.workflowInstanceId ? (
                                    <>
                                        <Loader2 className="animate-spin mb-3 w-8 h-8" /> 
                                        <span>Caricamento diagramma e stato BPMN...</span>
                                    </>
                                ) : (
                                    <span>Nessun workflow instance ID associato.</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modale Risoluzione Escalation */}
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

// FAKE
/*
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Clock, MapPin, Loader2, AlertTriangle, Filter } from 'lucide-react';
import { API_BASE_URL, fetchWithAuth } from '../config.js';

const EmergencyDetail = ({ emergencyId, onBack }) => {
  const [emergency, setEmergency] = useState(null);
  const [services, setServices] = useState([]);
  const [capabilities, setCapabilities] = useState([]);

  const [selectedCapability, setSelectedCapability] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  // STATO MOCK: Ricorda se il task manuale è stato completato
  const [isMockDispatched, setIsMockDispatched] = useState(false);

  useEffect(() => {
    setIsMockDispatched(false);
  }, [emergencyId]);

  useEffect(() => {
    if (!emergencyId) return;
    const loadCapabilities = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('faro_token')}` };
        const res = await fetch(`${API_BASE_URL}/api/capabilities`, { headers });
        if (res.ok) {
          const data = await res.json();
          setCapabilities(data);
        }
      } catch (err) {
        console.error("Errore capabilities", err);
      }
    };
    loadCapabilities();
  }, [emergencyId]);

  useEffect(() => {
    if (!emergencyId) return;

    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('faro_token')}`,
          'Content-Type': 'application/json'
        };

        // --- MOCK DELL'EMERGENZA AVANZATO ---
        const emData = {
          id: emergencyId,
          eventId: `EVT-2026-TEST-${emergencyId}`,
          eventType: emergencyId === 101 ? 'FIRE' : 'CAR_CRASH',
          severity: 'CRITICA',
          // Lo stato rimane correttamente IN_PROGRESS
          status: 'IN_PROGRESS',
          latitude: 41.9028,
          longitude: 12.4964,
          workflowInstanceId: `WF-TEST-${emergencyId}`,
          history: isMockDispatched
            ? ['OPEN', 'IN_PROGRESS', 'TASK INGAGGIO COMPLETATO']
            : ['OPEN', 'IN_PROGRESS']
        };
        setEmergency(emData);

        // --- CHIAMATA REALE AL REGISTRY SERVICE ---
        const serviceUrl = selectedCapability
          ? `${API_BASE_URL}/api/services?capability=${selectedCapability}`
          : `${API_BASE_URL}/api/services?capability=`;

        const srvRes = await fetch(serviceUrl, { headers });
        if (srvRes.ok) {
          const srvData = await srvRes.json();
          setServices(srvData);
        }

        setError(null);
      } catch (err) {
        console.error("Errore di connessione", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [emergencyId, selectedCapability, isMockDispatched]);

  const handleManualDispatch = async () => {
    if (!selectedUnit) return;
    setDispatching(true);

    // Simuliamo il completamento del task
    setTimeout(() => {
      setIsMockDispatched(true); // Nasconde il form, ma lo status resta IN_PROGRESS
      setSelectedUnit('');
      setDispatching(false);
    }, 1000);
  };

  if (!emergencyId) return <div className="p-8 text-gray-500">Nessuna emergenza selezionata.</div>;
  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>;

  if (error || !emergency) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 text-sm font-bold">
          <ArrowLeft className="w-4 h-4 mr-1" /> Torna alla lista
        </button>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Impossibile caricare i dettagli</h2>
          <p className="text-red-600 font-mono text-sm">{error || "Dati non disponibili"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-800 mb-4 text-sm font-bold">
        <ArrowLeft className="w-4 h-4 mr-1" /> Torna alla lista
      </button>

      <div className="flex items-center space-x-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Emergenza: {emergency.eventType}</h1>
        <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">{emergency.severity}</span>

        <span className="bg-blue-500 px-2 py-1 text-xs font-bold rounded text-white">
                  {emergency.status}
                </span>
        </div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="space-y-6 lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-500" /> Dettagli Operativi
                </h2>
                <span className="bg-gray-100 text-gray-500 px-2 py-1 text-xs font-mono rounded">ID: {emergency.id}</span>
            </div>
            <div className="space-y-3 text-sm">
                <div>
                    <p className="text-gray-500 mb-1">EVENT ID ORIGINALE</p>
                    <p className="font-mono text-gray-800 bg-gray-100 p-1 rounded inline-block">{emergency.eventId}</p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">COORDINATE</p>
                    <p className="text-gray-800">Lat: {emergency.latitude}, Lng: {emergency.longitude}</p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">WORKFLOW INSTANCE</p>
                    <p className="text-gray-800 font-mono text-xs">{emergency.workflowInstanceId || 'N/A'}</p>
                </div>
            </div>
        </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-500" /> Stato Esecuzione Workflow
            </h2>
        </div>

        <div className="relative pl-4 border-l-2 border-gray-200 space-y-8 ml-2">
            {emergency.history && emergency.history.map((step, index) => (
                <div key={index} className="relative">
                    <CheckCircle2 className="w-6 h-6 text-green-500 absolute -left-[1.65rem] bg-white" />
                    <h3 className="font-bold text-gray-800">Transizione: {step}</h3>
                    <p className="text-sm text-gray-500">Eseguita con successo</p>
                </div>
            ))}

            {emergency.status === 'IN_PROGRESS' && !isMockDispatched && (
                <div className="relative">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white absolute -left-[1.65rem] flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Ingaggio Manuale Risorsa</h3>

                    <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-5 mt-4">
                        <div className="mb-4 border-b border-blue-200 pb-4">
                            <label className="block text-xs font-bold text-blue-800 uppercase mb-2 flex items-center">
                                <Filter className="w-3 h-3 mr-1" /> Filtra risorse per Capability
                            </label>
                            <select
                                className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm bg-white border focus:ring-blue-500 focus:border-blue-500"
                                value={selectedCapability}
                                onChange={(e) => {
                                    setSelectedCapability(e.target.value);
                                    setSelectedUnit('');
                                }}
                            >
                                <option value="">Mostra tutte le unità (Nessun filtro)</option>
                                {capabilities.map(cap => (
                                    <option key={cap.id || cap.name} value={cap.name}>
                                        {cap.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Seleziona Unità d'Intervento
                        </label>
                        <select
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 mb-3 bg-white border"
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                        >
                            <option value="">Seleziona unità disponibile...</option>
                            {services.map(srv => (
                                <option key={srv.id} value={srv.id} disabled={srv.status !== 'ACTIVE' && srv.status !== 'UP'}>
                                    {srv.type} (Carico: {srv.currentLoad} - Latenza: {srv.avgLatency}ms) - {srv.status}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleManualDispatch}
                            disabled={!selectedUnit || dispatching}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold disabled:bg-blue-300 transition-colors"
                        >
                            {dispatching ? 'Acquisizione Lock in corso...' : 'Conferma Dispaccio'}
                        </button>
                    </div>
                </div>
            )}

            {emergency.status === 'IN_PROGRESS' && isMockDispatched && (
                <div className="relative">
                    <CheckCircle2 className="w-6 h-6 text-green-500 absolute -left-[1.65rem] bg-white" />
                    <h3 className="font-bold text-gray-800 line-through">Ingaggio Manuale Risorsa</h3>
                    <p className="text-sm text-gray-500">Risorsa ingaggiata manualmente con successo.</p>
                </div>
            )}

            <div className={`relative ${!isMockDispatched ? 'opacity-50' : ''}`}>
                {isMockDispatched ? (
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white absolute -left-[1.65rem] flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                ) : (
                    <Circle className="w-6 h-6 text-gray-300 absolute -left-[1.65rem] bg-white" />
                )}
                <h3 className={`font-bold ${isMockDispatched ? 'text-gray-900 text-lg' : 'text-gray-500'}`}>Monitoraggio e Chiusura</h3>
                <p className={`text-sm ${isMockDispatched ? 'text-gray-600' : 'text-gray-400'}`}>
                    {isMockDispatched ? 'Il piano operativo sta proseguendo il suo flusso BPMN. In attesa della chiusura.' : 'In attesa del completamento delle fasi precedenti.'}
                </p>
            </div>

        </div>
    </div>
</div>
</div>
);
};

export default EmergencyDetail;
*/