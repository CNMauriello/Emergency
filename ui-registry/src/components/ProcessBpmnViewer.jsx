import React, { useEffect, useRef, useState } from 'react';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { Loader2 } from 'lucide-react';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

const ProcessBpmnViewer = ({ bpmnXml, activeNodes = [], completedNodes = [], incidents = [], sequenceFlows = [] }) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const loadedXmlRef = useRef(null);
    const [error, setError] = useState(null);

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
                canvas.zoom('fit-viewport', 'auto');

                applyHighlights();
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

    // Apply highlights whenever state updates without re-importing XML
    useEffect(() => {
        if (loadedXmlRef.current === bpmnXml) {
            applyHighlights();
        }
    }, [activeNodes, completedNodes, incidents, sequenceFlows, bpmnXml]);

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

        } catch (e) {
            console.error("Could not apply highlights", e);
        }
    };

    if (!bpmnXml) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Caricamento Diagramma BPMN...
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-red-500 text-sm p-4">
                Impossibile visualizzare il diagramma BPMN: {error}
            </div>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .highlight-completed .djs-visual > :nth-child(1) {
                    stroke: #1932d2ff !important;
                    stroke-width: 2px !important;
                    fill: #b7d1e4ff !important;
                }
                .highlight-active .djs-visual > :nth-child(1) {
                    stroke: #1932d2ff !important;
                    stroke-width: 3px !important;
                    fill: #b7d1e4ff !important;
                }
                .highlight-incident .djs-visual > :nth-child(1) {
                    stroke: #d32f2f !important;
                    stroke-width: 3px !important;
                    fill: #f8d7dcff !important;
                }
                .highlight-flow .djs-visual > path {
                    stroke: #1932d2ff !important;
                    stroke-width: 2px !important;
                    marker-end: url(#sequenceflow-end-blue) !important;
                }
                .bjs-powered-by, .bjs-breadcrumbs {
                    display: none !important;
                }
            `}} />
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <marker id="sequenceflow-end-blue" viewBox="0 0 20 20" refX="11" refY="10" markerWidth="10" markerHeight="10" orient="auto">
                        <path d="M 1 5 L 11 10 L 1 15 Z" fill="#1932d2ff" stroke="#1932d2ff" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
                    </marker>
                </defs>
            </svg>
            <div ref={containerRef} className="absolute inset-0 w-full h-full border border-gray-200 rounded overflow-hidden bg-white" />
        </>
    );
};

export default ProcessBpmnViewer;
