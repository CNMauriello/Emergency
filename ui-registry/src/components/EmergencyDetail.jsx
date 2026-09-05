import React, {useState, useEffect} from 'react';
import {ArrowLeft, CheckCircle2, Circle, Clock, MapPin, Loader2, AlertTriangle, Filter} from 'lucide-react';
import {API_BASE_URL} from '../config.js';

const EmergencyDetail = ({emergencyId, onBack}) => {
    const [emergency, setEmergency] = useState(null);
    const [services, setServices] = useState([]);
    const [capabilities, setCapabilities] = useState([]);

    const [selectedCapability, setSelectedCapability] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dispatching, setDispatching] = useState(false);

    useEffect(() => {
        if (!emergencyId) return;
        const loadCapabilities = async () => {
            try {
                //const headers = {'Authorization': `Bearer ${localStorage.getItem('faro_token')}`};
                const res = await fetch(`${API_BASE_URL}/capabilities`);//, {headers});
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
                const emRes = await fetchWithAuth(`${API_BASE_URL}/Emergency/api/emergencies/${emergencyId}`, {headers});
                if (!emRes.ok) throw new Error(`Emergenza non trovata (Status: ${emRes.status})`);
                const emData = await emRes.json();
                setEmergency(emData);

                const serviceUrl = selectedCapability
                    ? `${API_BASE_URL}/services?capability=${selectedCapability}`
                    : `${API_BASE_URL}/services`;

                const srvRes = await fetch(serviceUrl, {headers});
                if (srvRes.ok) {
                    const srvData = await srvRes.json();
                    setServices(srvData);
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

    const handleManualDispatch = async () => {
        if (!selectedUnit) return;
        setDispatching(true);
        try {
            // Usa il nuovo endpoint PATCH /emergencies/{id}/status invece del POST
            const response = await fetchWithAuth(`${API_BASE_URL}/Emergency/api/emergencies/${emergencyId}/status`, {
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Dettagli e Segnalazioni */}
                <div className="space-y-6 lg:col-span-5">
                    {/* Card Dettagli Operativi */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                            <h2 className="text-lg font-bold text-[#0B1B32] flex items-center">
                                <i className="fas fa-layer-group text-gray-400 mr-2 text-[15px]"></i> Dettagli Operativi
                            </h2>
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 text-[11px] font-mono rounded font-bold uppercase tracking-wider">ID: {emergency.eventId}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-[13px]">
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
                            <div className="col-span-2 pt-4 border-t border-dashed border-gray-200">
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider mb-1 uppercase">INDIRIZZO FISICO</p>
                                <p className="text-[#0B1B32] text-[14px]">{emergency.address || 'Indirizzo non disponibile'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Segnalazioni Correlate */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-[15px] font-bold text-[#0B1B32]">Segnalazioni Correlate (3)</h2>
                        </div>
                        <table className="w-full text-left text-[13px]">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                                    <th className="px-5 py-3">ID CHIAMATA</th>
                                    <th className="px-5 py-3">TIMESTAMP</th>
                                    <th className="px-5 py-3">AFFIDABILITÀ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-5 py-3 font-mono text-gray-600">C-9921</td>
                                    <td className="px-5 py-3 text-gray-600">14:15:02</td>
                                    <td className="px-5 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[11px] font-bold">Alta</span></td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3 font-mono text-gray-600">C-9924</td>
                                    <td className="px-5 py-3 text-gray-600">14:16:45</td>
                                    <td className="px-5 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[11px] font-bold">Alta</span></td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3 font-mono text-gray-600">C-9930</td>
                                    <td className="px-5 py-3 text-gray-600">14:18:10</td>
                                    <td className="px-5 py-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[11px] font-bold">Media</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT COLUMN: Stato Esecuzione Workflow */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 lg:col-span-7">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-5">
                        <h2 className="text-xl font-bold text-[#0B1B32] flex items-center">
                            <i className="fas fa-project-diagram text-gray-400 mr-3 text-[18px]"></i> Stato Esecuzione Workflow
                        </h2>
                        <span className="bg-[#e3f2fd] text-[#1976d2] px-3 py-1 text-[11px] font-bold rounded">Processo BPMN Attivo</span>
                    </div>

                    <div className="relative pl-6 border-l-[3px] border-gray-100 space-y-10 ml-3">
                        
                        {/* Step 1: Completato */}
                        <div className="relative">
                            <div className="w-[26px] h-[26px] bg-[#388e3c] rounded-full absolute -left-[40.5px] flex items-center justify-center border-[4px] border-white text-white">
                                <i className="fas fa-check text-[10px]"></i>
                            </div>
                            <h3 className="font-bold text-gray-500 text-[15px] line-through decoration-gray-300">1. Rilevamento e Categorizzazione</h3>
                            <p className="text-[13px] text-gray-400 mt-1">Completato automaticamente dal sistema AI centrale. (T: 0.2s)</p>
                        </div>

                        {/* Step 2: Completato */}
                        <div className="relative">
                            <div className="w-[26px] h-[26px] bg-[#388e3c] rounded-full absolute -left-[40.5px] flex items-center justify-center border-[4px] border-white text-white">
                                <i className="fas fa-check text-[10px]"></i>
                            </div>
                            <h3 className="font-bold text-gray-500 text-[15px] line-through decoration-gray-300">2. Matching Piano d'Emergenza</h3>
                            <p className="text-[13px] text-gray-400 mt-1">Piano 'Incendio Urbano V2' selezionato e parametri applicati.</p>
                        </div>

                        {/* Step 3: Attivo / Ingaggio Manuale */}
                        {!isDispatchCompleted && (
                            <div className="relative">
                                <div className="w-7 h-7 bg-[#1976d2] rounded-full absolute -left-[42px] flex items-center justify-center border-[4px] border-white shadow-sm">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>
                                <h3 className="font-bold text-[#0B1B32] text-[18px]">3. Ingaggio Manuale Risorsa</h3>
                                <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                                    Azione richiesta: Confermare il dispaccio delle unità di terra raccomandate in base alla prossimità.
                                </p>

                                <div className="bg-white border border-[#1976d2] rounded-md p-5 mt-5 shadow-[0_2px_10px_-3px_rgba(25,118,210,0.3)]">
                                    <div className="mb-4">
                                        <label className="text-[11px] font-bold text-[#1976d2] uppercase mb-2 flex items-center tracking-wider">
                                            <i className="fas fa-hands-helping mr-2 text-[13px]"></i> FORM INTERVENTO MANUALE
                                        </label>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-[13px] font-medium text-[#0B1B32] mb-1.5">
                                            Seleziona Unità d'Intervento (EmergencyService)
                                        </label>
                                        <select
                                            className="w-full border-gray-300 rounded text-[14px] p-2.5 bg-white border outline-none focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] transition-all"
                                            value={selectedUnit}
                                            onChange={(e) => setSelectedUnit(e.target.value)}
                                        >
                                            <option value="">Seleziona unità disponibile...</option>
                                            {services.map(srv => (
                                                <option key={srv.id} value={srv.id}
                                                        disabled={srv.status !== 'ACTIVE' && srv.status !== 'UP'}>
                                                    {srv.type} ({srv.status}) - ID: {srv.id}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-between items-center mt-6">
                                        <p className="text-gray-500 text-[12px]">Il sistema aggiornerà lo stato in 'Dispacciato'</p>
                                        <button
                                            onClick={handleManualDispatch}
                                            disabled={!selectedUnit || dispatching}
                                            className="bg-[#1976d2] hover:bg-blue-700 text-white px-5 py-2.5 rounded text-[13px] font-bold disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            {dispatching ? (
                                                <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Elaborazione...</span>
                                            ) : (
                                                'Conferma Dispaccio'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Completato */}
                        {isDispatchCompleted && (
                            <div className="relative">
                                <div className="w-[26px] h-[26px] bg-[#388e3c] rounded-full absolute -left-[40.5px] flex items-center justify-center border-[4px] border-white text-white">
                                    <i className="fas fa-check text-[10px]"></i>
                                </div>
                                <h3 className="font-bold text-gray-500 text-[15px] line-through decoration-gray-300">3. Ingaggio Manuale Risorsa</h3>
                                <p className="text-[13px] text-gray-400 mt-1">Risorsa ingaggiata manualmente con successo.</p>
                            </div>
                        )}

                        {/* Step 4: Monitoraggio */}
                        <div className={`relative ${!isDispatchCompleted ? 'opacity-40' : ''}`}>
                            {isDispatchCompleted && emergency.status !== 'CLOSED' ? (
                                <div className="w-7 h-7 bg-[#1976d2] rounded-full absolute -left-[42px] flex items-center justify-center border-[4px] border-white shadow-sm">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>
                            ) : (
                                <div className="w-[22px] h-[22px] bg-gray-200 rounded-full absolute -left-[38.5px] border-[4px] border-white"></div>
                            )}
                            <h3 className={`font-bold ${isDispatchCompleted ? 'text-[#0B1B32] text-[18px]' : 'text-gray-400 text-[15px]'}`}>4. Monitoraggio e Chiusura</h3>
                            <p className={`text-[13px] mt-2 ${isDispatchCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
                                {isDispatchCompleted ? 'Il piano operativo sta proseguendo il suo flusso BPMN. In attesa della chiusura.' : 'In attesa del completamento delle fasi precedenti.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
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
        const res = await fetch(`${API_BASE_URL}/capabilities`, { headers });
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
          ? `${API_BASE_URL}/services?capability=${selectedCapability}`
          : `${API_BASE_URL}/services`;

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