import React, { useEffect, useRef, useState } from 'react';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { Loader2 } from 'lucide-react';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

const ProcessBpmnViewer = ({ bpmnXml, activeNodes = [], completedNodes = [], incidents = [], sequenceFlows = [], calledProcessInstances = {}, onChildProcessClick, playTrigger = 0, onAnimationComplete, recenterTrigger = 0, darkMode = false }) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const loadedXmlRef = useRef(null);
    const [error, setError] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Initialize viewer once
    useEffect(() => {
        if (!containerRef.current) return;

        viewerRef.current = new BpmnViewer({
            container: containerRef.current,
            height: '100%',
            width: '100%'
        });

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, []);

    // Handle clicks on elements
    useEffect(() => {
        if (!viewerRef.current) return;

        const eventBus = viewerRef.current.get('eventBus');

        const handleElementClick = (e) => {
            const elementId = e.element.id;
            if (calledProcessInstances && calledProcessInstances[elementId] && onChildProcessClick) {
                onChildProcessClick(calledProcessInstances[elementId]);
            }
        };

        eventBus.on('element.click', handleElementClick);

        return () => {
            eventBus.off('element.click', handleElementClick);
        };
    }, [calledProcessInstances, onChildProcessClick]);

    // Load XML when it changes
    useEffect(() => {
        if (!viewerRef.current || !bpmnXml) return;

        // Skip if we already loaded this exact XML
        if (loadedXmlRef.current === bpmnXml) return;

        let isMounted = true;

        const renderBpmn = async () => {
            try {
                await viewerRef.current.importXML(bpmnXml);
                if (!isMounted) return;

                loadedXmlRef.current = bpmnXml;
                const canvas = viewerRef.current.get('canvas');
                
                // Centra e adatta
                canvas.zoom('fit-viewport', 'auto');
                
                // Limita lo zoom massimo per evitare che diagrammi piccoli diventino giganti
                // e riduci leggermente la scala (10% padding) per non fargli toccare i bordi
                const currentZoom = canvas.zoom();
                canvas.zoom(Math.min(currentZoom, 1.2) * 0.9, 'auto');

                if (!isAnimating) {
                    applyHighlights();
                }
                setError(null);
            } catch (err) {
                if (!isMounted) return;
                console.error('Error rendering BPMN', err);
                setError(err.message);
            }
        };

        renderBpmn();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bpmnXml]);

    // Hande Recenter trigger
    useEffect(() => {
        if (!viewerRef.current || !recenterTrigger) return;
        try {
            const canvas = viewerRef.current.get('canvas');
            canvas.zoom('fit-viewport', 'auto');
            const currentZoom = canvas.zoom();
            canvas.zoom(Math.min(currentZoom, 1.2) * 0.9, 'auto');
        } catch (e) {
            console.error("Error recentering BPMN", e);
        }
    }, [recenterTrigger]);

    const removeAllMarkers = () => {
        if (!viewerRef.current) return;
        try {
            const canvas = viewerRef.current.get('canvas');
            const elementRegistry = viewerRef.current.get('elementRegistry');

            elementRegistry.forEach(el => {
                try {
                    canvas.removeMarker(el.id, 'highlight-completed');
                    canvas.removeMarker(el.id, 'highlight-active');
                    canvas.removeMarker(el.id, 'highlight-incident');
                    canvas.removeMarker(el.id, 'highlight-flow');
                    canvas.removeMarker(el.id, 'highlight-call-activity');
                    canvas.removeMarker(el.id, 'highlight-completed-pulse');
                    canvas.removeMarker(el.id, 'highlight-active-pulse');
                    canvas.removeMarker(el.id, 'highlight-flow-animated');
                    canvas.removeMarker(el.id, 'highlight-incident-pulse');
                } catch (e) { }
            });
        } catch (e) {
            console.error(e);
        }
    };

    // Apply highlights whenever state updates without re-importing XML
    useEffect(() => {
        if (loadedXmlRef.current === bpmnXml && !isAnimating) {
            removeAllMarkers();
            applyHighlights();
        }
    }, [activeNodes, completedNodes, incidents, sequenceFlows, bpmnXml, calledProcessInstances, isAnimating]);

    // Handle Animation trigger
    useEffect(() => {
        if (!playTrigger || !viewerRef.current || !loadedXmlRef.current) return;

        let isCancelled = false;
        setIsAnimating(true);

        const animate = async () => {
            removeAllMarkers();
            const canvas = viewerRef.current.get('canvas');
            const elementRegistry = viewerRef.current.get('elementRegistry');

            const compNodes = new Set(completedNodes);
            const actNodes = new Set(activeNodes);
            const incNodes = new Set(incidents);
            const flows = new Set(sequenceFlows);

            // Find StartEvents that are completed or active
            const startEvents = elementRegistry.filter(e => e.type === 'bpmn:StartEvent' && (compNodes.has(e.id) || actNodes.has(e.id)));

            let currentStepElements = [...startEvents];

            // If no start events found, fallback to the first completed/active node we can find
            if (currentStepElements.length === 0 && completedNodes.length > 0) {
                const firstNode = elementRegistry.get(completedNodes[0]);
                if (firstNode) currentStepElements.push(firstNode);
            } else if (currentStepElements.length === 0 && activeNodes.length > 0) {
                const firstNode = elementRegistry.get(activeNodes[0]);
                if (firstNode) currentStepElements.push(firstNode);
            }

            const visitedNodes = new Set();
            const visitedFlows = new Set();

            while (currentStepElements.length > 0 && !isCancelled) {
                // Animate nodes
                for (const el of currentStepElements) {
                    if (!visitedNodes.has(el.id)) {
                        visitedNodes.add(el.id);
                        
                        let pulseClass = '';
                        let finalClass = '';

                        if (compNodes.has(el.id)) {
                            pulseClass = 'highlight-completed-pulse';
                            finalClass = 'highlight-completed';
                        } else if (actNodes.has(el.id)) {
                            pulseClass = 'highlight-active-pulse';
                            finalClass = 'highlight-active';
                        } else if (incNodes.has(el.id)) {
                            pulseClass = 'highlight-incident-pulse';
                            finalClass = 'highlight-incident';
                        }

                        if (pulseClass) {
                            canvas.addMarker(el.id, pulseClass);
                            setTimeout(() => {
                                if (isCancelled) return;
                                try {
                                    canvas.removeMarker(el.id, pulseClass);
                                    canvas.addMarker(el.id, finalClass);
                                } catch (e) {}
                            }, 500);
                        }

                        if (calledProcessInstances && calledProcessInstances[el.id]) {
                            canvas.addMarker(el.id, 'highlight-call-activity');
                        }
                    }
                }

                await new Promise(r => setTimeout(r, 1000));
                if (isCancelled) break;

                const nextFlows = [];
                for (const el of currentStepElements) {
                    if (el.outgoing) {
                        for (const flow of el.outgoing) {
                            if (flows.has(flow.id) && !visitedFlows.has(flow.id)) {
                                nextFlows.push(flow);
                                visitedFlows.add(flow.id);
                            }
                        }
                    }
                }

                if (nextFlows.length === 0) break;

                // Animate flows
                for (const flow of nextFlows) {
                    canvas.addMarker(flow.id, 'highlight-flow-animated');
                    try {
                        const gfx = elementRegistry.getGraphics(flow.id);
                        if (gfx) {
                            const path = gfx.querySelector('path');
                            if (path) {
                                const length = path.getTotalLength();
                                path.style.setProperty('--path-length', length);
                            }
                        }
                    } catch (e) { }
                }

                await new Promise(r => setTimeout(r, 1500));
                if (isCancelled) break;

                const nextNodes = [];
                for (const flow of nextFlows) {
                    const target = flow.target;
                    // Gather target nodes if they are in the recorded path
                    if (target && (compNodes.has(target.id) || actNodes.has(target.id)) && !visitedNodes.has(target.id)) {
                        nextNodes.push(target);
                    }
                }

                currentStepElements = nextNodes;
            }

            if (!isCancelled) {
                setIsAnimating(false);
                if (onAnimationComplete) {
                    onAnimationComplete();
                }
            }
        };

        animate();

        return () => {
            isCancelled = true;
            setIsAnimating(false);
        };
    }, [playTrigger, bpmnXml]);

    const applyHighlights = () => {
        if (!viewerRef.current) return;

        try {
            const canvas = viewerRef.current.get('canvas');
            const elementRegistry = viewerRef.current.get('elementRegistry');

            // Reset all markers (in case of updates, it might be tricky to find what was highlighted before)
            // But usually bpmn-js re-applies if we add/remove classes or just re-import XML.
            // Since we're trying to add markers to the canvas, let's remove existing markers first.
            // A safer way is just adding them (duplicate add doesn't duplicate the class).

            const addMarker = (elementId, className) => {
                try {
                    if (elementRegistry.get(elementId)) {
                        canvas.addMarker(elementId, className);
                    }
                } catch (e) {
                    // Ignore if element is not found
                }
            };

            completedNodes.forEach(id => addMarker(id, 'highlight-completed'));
            activeNodes.forEach(id => addMarker(id, 'highlight-active'));
            incidents.forEach(id => addMarker(id, 'highlight-incident'));
            sequenceFlows.forEach(id => addMarker(id, 'highlight-flow'));

            if (calledProcessInstances) {
                Object.keys(calledProcessInstances).forEach(id => addMarker(id, 'highlight-call-activity'));
            }

        } catch (e) {
            console.error("Could not apply highlights", e);
        }
    };

    if (!bpmnXml) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Loading Diagramma BPMN...
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-red-500 text-sm p-4">
                Unable to display the BPMN diagram: {error}
            </div>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                ${darkMode ? `
                .djs-container svg {
                    background-color: transparent !important;
                }
                .djs-visual > rect,
                .djs-visual > circle,
                .djs-visual > polygon {
                    stroke: #475569 !important;
                    fill: #1e293b !important;
                }
                .djs-visual > path {
                    stroke: #475569 !important;
                }
                .djs-connection .djs-visual > path {
                    marker-end: url(#sequenceflow-end-dark) !important;
                }
                .djs-label {
                    fill: #cbd5e1 !important;
                }
                ` : ''}

                .highlight-completed.djs-shape .djs-visual > :nth-child(1) {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                    stroke-width: 2.5px !important;
                    fill: ${darkMode ? '#0f2942' : '#b7d1e4ff'} !important;
                }
                .highlight-completed.djs-shape .djs-visual > path {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                    fill: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                }
                .highlight-completed.djs-shape .djs-visual > circle:not(:first-child),
                .highlight-completed.djs-shape .djs-visual > polygon:not(:first-child) {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                }

                .highlight-active.djs-shape .djs-visual > :nth-child(1) {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                    stroke-width: 3.75px !important;
                    fill: ${darkMode ? '#0f2942' : '#b7d1e4ff'} !important;
                }
                .highlight-active.djs-shape .djs-visual > path {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                    fill: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                }
                .highlight-active.djs-shape .djs-visual > circle:not(:first-child),
                .highlight-active.djs-shape .djs-visual > polygon:not(:first-child) {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                }

                .highlight-incident.djs-shape .djs-visual > :nth-child(1) {
                    stroke: ${darkMode ? '#f87171' : '#d32f2f'} !important;
                    stroke-width: 3.75px !important;
                    fill: ${darkMode ? '#451a1a' : '#f8d7dcff'} !important;
                }
                .highlight-incident.djs-shape .djs-visual > path {
                    stroke: ${darkMode ? '#f87171' : '#d32f2f'} !important;
                    fill: ${darkMode ? '#f87171' : '#d32f2f'} !important;
                }
                .highlight-incident.djs-shape .djs-visual > circle:not(:first-child),
                .highlight-incident.djs-shape .djs-visual > polygon:not(:first-child) {
                    stroke: ${darkMode ? '#f87171' : '#d32f2f'} !important;
                }

                .highlight-flow.djs-connection .djs-visual > path {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                    stroke-width: 2.5px !important;
                    marker-end: url(${darkMode ? '#sequenceflow-end-dark-flow' : '#sequenceflow-end-blue'}) !important;
                }
                .highlight-call-activity.djs-shape .djs-visual > :nth-child(1) {
                    stroke: ${darkMode ? '#34d399' : '#10b981'} !important;
                    stroke-width: 3.75px !important;
                    cursor: pointer !important;
                }
                .highlight-call-activity:hover .djs-visual > :nth-child(1) {
                    fill: ${darkMode ? '#064e3b' : '#d1fae5'} !important;
                }
                .bjs-powered-by, .bjs-breadcrumbs {
                    display: none !important;
                }

                /* ANIMATION CLASSES */
                .djs-visual > rect,
                .djs-visual > circle,
                .djs-visual > polygon,
                .djs-visual > path {
                    transition: fill 0.3s ease-out, stroke 0.3s ease-out, stroke-width 0.3s ease-out;
                }

                .highlight-completed-pulse.djs-shape .djs-visual > :nth-child(1) {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                    fill: ${darkMode ? '#0f2942' : '#b7d1e4ff'} !important;
                    stroke-width: 3.75px !important;
                }
                .highlight-completed-pulse.djs-shape .djs-visual > path {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                    fill: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                }
                .highlight-completed-pulse.djs-shape .djs-visual > circle:not(:first-child),
                .highlight-completed-pulse.djs-shape .djs-visual > polygon:not(:first-child) {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                }

                .highlight-active-pulse.djs-shape .djs-visual > :nth-child(1) {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                    fill: ${darkMode ? '#0f2942' : '#b7d1e4ff'} !important;
                    stroke-width: 5px !important;
                }
                .highlight-active-pulse.djs-shape .djs-visual > path {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                    fill: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                }
                .highlight-active-pulse.djs-shape .djs-visual > circle:not(:first-child),
                .highlight-active-pulse.djs-shape .djs-visual > polygon:not(:first-child) {
                    stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                }

                .highlight-incident-pulse.djs-shape .djs-visual > :nth-child(1) {
                    stroke: ${darkMode ? '#f87171' : '#d32f2f'} !important;
                    fill: ${darkMode ? '#451a1a' : '#f8d7dcff'} !important;
                    stroke-width: 3.75px !important;
                }
                .highlight-incident-pulse.djs-shape .djs-visual > path {
                    stroke: ${darkMode ? '#f87171' : '#d32f2f'} !important;
                    fill: ${darkMode ? '#f87171' : '#d32f2f'} !important;
                }
                .highlight-incident-pulse.djs-shape .djs-visual > circle:not(:first-child),
                .highlight-incident-pulse.djs-shape .djs-visual > polygon:not(:first-child) {
                    stroke: ${darkMode ? '#f87171' : '#d32f2f'} !important;
                }

                @keyframes drawFlow {
                  0% { stroke-dasharray: var(--path-length, 1000); stroke-dashoffset: var(--path-length, 1000); stroke: ${darkMode ? '#475569' : '#ccc'}; }
                  100% { stroke-dasharray: var(--path-length, 1000); stroke-dashoffset: 0; stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'}; }
                }
                .highlight-flow-animated.djs-connection .djs-visual > path {
                  stroke: ${darkMode ? '#6ea8fe' : '#0d1b78ff'} !important;
                  stroke-width: 2.5px !important;
                  marker-end: url(${darkMode ? '#sequenceflow-end-dark-flow' : '#sequenceflow-end-blue'}) !important;
                  animation: drawFlow 2.5s linear forwards !important;
                }
            `}} />
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <marker id="sequenceflow-end-blue" viewBox="0 0 20 20" refX="11" refY="10" markerWidth="10" markerHeight="20" orient="auto">
                        <path d="M 1 5 L 11 10 L 1 15 Z" fill="#0d1b78ff" stroke="#0d1b78ff" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
                    </marker>
                    <marker id="sequenceflow-end-dark" viewBox="0 0 20 20" refX="11" refY="10" markerWidth="10" markerHeight="20" orient="auto">
                        <path d="M 1 5 L 11 10 L 1 15 Z" fill="#475569" stroke="#475569" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
                    </marker>
                    <marker id="sequenceflow-end-dark-flow" viewBox="0 0 20 20" refX="11" refY="10" markerWidth="10" markerHeight="20" orient="auto">
                        <path d="M 1 5 L 11 10 L 1 15 Z" fill="#6ea8fe" stroke="#6ea8fe" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
                    </marker>
                </defs>
            </svg>
            <div ref={containerRef} className={`absolute inset-0 w-full h-full border ${darkMode ? 'border-gray-800 bg-[#0B1221]' : 'border-gray-200 bg-white'} rounded overflow-hidden`} />
        </>
    );
};

export default ProcessBpmnViewer;
