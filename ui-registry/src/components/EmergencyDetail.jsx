import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Clock, MapPin, Loader2, AlertTriangle, Filter } from 'lucide-react';
import { API_BASE_URL } from '../config.js';

const EmergencyDetail = ({ emergencyId, onBack }) => {
    const [emergency, setEmergency] = useState(null);
    const [services, setServices] = useState([]);
    const [capabilities, setCapabilities] = useState([]);

    const [selectedCapability, setSelectedCapability] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dispatching, setDispatching] = useState(false);

    // 1. Carica le capability dal database all'avvio
    useEffect(() => {
        if (!emergencyId) {
            return <div className="p-8 text-red-500">Nessuna emergenza selezionata.</div>;
        }

        const loadCapabilities = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${localStorage.getItem('faro_token')}` };
                const res = await fetch(`${API_BASE_URL}/capabilities`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setCapabilities(data);
                }
            } catch (err) {
                console.error("Errore durante il recupero delle capability", err);
            }
        };

        loadCapabilities();
    }, [emergencyId]);

    // 2. Polling per lo stato dell'emergenza e l'elenco dei servizi (filtrati)
    useEffect(() => {
        if (!emergencyId) return;

        const fetchData = async () => {
            try {
                const headers = {
                    'Authorization': `Bearer ${localStorage.getItem('faro_token')}`,
                    'Content-Type': 'application/json'
                };

                // Aggiorna lo stato dell'emergenza
                const emRes = await fetch(`${API_BASE_URL}/emergencies/${emergencyId}`, { headers });
                if (!emRes.ok) throw new Error(`Emergenza non trovata (Status: ${emRes.status})`);
                const emData = await emRes.json();
                setEmergency(emData);

                // Discovery dei servizi: applica il filtro capability se selezionato dall'operatore
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
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [emergencyId, selectedCapability]); // Ri-esegue se cambia l'ID o il filtro capability

    const handleManualDispatch = async () => {
        if (!selectedUnit) return;
        setDispatching(true);
        try {
            const response = await fetch(`${API_BASE_URL}/emergencies/${emergencyId}/override-dispatch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('faro_token')}`
                },
                body: JSON.stringify({ serviceId: selectedUnit })
            });

            if (!response.ok) throw new Error('Errore durante il dispaccio');

            setSelectedUnit(''); // Reset selezione
        } catch (err) {
            console.error("Errore durante l'ingaggio", err);
            alert("Impossibile confermare il dispaccio: " + err.message);
        } finally {
            setDispatching(false);
        }
    };

    // VISTE DI RENDER
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
                <span className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">{emergency.status}</span>
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

                        {emergency.status === 'IN_PROGRESS' && (
                            <div className="relative">
                                <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white absolute -left-[1.65rem] flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Ingaggio Manuale Risorsa</h3>

                                <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-5 mt-4">

                                    {/* FILTRO DINAMICO CAPABILITY */}
                                    <div className="mb-4 border-b border-blue-200 pb-4">
                                        <label className="block text-xs font-bold text-blue-800 uppercase mb-2 flex items-center">
                                            <Filter className="w-3 h-3 mr-1" /> Filtra risorse per Capability
                                        </label>
                                        <select
                                            className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm bg-white border focus:ring-blue-500 focus:border-blue-500"
                                            value={selectedCapability}
                                            onChange={(e) => {
                                                setSelectedCapability(e.target.value);
                                                setSelectedUnit(''); // Se cambia il filtro, resetta l'unità selezionata
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyDetail;