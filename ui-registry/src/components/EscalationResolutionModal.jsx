import React, { useState, useEffect } from 'react';
import { X, Radio, ShieldAlert, Wifi, AlertTriangle, CheckCircle2, Shield, Loader2, Server, Power, Activity, ChevronRight, Terminal } from 'lucide-react';
import { API_BASE_URL, fetchWithAuth, getAuthUser } from '../config.js';

const EscalationResolutionModal = ({ ticket, isOpen, onClose, onSuccess }) => {
    const [currentLevel, setCurrentLevel] = useState(1);
    const [levelStatus, setLevelStatus] = useState('idle'); // idle, running, failed, success
    const [logs, setLogs] = useState([]);
    
    // States for specific levels
    const [l1Nodes, setL1Nodes] = useState([]);
    const [l2AuthCode, setL2AuthCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCurrentLevel(1);
            setLevelStatus('idle');
            const tid = ticket?.taskId || ticket?.ticketId || ticket?.id || 'Sconosciuto';
            setLogs([`Iniziata procedura di risoluzione per ticket ${tid}`]);
            
            const eps = ticket?.failedEndpoints || [];
            if (eps.length > 0) {
                setL1Nodes(eps.map((ep, i) => ({ id: i, url: ep, status: 'pending' })));
            } else {
                setL1Nodes(Array.from({length: 6}).map((_, i) => ({ id: i, url: `http://node-${i}.local`, status: 'pending' })));
            }
        }
    }, [isOpen, ticket]);

    if (!isOpen || !ticket) return null;

    const addLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const resolveEscalation = async (strategy, justification) => {
        setSubmitting(true);
        try {
            const user = getAuthUser();
            const operatorId = user?.username || user?.id || 'OP-ADMIN';
            
            const payload = {
                operatorId,
                resolutionStrategy: strategy,
                justification: logs.join(' | ') + ' | ' + justification
            };

            const tid = ticket?.taskId || ticket?.ticketId || ticket?.id;
            const response = await fetchWithAuth(`${API_BASE_URL}/api/operators/escalations/${tid}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Errore durante la chiusura del ticket');
            
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Errore di comunicazione col server: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const startLevel1 = () => {
        if (levelStatus === 'running') return;
        setLevelStatus('running');
        addLog("Avvio Broadcast Alert parallelo verso i nodi telematici...");
        
        Promise.all(l1Nodes.map(async (node, i) => {
            try {
                // Aggiungiamo un leggero ritardo casuale per visualizzare l'animazione di broadcast
                const delay = Math.random() * 1000 + 500;
                await new Promise(r => setTimeout(r, delay));

                const response = await fetchWithAuth(node.url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    setL1Nodes(prev => {
                        const next = [...prev];
                        next[i] = { ...next[i], status: 'success' };
                        return next;
                    });
                    addLog(`Nodo ${node.url} - Risposta POSITIVA ricevuta`);
                    return true;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (err) {
                setL1Nodes(prev => {
                    const next = [...prev];
                    next[i] = { ...next[i], status: 'failed' };
                    return next;
                });
                addLog(`Nodo ${node.url} - Fallito: ${err.message}`);
                return false;
            }
        })).then(results => {
            const anySuccess = results.some(r => r);
            if (anySuccess) {
                setLevelStatus('success');
                addLog("Broadcast completato con successo: almeno un ente ha accettato l'ingaggio in parallelo!");
                // Risolviamo l'escalation automaticamente dato che il broadcast è andato a buon fine
                resolveEscalation("LEVEL_1_BROADCAST", "Risolto automaticamente tramite Broadcast Parallelo su rete telematico.");
            } else {
                setLevelStatus('failed');
                addLog("Broadcast fallito: nessuna disponibilità trovata sulla rete ordinaria.");
            }
        });
    };

    const proceedToLevel2 = () => {
        setCurrentLevel(2);
        setLevelStatus('idle');
        addLog("Passaggio al Livello 2: Ingaggio Fuori Banda attivato.");
    };

    const handleLevel2Success = () => {
        if (!l2AuthCode) {
            alert("Inserire un codice di autorizzazione o motivazione.");
            return;
        }
        addLog(`Autorizzazione vocale ricevuta. Codice: ${l2AuthCode}`);
        resolveEscalation("LEVEL_2_OUT_OF_BAND", `Risolto tramite contatto radio TETRA. Codice: ${l2AuthCode}`);
    };

    const handleLevel2Fail = () => {
        addLog("Contatto radio fallito. Nessun ente disponibile fisicamente.");
        setCurrentLevel(3);
        setLevelStatus('idle');
        addLog("Passaggio al Livello 3: Escalation Estrema.");
    };

    const handleLevel3Resolve = () => {
        addLog("Autorizzazione Militare confermata.");
        resolveEscalation("LEVEL_3_EXTREME_MILITARY", "Risolto tramite intervento Forze Armate / Prefettura, bypass discovery.");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity">
            <div className="bg-[#0B1B32] text-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col h-[85vh]">
                
                {/* HEADER */}
                <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-wide">Risoluzione Escalation</h2>
                            <p className="text-xs text-gray-400 font-mono">TICKET ID: {ticket.taskId || ticket.ticketId || ticket.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400 hover:text-white" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT PANEL - LEVELS */}
                    <div className="w-1/3 border-r border-gray-800 p-6 bg-gray-900/30 flex flex-col justify-between">
                        <div className="space-y-6">
                            {/* LEVEL 1 INDICATOR */}
                            <div className={`relative p-4 rounded-xl border transition-colors ${currentLevel === 1 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-800 opacity-50'}`}>
                                <div className="flex items-center space-x-3">
                                    <Wifi className={`w-6 h-6 ${currentLevel === 1 ? 'text-blue-400' : 'text-gray-500'}`} />
                                    <div>
                                        <h3 className="font-bold text-sm">Livello 1</h3>
                                        <p className="text-xs text-gray-400">Broadcast Alert</p>
                                    </div>
                                </div>
                                {currentLevel === 1 && levelStatus === 'failed' && <X className="absolute right-4 top-5 text-red-500 w-5 h-5" />}
                            </div>

                            {/* LEVEL 2 INDICATOR */}
                            <div className={`relative p-4 rounded-xl border transition-colors ${currentLevel === 2 ? 'border-orange-500 bg-orange-900/20' : 'border-gray-800 opacity-50'}`}>
                                <div className="flex items-center space-x-3">
                                    <Radio className={`w-6 h-6 ${currentLevel === 2 ? 'text-orange-400' : 'text-gray-500'}`} />
                                    <div>
                                        <h3 className="font-bold text-sm">Livello 2</h3>
                                        <p className="text-xs text-gray-400">Fuori Banda (TETRA)</p>
                                    </div>
                                </div>
                                {currentLevel === 2 && levelStatus === 'failed' && <X className="absolute right-4 top-5 text-red-500 w-5 h-5" />}
                            </div>

                            {/* LEVEL 3 INDICATOR */}
                            <div className={`relative p-4 rounded-xl border transition-all ${currentLevel === 3 ? 'border-red-500 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-105' : 'border-gray-800 opacity-50'}`}>
                                <div className="flex items-center space-x-3">
                                    <ShieldAlert className={`w-6 h-6 ${currentLevel === 3 ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} />
                                    <div>
                                        <h3 className="font-bold text-sm">Livello 3</h3>
                                        <p className="text-xs text-gray-400">Escalation Estrema</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TERMINAL LOG */}
                        <div className="mt-8 flex-1 bg-black rounded-lg border border-gray-800 p-3 font-mono text-[10px] text-green-400 overflow-y-auto flex flex-col max-h-[250px] shadow-inner">
                            <div className="flex items-center text-gray-500 mb-2 border-b border-gray-800 pb-2">
                                <Terminal className="w-3 h-3 mr-2" /> SYSTEM_LOG
                            </div>
                            <div className="space-y-1">
                                {logs.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL - MAIN ACTION AREA */}
                    <div className="w-2/3 p-8 flex flex-col relative overflow-y-auto">
                        
                        {/* LEVEL 1 UI */}
                        {currentLevel === 1 && (
                            <div className="flex flex-col h-full justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-light mb-2">Broadcast Telematico</h2>
                                    <p className="text-gray-400 text-sm">Chiamata parallela a tutti i servizi del territorio registrati.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-6 mb-12 px-8">
                                    {l1Nodes.map((node) => {
                                        const urlObj = new URL(node.url.startsWith('http') ? node.url : `http://${node.url}`);
                                        const shortName = urlObj.hostname.split('.')[0] || `NODE_${node.id}`;
                                        
                                        return (
                                            <div key={node.id} className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-500 ${node.status === 'pending' ? 'border-gray-700 bg-gray-800/50' : (node.status === 'success' ? 'border-green-500/50 bg-green-900/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-red-500/50 bg-red-900/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]')}`}>
                                                <Server className={`w-8 h-8 mb-3 transition-colors ${node.status === 'pending' ? 'text-gray-500' : (node.status === 'success' ? 'text-green-400' : 'text-red-400')}`} />
                                                <div className="text-xs font-mono text-gray-400 truncate max-w-full px-2" title={node.url}>{shortName}</div>
                                                <div className={`text-[10px] mt-2 px-2 py-1 rounded transition-colors ${node.status === 'pending' ? 'bg-gray-800 text-gray-500' : (node.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}`}>
                                                    {node.status === 'pending' ? (levelStatus === 'running' ? 'PINGING...' : 'IDLE') : (node.status === 'success' ? 'ACCETTATO' : 'FALLITO/404')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-center mt-auto">
                                    {levelStatus === 'idle' && (
                                        <button onClick={startLevel1} className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold tracking-wide transition-all overflow-hidden flex items-center">
                                            <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
                                            <Power className="w-5 h-5 mr-2" /> ESEGUI BROADCAST PING
                                        </button>
                                    )}
                                    {levelStatus === 'running' && (
                                        <div className="flex items-center text-blue-400 font-mono tracking-widest animate-pulse">
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            SCANSIONE RETE IN CORSO...
                                        </div>
                                    )}
                                    {levelStatus === 'failed' && (
                                        <button onClick={proceedToLevel2} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded-full font-bold transition-all flex items-center shadow-lg">
                                            RETE NON DISPONIBILE - PROCEDI AL LIVELLO 2 <ChevronRight className="w-5 h-5 ml-2" />
                                        </button>
                                    )}
                                    {levelStatus === 'success' && (
                                        <div className="flex items-center px-8 py-3 bg-green-900/50 border border-green-500/50 text-green-400 rounded-full font-bold">
                                            <CheckCircle2 className="w-5 h-5 mr-2" /> INTERVENTO ASSEGNATO
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* LEVEL 2 UI */}
                        {currentLevel === 2 && (
                            <div className="flex flex-col h-full justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center mb-10">
                                    <div className="inline-block p-4 bg-orange-500/10 rounded-full mb-4">
                                        <Radio className="w-12 h-12 text-orange-500" />
                                    </div>
                                    <h2 className="text-3xl font-light mb-2 text-orange-50">Ingaggio Fuori Banda</h2>
                                    <p className="text-orange-200/70 text-sm max-w-md mx-auto">
                                        Contattare direttamente un comando tramite rete radio (es. TETRA) e ottenere autorizzazione verbale per l'impiego di una squadra.
                                    </p>
                                </div>

                                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 w-full max-w-md mx-auto shadow-xl">
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Codice Autorizzazione Radio / Note</label>
                                    <input 
                                        type="text" 
                                        value={l2AuthCode}
                                        onChange={(e) => setL2AuthCode(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono mb-6"
                                        placeholder="es. AUTH-TETRA-77X"
                                    />

                                    <div className="flex flex-col space-y-3">
                                        <button onClick={handleLevel2Success} disabled={submitting} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold flex items-center justify-center transition-colors shadow-lg shadow-orange-900/20">
                                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> INIETTA FORZATURA NEL BPMN</>}
                                        </button>
                                        <button onClick={handleLevel2Fail} disabled={submitting} className="w-full py-3 bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 rounded-lg font-bold transition-colors">
                                            NESSUNA RISPOSTA RADIO (FALLIMENTO)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LEVEL 3 UI */}
                        {currentLevel === 3 && (
                            <div className="flex flex-col h-full justify-center relative animate-in zoom-in-95 duration-500">
                                {/* Red Alert Background Glow */}
                                <div className="absolute inset-0 bg-red-900/10 blur-3xl pointer-events-none rounded-full"></div>
                                
                                <div className="text-center mb-10 relative z-10">
                                    <div className="inline-block p-4 bg-red-500/20 rounded-full mb-4 animate-pulse border border-red-500/30">
                                        <ShieldAlert className="w-16 h-16 text-red-500" />
                                    </div>
                                    <h2 className="text-4xl font-black mb-2 text-red-500 tracking-wider">ESCALATION ESTREMA</h2>
                                    <p className="text-red-200/80 text-sm max-w-lg mx-auto leading-relaxed">
                                        Forze ordinarie collassate. Forza la transizione del processo BPMN su un ramo dedicato alle calamità estreme attivando gli endpoint di Prefettura o Comando Militare.
                                    </p>
                                </div>

                                <div className="bg-red-950/40 p-8 rounded-2xl border border-red-900/50 w-full max-w-md mx-auto relative z-10 backdrop-blur-sm shadow-2xl">
                                    <div className="flex items-center justify-center p-4 bg-red-900/30 border border-red-500/30 rounded-lg mb-8">
                                        <Shield className="w-6 h-6 text-red-400 mr-3" />
                                        <span className="text-red-200 font-mono text-sm tracking-widest">CAP_REQ: MILITARY_INTERVENTION</span>
                                    </div>

                                    <button onClick={handleLevel3Resolve} disabled={submitting} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center justify-center transition-all group">
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                            <>
                                                AUTORIZZA INTERVENTO MILITARE <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
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

export default EscalationResolutionModal;
