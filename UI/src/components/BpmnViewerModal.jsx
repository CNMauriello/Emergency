import { useEffect, useRef } from 'react';
import BpmnNavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export default function BpmnViewerModal({ xml, processKey, onClose }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!xml || !containerRef.current) return;

    const viewer = new BpmnNavigatedViewer({
      container: containerRef.current
    });
    
    viewerRef.current = viewer;

    viewer.importXML(xml).then(({ warnings }) => {
      if (warnings.length) {
        console.warn('BPMN Import Warnings', warnings);
      }
      
      const canvas = viewer.get('canvas');
      canvas.zoom('fit-viewport');
    }).catch(err => {
      console.error('BPMN Import Error', err);
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [xml]);

  const handleZoom = (step) => {
    if (!viewerRef.current) return;
    const canvas = viewerRef.current.get('canvas');
    canvas.zoom(canvas.zoom() + step);
  };

  const handleZoomFit = () => {
    if (!viewerRef.current) return;
    viewerRef.current.get('canvas').zoom('fit-viewport');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0B1B32] p-5 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <i className="fas fa-project-diagram text-[#6ea8fe]"></i> Diagramma BPMN
            </h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{processKey}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewer */}
        <div className="flex-1 bg-gray-50 relative overflow-hidden" ref={containerRef}>
            {/* bpmn-js will mount here */}
            
            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10">
              <button 
                onClick={() => handleZoom(0.2)}
                className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="h-px bg-gray-200 mx-1"></div>
              <button 
                onClick={() => handleZoomFit()}
                className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Adatta allo schermo"
              >
                <Maximize className="w-5 h-5" />
              </button>
              <div className="h-px bg-gray-200 mx-1"></div>
              <button 
                onClick={() => handleZoom(-0.2)}
                className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
