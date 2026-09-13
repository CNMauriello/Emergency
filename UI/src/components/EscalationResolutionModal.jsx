import React, { useState, useEffect } from 'react';
import { X, Radio, ShieldAlert, Wifi, AlertTriangle, CheckCircle2, Shield, Loader2, Server, Power, Activity, ChevronRight, Terminal } from 'lucide-react';
import { API_BASE_URL, fetchWithAuth, getAuthUser } from '../config.js';

const EscalationResolutionModal = ({ ticket, isOpen, onClose, onSuccess }) => {
    const [currentLevel, setCurrentLevel] = useState(1);
    const [levelStatus, setLevelStatus] = useState('idle'); // idle, running, failed, success
    const [logs, setLogs] = useState([]);

    // States for specific levels
    const [l1Nodes, setL1Nodes] = useState([]);
    const [l2Nodes, setL2Nodes] = useState([]);
    const [l2AuthCode, setL2AuthCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const severityUpper = (ticket?.severity || '').toUpperCase();
    const isLowMed = severityUpper === 'LOW' || severityUpper === 'MEDIUM';

    useEffect(() => {
        if (isOpen) {
            setCurrentLevel(1);
            setLevelStatus('idle');
            const tid = ticket?.taskId || ticket?.ticketId || ticket?.id || 'Unknown';
            setLogs([`Started resolution procedure for ticket ${tid}`]);

            const eps = ticket?.failedEndpoints || [];
            if (eps.length > 0) {
                setL1Nodes(eps.map((ep, i) => ({ id: i, url: ep, status: 'pending' })));
                setL2Nodes(eps.map((ep, i) => ({ id: i, url: ep, status: 'idle' })));
            } else {
                setL1Nodes(Array.from({ length: 6 }).map((_, i) => ({ id: i, url: `http://node-${i}.local`, status: 'pending' })));
                setL2Nodes(Array.from({ length: 6 }).map((_, i) => ({ id: i, url: `http://node-${i}.local`, status: 'idle' })));
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
                justification: justification
            };

            const tid = ticket?.taskId || ticket?.ticketId || ticket?.id;
            const response = await fetchWithAuth(`${API_BASE_URL}/api/operators/escalations/${tid}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Error closing the ticket');

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Server communication error: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const startLevel1 = () => {
        if (levelStatus === 'running') return;
        setLevelStatus('running');
        addLog("Starting parallel Broadcast Alert to telematic nodes...");

        Promise.all(l1Nodes.map(async (node, i) => {
            try {
                // Add a slight random delay to display the broadcast animation
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
                    addLog(`Node ${node.url} - POSITIVE response received`);
                    return true;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (err) {
                setL1Nodes(prev => {
                    const next = [...prev];
                    next[i] = { ...next[i], status: 'failed', errorCode: err.message.replace('HTTP ', '') };
                    return next;
                });
                addLog(`Node ${node.url} - Failed: ${err.message}`);
                return false;
            }
        })).then(results => {
            const anySuccess = results.some(r => r);
            if (anySuccess) {
                setLevelStatus('success');
                addLog("Broadcast completed successfully: at least one node accepted the parallel engagement!");
                // Resolve the escalation automatically since the broadcast was successful
                resolveEscalation("LEVEL_1_BROADCAST", "Automatically resolved via Parallel Broadcast on telematic network.");
            } else {
                setLevelStatus('failed');
                addLog("Broadcast failed: no availability found on the ordinary network.");
            }
        });
    };

    const proceedToLevel2 = () => {
        setCurrentLevel(2);
        setLevelStatus('idle');
        addLog(`Moving to Level 2: ${isLowMed ? "Manual Ping" : "Out-of-band engagement activated."}`);
    };

    const pingManualNode = async (index) => {
        const node = l2Nodes[index];
        setL2Nodes(prev => {
            const next = [...prev];
            next[index] = { ...next[index], status: 'pinging' };
            return next;
        });
        addLog(`Starting manual ping to ${node.url}...`);

        try {
            const delay = Math.random() * 1000 + 500;
            await new Promise(r => setTimeout(r, delay));

            const response = await fetchWithAuth(node.url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                setL2Nodes(prev => {
                    const next = [...prev];
                    next[index] = { ...next[index], status: 'success' };
                    return next;
                });
                addLog(`Node ${node.url} - POSITIVE response received (Manual)`);
                resolveEscalation("LEVEL_2_MANUAL_PING", `Resolved via Manual Ping on node ${node.url}`);
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (err) {
            setL2Nodes(prev => {
                const next = [...prev];
                next[index] = { ...next[index], status: 'failed', errorCode: err.message.replace('HTTP ', '') };
                return next;
            });
            addLog(`Node ${node.url} - Manual Ping Failed: ${err.message}`);
        }
    };

    const handleLevel2Success = async () => {
        if (!l2AuthCode) {
            alert("Enter an authorization code or reason.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = { authorizationCode: l2AuthCode };
            if (isLowMed) {
                payload.severity = ticket.severity;
            }

            const response = await fetchWithAuth(`${API_BASE_URL}/api/dispatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                addLog(`Voice authorization received. Code: ${l2AuthCode}`);
                await resolveEscalation(isLowMed ? "LEVEL_3_OUT_OF_BAND" : "LEVEL_2_OUT_OF_BAND", `Resolved via TETRA radio contact. Code: ${l2AuthCode}`);
            } else if (response.status === 404) {
                addLog("Resources currently unavailable.");
                if (isLowMed) {
                    addLog("Radio contact failed.");
                    alert("No entity available for radio contact.");
                } else {
                    handleLevel2Fail();
                }
            } else if (response.status === 401) {
                addLog("Invalid authorization code.");
                alert("Invalid code.");
                setL2AuthCode("");
            } else {
                addLog(`Unexpected error: ${response.status}`);
            }
        } catch (err) {
            console.error(err);
            addLog(`Communication error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLevel2Fail = () => {
        addLog("Radio contact failed. No physical entity available.");
        setCurrentLevel(3);
        setLevelStatus('idle');
        addLog("Moving to Level 3: Extreme Escalation.");
    };

    const handleLevel3Resolve = async () => {
        setSubmitting(true);
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/military-intervention`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                addLog("Military Authorization confirmed.");
                resolveEscalation("LEVEL_3_EXTREME_MILITARY", "Resolved via Armed Forces / Prefecture intervention, bypassing discovery.");
            } else {
                addLog(`Error during military authorization: ${response.status}`);
            }
        } catch (err) {
            addLog(`Communication error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity">
            <div className="bg-[#0B1B32] text-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col h-[85vh]">

                {/* HEADER */}
                <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-wide">Escalation Resolution</h2>
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
                                        <h3 className="font-bold text-sm">Level 1</h3>
                                        <p className="text-xs text-gray-400">Broadcast Alert</p>
                                    </div>
                                </div>
                                {currentLevel === 1 && levelStatus === 'failed' && <X className="absolute right-4 top-5 text-red-500 w-5 h-5" />}
                            </div>

                            {/* LEVEL 2 INDICATOR */}
                            <div className={`relative p-4 rounded-xl border transition-colors ${currentLevel === 2 ? 'border-orange-500 bg-orange-900/20' : 'border-gray-800 opacity-50'}`}>
                                <div className="flex items-center space-x-3">
                                    {isLowMed ? (
                                        <Wifi className={`w-6 h-6 ${currentLevel === 2 ? 'text-orange-400' : 'text-gray-500'}`} />
                                    ) : (
                                        <Radio className={`w-6 h-6 ${currentLevel === 2 ? 'text-orange-400' : 'text-gray-500'}`} />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-sm">Level 2</h3>
                                        <p className="text-xs text-gray-400">{isLowMed ? 'Manual Ping' : 'Out-of-band (TETRA)'}</p>
                                    </div>
                                </div>
                                {currentLevel === 2 && levelStatus === 'failed' && <X className="absolute right-4 top-5 text-red-500 w-5 h-5" />}
                            </div>

                            {/* LEVEL 3 INDICATOR */}
                            <div className={`relative p-4 rounded-xl border transition-all ${currentLevel === 3 ? 'border-red-500 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-105' : 'border-gray-800 opacity-50'}`}>
                                <div className="flex items-center space-x-3">
                                    {isLowMed ? (
                                        <Radio className={`w-6 h-6 ${currentLevel === 3 ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} />
                                    ) : (
                                        <ShieldAlert className={`w-6 h-6 ${currentLevel === 3 ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-sm">Level 3</h3>
                                        <p className="text-xs text-gray-400">{isLowMed ? 'Radio Contact' : 'Extreme Escalation'}</p>
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
                    <div className="w-2/3 p-6 flex flex-col relative overflow-hidden">

                        {/* LEVEL 1 UI */}
                        {currentLevel === 1 && (
                            <div className="flex flex-col h-full justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-light mb-2">Telematic Broadcast</h2>
                                    <p className="text-gray-400 text-sm">Parallel call to all registered territorial services.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6 px-4">
                                    {l1Nodes.map((node) => {
                                        let shortName = node.url || `NODE_${node.id}`;
                                        try {
                                            const urlObj = new URL(node.url.startsWith('http') ? node.url : `http://${node.url}`);
                                            shortName = urlObj.pathname + urlObj.search;
                                            if (shortName === '/') shortName = urlObj.hostname;
                                        } catch (e) {
                                            // Fallback to original url
                                        }

                                        return (
                                            <div key={node.id} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-500 ${node.status === 'pending' ? 'border-gray-700 bg-gray-800/50' : (node.status === 'success' ? 'border-green-500/50 bg-green-900/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-red-500/50 bg-red-900/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]')}`}>
                                                <Server className={`w-8 h-8 mb-2 transition-colors ${node.status === 'pending' ? 'text-gray-500' : (node.status === 'success' ? 'text-green-400' : 'text-red-400')}`} />
                                                <div className="text-xs font-mono text-gray-400 truncate max-w-full px-2" title={node.url}>{shortName}</div>
                                                <div className={`text-[10px] mt-2 px-2 py-1 rounded transition-colors ${node.status === 'pending' ? 'bg-gray-800 text-gray-500' : (node.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}`}>
                                                    {node.status === 'pending' ? (levelStatus === 'running' ? 'PINGING...' : 'IDLE') : (node.status === 'success' ? 'ACCEPTED' : `FAILED/${node.errorCode || 'ERR'}`)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-center mt-4">
                                    {levelStatus === 'idle' && (
                                        <button onClick={startLevel1} className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold tracking-wide transition-all overflow-hidden flex items-center">
                                            <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
                                            <Power className="w-5 h-5 mr-2" /> EXECUTE BROADCAST PING
                                        </button>
                                    )}
                                    {levelStatus === 'running' && (
                                        <div className="flex items-center text-blue-400 font-mono tracking-widest animate-pulse">
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            NETWORK SCAN IN PROGRESS...
                                        </div>
                                    )}
                                    {levelStatus === 'failed' && (
                                        <button onClick={proceedToLevel2} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded-full font-bold transition-all flex items-center shadow-lg">
                                            NETWORK UNAVAILABLE - PROCEED TO LEVEL 2 <ChevronRight className="w-5 h-5 ml-2" />
                                        </button>
                                    )}
                                    {levelStatus === 'success' && (
                                        <div className="flex items-center px-8 py-3 bg-green-900/50 border border-green-500/50 text-green-400 rounded-full font-bold">
                                            <CheckCircle2 className="w-5 h-5 mr-2" /> INTERVENTION ASSIGNED
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* LEVEL 2 UI */}
                        {currentLevel === 2 && (
                            isLowMed ? (
                                <div className="flex flex-col h-full py-4 animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
                                    <div className="text-center mb-4 flex-shrink-0">
                                        <h2 className="text-3xl font-light mb-2">Manual Ping Services</h2>
                                        <p className="text-gray-400 text-sm">Select a specific service to engage manually. You can try multiple times.</p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-4 mb-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {l2Nodes.map((node, index) => {
                                                let shortName = node.url || `NODE_${node.id}`;
                                                try {
                                                    const urlObj = new URL(node.url.startsWith('http') ? node.url : `http://${node.url}`);
                                                    shortName = urlObj.pathname + urlObj.search;
                                                    if (shortName === '/') shortName = urlObj.hostname;
                                                } catch (e) {
                                                    // Fallback to original url
                                                }

                                                return (
                                                    <div key={node.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${node.status === 'pinging' ? 'border-blue-500 bg-blue-900/20' : node.status === 'success' ? 'border-green-500/50 bg-green-900/20' : node.status === 'failed' ? 'border-red-500/50 bg-red-900/20' : 'border-gray-700 bg-gray-800/50'}`}>
                                                        <div className="flex items-center space-x-3 overflow-hidden">
                                                            <Server className={`w-5 h-5 flex-shrink-0 ${node.status === 'pinging' ? 'text-blue-400' : node.status === 'success' ? 'text-green-400' : node.status === 'failed' ? 'text-red-400' : 'text-gray-500'}`} />
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="text-sm font-mono text-gray-300 truncate" title={node.url}>{shortName}</span>
                                                                {node.status === 'failed' && <span className="text-[10px] text-red-400 truncate">{node.errorCode}</span>}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => pingManualNode(index)}
                                                            disabled={node.status === 'pinging' || node.status === 'success'}
                                                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${node.status === 'pinging' ? 'bg-blue-600 text-white cursor-wait' : node.status === 'success' ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                                                        >
                                                            {node.status === 'pinging' ? 'PING...' : node.status === 'success' ? 'OK' : 'PING'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-center flex-shrink-0">
                                        <button onClick={() => {
                                            setCurrentLevel(3);
                                            setLevelStatus('idle');
                                            addLog("Moving to Level 3: Radio Contact.");
                                        }} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded-full font-bold transition-all flex items-center shadow-lg">
                                            PROCEED TO LEVEL 3 (RADIO CONTACT) <ChevronRight className="w-5 h-5 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="text-center mb-6">
                                        <div className="inline-block p-4 bg-orange-500/10 rounded-full mb-3">
                                            <Radio className="w-10 h-10 text-orange-500" />
                                        </div>
                                        <h2 className="text-3xl font-light mb-2 text-orange-50">Out-of-band Engagement</h2>
                                        <p className="text-orange-200/70 text-sm max-w-md mx-auto">
                                            Directly contact a command via radio network (e.g. TETRA) and obtain verbal authorization for the deployment of a team.
                                        </p>
                                    </div>

                                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 w-full max-w-md mx-auto shadow-xl">
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Radio Authorization Code / Notes</label>
                                        <input
                                            type="text"
                                            value={l2AuthCode}
                                            onChange={(e) => setL2AuthCode(e.target.value)}
                                            className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono mb-5"
                                            placeholder="e.g. AUTH-TETRA-77X"
                                        />

                                        <div className="flex flex-col space-y-3">
                                            <button onClick={handleLevel2Success} disabled={submitting} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold flex items-center justify-center transition-colors shadow-lg shadow-orange-900/20">
                                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> INJECT OVERRIDE IN BPMN</>}
                                            </button>
                                            <button onClick={handleLevel2Fail} disabled={submitting} className="w-full py-3 bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 rounded-lg font-bold transition-colors">
                                                NO RADIO RESPONSE (FAILURE)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {/* LEVEL 3 UI */}
                        {currentLevel === 3 && (
                            isLowMed ? (
                                <div className="flex flex-col h-full justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="text-center mb-6">
                                        <div className="inline-block p-4 bg-orange-500/10 rounded-full mb-3">
                                            <Radio className="w-10 h-10 text-orange-500" />
                                        </div>
                                        <h2 className="text-3xl font-light mb-2 text-orange-50">Radio Contact</h2>
                                        <p className="text-orange-200/70 text-sm max-w-md mx-auto">
                                            Contact a command directly via radio network and obtain verbal authorization.
                                        </p>
                                    </div>

                                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 w-full max-w-md mx-auto shadow-xl">
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Radio Authorization Code / Notes</label>
                                        <input
                                            type="text"
                                            value={l2AuthCode}
                                            onChange={(e) => setL2AuthCode(e.target.value)}
                                            className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono mb-5"
                                            placeholder="e.g. AUTH-TETRA-77X"
                                        />

                                        <div className="flex flex-col space-y-3">
                                            <button onClick={handleLevel2Success} disabled={submitting} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold flex items-center justify-center transition-colors shadow-lg shadow-orange-900/20">
                                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> INJECT OVERRIDE IN BPMN</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full justify-center relative animate-in zoom-in-95 duration-500">
                                    {/* Red Alert Background Glow */}
                                    <div className="absolute inset-0 bg-red-900/10 blur-3xl pointer-events-none rounded-full"></div>

                                    <div className="text-center mb-6 relative z-10">
                                        <div className="inline-block p-4 bg-red-500/20 rounded-full mb-3 animate-pulse border border-red-500/30">
                                            <ShieldAlert className="w-12 h-12 text-red-500" />
                                        </div>
                                        <h2 className="text-4xl font-black mb-2 text-red-500 tracking-wider">EXTREME ESCALATION</h2>
                                        <p className="text-red-200/80 text-sm max-w-lg mx-auto leading-relaxed">
                                            Ordinary forces collapsed. Force the BPMN process transition to a branch dedicated to extreme calamities by activating the Prefecture or Military Command endpoints.
                                        </p>
                                    </div>

                                    <div className="bg-red-950/40 p-6 rounded-2xl border border-red-900/50 w-full max-w-md mx-auto relative z-10 backdrop-blur-sm shadow-2xl">
                                        <div className="flex items-center justify-center p-3 bg-red-900/30 border border-red-500/30 rounded-lg mb-6">
                                            <Shield className="w-5 h-5 text-red-400 mr-3" />
                                            <span className="text-red-200 font-mono text-sm tracking-widest">CAP_REQ: MILITARY_INTERVENTION</span>
                                        </div>

                                        <button onClick={handleLevel3Resolve} disabled={submitting} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center justify-center transition-all group">
                                            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                                <>
                                                    AUTHORIZE MILITARY INTERVENTION <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EscalationResolutionModal;
