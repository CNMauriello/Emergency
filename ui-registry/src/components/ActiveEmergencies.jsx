import React, {useState, useEffect} from 'react';
import {Flame, Home, Clock, AlertTriangle, Loader2, Car, Wind, Droplets, CheckCircle2, MapPin} from 'lucide-react';
import { API_BASE_URL, fetchWithAuth } from '../config.js';

const ActiveEmergencies = ({onViewDetail}) => {
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mappa i tipi di emergenza con icone specifiche
    const getIconForType = (eventType) => {
        switch (eventType) {
            case 'FIRE':
                return <Flame className="text-red-500 w-6 h-6"/>;
            case 'FLOOD':
                return <Droplets className="text-blue-500 w-6 h-6"/>;
            case 'CAR_CRASH':
                return <Car className="text-orange-500 w-6 h-6"/>;
            case 'GAS_LEAK':
                return <Wind className="text-yellow-500 w-6 h-6"/>;
            default:
                return <Home className="text-gray-500 w-6 h-6"/>;
        }
    };

    // Calcola i label degli step e lo step corrente in base all'emergenza
    const getWorkflowInfo = (em) => {
        // Definiamo i nomi degli step in base al tipo di evento
        const steps = em.eventType === 'FIRE'
            ? ['Dispatch', 'Containment', 'Resolution']
            : ['Assessment', 'Dispatch', 'Resolution'];

        // Mappiamo lo stato del backend (OPEN, IN_PROGRESS, CLOSED) su un indice numerico (1, 2, 3)
        let currentStep = 1;
        if (em.status === 'IN_PROGRESS') currentStep = 2;
        if (em.status === 'CLOSED') currentStep = 3;

        return {steps, currentStep};
    };


    /*
        // FAKE Funzione per recuperare le emergenze dal backend
        const fetchEmergencies = async () => {
            try {
                // MOCK TEMPORANEO: Il backend emergenze è spento, usiamo dati finti
                setEmergencies([
                    {
                        id: 101,
                        eventId: 'EVT-2026-8901',
                        eventType: 'FIRE',
                        severity: 'CRITICA',
                        status: 'IN_PROGRESS',
                        latitude: 41.9028,
                        longitude: 12.4964,
                        timestamp: '14:28 (4m ago)'
                    },
                    {
                        id: 102,
                        eventId: 'EVT-2026-8902',
                        eventType: 'CAR_CRASH',
                        severity: 'ALTA',
                        status: 'OPEN',
                        latitude: 45.4642,
                        longitude: 9.1900,
                        timestamp: '14:15 (17m ago)'
                    }
                ]);
                setError(null);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

    */
    const fetchEmergencies = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/Emergency/api/emergencies`);

            // Fallback temporaneo per testare la UI in caso di assenza del backend
            if (!response.ok) {
                throw new Error('Errore nel recupero emergenze');
            }

            const data = await response.json();
            setEmergencies(data);
            setError(null);
        } catch (err) {

            console.error("Impossibile recuperare le emergenze:", err);
            setError(err.message); // Salva il VERO messaggio di errore
            setEmergencies([]);    // Assicurati che la lista sia vuota

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchEmergencies();
        // Polling ogni 5 secondi
        const interval = setInterval(fetchEmergencies, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4"/>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Impossibile connettersi al Server</h2>
                <p className="text-red-600 font-mono text-sm">{error}</p>
                <p className="text-gray-500 mt-4 text-sm">Assicurati che il Gestore Operatori di Sala sia in
                    esecuzione.</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-transparent min-h-screen">
            <div className="mb-6">
                <h1 className="text-[28px] font-bold text-[#0B1B32]">Active Emergencies</h1>
                <p className="text-gray-500 mt-1">Real-time monitoring and orchestration dashboard.</p>
            </div>

            <div className="space-y-4">
                {emergencies.map((em) => {
                    const {steps, currentStep} = getWorkflowInfo(em);
                    const isCritical = em.severity === 'CRITICA' || em.severity === 'CRITICAL';
                    const severityColor = isCritical ? 'bg-[#d32f2f]' : 'bg-[#ed6c02]';
                    const severityBorder = isCritical ? 'border-[#d32f2f]' : 'border-[#ed6c02]';

                    return (
                        <div
                            key={em.id}
                            onClick={() => onViewDetail && onViewDetail(em.eventId || em.id)}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm flex overflow-hidden cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
                        >
                            {/* Indicatore di gravità laterale */}
                            <div className={`w-1.5 ${severityColor}`}></div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                                {/* Header Card */}
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded ${severityColor}`}>
                                            {em.severity}
                                        </span>
                                        <span className="text-[13px] text-gray-500 font-medium">{em.eventId || `ID: ${em.id}`}</span>
                                        {em.timestamp && (
                                            <span className="text-[13px] text-gray-500 flex items-center font-medium">
                                                <Clock className="w-3.5 h-3.5 mr-1"/> {em.timestamp}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded border ${em.status === 'IN_PROGRESS' ? 'bg-[#e3f2fd] text-[#1976d2] border-[#bbdefb]' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                        {em.status}
                                    </span>
                                </div>

                                {/* Body Card */}
                                <div className="flex justify-between items-center">
                                    {/* Dettagli Evento */}
                                    <div className="flex space-x-4">
                                        <div className="mt-0.5 opacity-80">{getIconForType(em.eventType)}</div>
                                        <div>
                                            <h2 className="text-[17px] font-bold text-[#0B1B32] uppercase tracking-wide">{em.eventType.replace('_', ' ')}</h2>
                                            {em.address && (
                                                <p className="text-[13px] text-gray-600 flex items-center mt-1 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400"/> {em.address}
                                                </p>
                                            )}
                                            <p className="text-gray-400 text-[12px] font-mono mt-1 flex items-center gap-2">
                                                <span>Lat: {em.latitude}</span>, <span>Lng: {em.longitude}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Workflow Status Progress Bar */}
                                    <div className="w-[350px]">
                                        <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-3">WORKFLOW STATUS</p>
                                        <div className="flex items-center justify-between relative px-2">
                                            {/* Linea di base grigia */}
                                            <div className="absolute left-4 right-4 top-1/2 h-[2px] bg-gray-200 border-t border-b border-dashed border-gray-300 -z-10 transform -translate-y-1/2"></div>

                                            {/* Linea di progresso blu */}
                                            <div
                                                className="absolute left-4 top-1/2 h-[2px] bg-[#1976d2] -z-10 transform -translate-y-1/2 transition-all duration-500"
                                                style={{width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : 'calc(100% - 2rem)'}}
                                            ></div>

                                            {/* Step 1 */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${currentStep > 1 ? 'bg-[#1976d2] text-white' : currentStep === 1 ? 'bg-white border-[3px] border-[#1976d2]' : 'bg-white border-2 border-gray-300'}`}>
                                                    {currentStep > 1 ? <CheckCircle2 className="w-3.5 h-3.5"/> : currentStep === 1 && <div className="w-1.5 h-1.5 rounded-full bg-[#1976d2]"></div>}
                                                </div>
                                                <span className={`text-[11px] mt-2 absolute -bottom-5 ${currentStep === 1 ? 'font-bold text-[#0B1B32]' : 'text-gray-500'}`}>{steps[0]}</span>
                                            </div>

                                            {/* Step 2 */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-white ${currentStep > 2 ? 'bg-[#1976d2] text-white border-0' : currentStep === 2 ? 'border-[3px] border-[#1976d2]' : 'border-2 border-gray-300'}`}>
                                                    {currentStep > 2 ? <CheckCircle2 className="w-3.5 h-3.5"/> : currentStep === 2 && <div className="w-1.5 h-1.5 rounded-full bg-[#1976d2]"></div>}
                                                </div>
                                                <span className={`text-[11px] mt-2 absolute -bottom-5 ${currentStep === 2 ? 'font-bold text-[#0B1B32]' : 'text-gray-500'}`}>{steps[1]}</span>
                                            </div>

                                            {/* Step 3 */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-white ${currentStep === 3 ? 'border-[3px] border-[#1976d2]' : 'border-2 border-gray-300'}`}>
                                                    {currentStep === 3 && <div className="w-1.5 h-1.5 rounded-full bg-[#1976d2]"></div>}
                                                </div>
                                                <span className={`text-[11px] mt-2 absolute -bottom-5 ${currentStep === 3 ? 'font-bold text-[#0B1B32]' : 'text-gray-500'}`}>{steps[2]}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActiveEmergencies;