
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface WorkflowVisualizerProps {
  processingStage?: string | null;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ processingStage }) => {
  const [renderKey, setRenderKey] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    console.log('WorkflowVisualizer: processingStage changed to:', processingStage, 'at', new Date().toISOString());
    setRenderKey(prev => prev + 1);
    setRenderCount(prev => prev + 1);
  }, [processingStage]);

  const getNodeStyle = (stage: string) => {
    const isActive = processingStage === stage;
    const isCompleted = processingStage && ['monitor', 'contextualize', 'personalize', 'feedback'].indexOf(processingStage) > ['monitor', 'contextualize', 'personalize', 'feedback'].indexOf(stage);
    
    if (isActive) {
      return {
        fill: "#3b82f6",
        stroke: "#60a5fa",
        strokeWidth: "3"
      };
    } else if (isCompleted) {
      return {
        fill: "#10b981",
        stroke: "#34d399",
        strokeWidth: "2"
      };
    } else {
      return {
        fill: "#1e293b",
        stroke: "#475569",
        strokeWidth: "2"
      };
    }
  };

  const getPathStyle = (stage: string) => {
    const isActive = processingStage === stage;
    const isCompleted = processingStage && ['monitor', 'contextualize', 'personalize', 'feedback'].indexOf(processingStage) > ['monitor', 'contextualize', 'personalize', 'feedback'].indexOf(stage);
    
    if (isActive) {
      return {
        stroke: "#3b82f6",
        strokeWidth: "4"
      };
    } else if (isCompleted) {
      return {
        stroke: "#10b981",
        strokeWidth: "3"
      };
    } else {
      return {
        stroke: "#475569",
        strokeWidth: "2"
      };
    }
  };

  return (
    <Card key={renderKey} className={`bg-slate-800/50 border-slate-700 transition-colors duration-300 ${processingStage ? 'bg-blue-900/20 border-blue-600' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          McP Workflow Visualization
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-400 capitalize">
              {processingStage || 'Idle'}
            </span>
            <span className="text-xs text-slate-500">
              (renders: {renderCount})
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processingStage ? (
          // Show a completely different visualization when processing
          <div className="relative min-h-[300px] flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-4">⚡ ACTIVE WORKFLOW ⚡</div>
              <div className="text-xl">Phase: {processingStage.toUpperCase()}</div>
              <div className="text-lg mt-4">Processing in progress...</div>
              <div className="mt-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            </div>
          </div>
        ) : (
          // Show the normal SVG visualization when idle
          <div className="relative min-h-[300px] flex items-center justify-center">
            <svg 
              width="100%" 
              height="300" 
              viewBox="0 0 600 300" 
              className="overflow-visible"
            >
            {/* Workflow paths */}
            <path 
              d="M100,150 C150,150 150,100 200,100 L380,100" 
              stroke={getPathStyle('monitor').stroke}
              strokeWidth={getPathStyle('monitor').strokeWidth}
              fill="none"
            />
            <path 
              d="M100,150 C150,150 150,150 200,150 L380,150" 
              stroke={getPathStyle('contextualize').stroke}
              strokeWidth={getPathStyle('contextualize').strokeWidth}
              fill="none"
            />
            <path 
              d="M100,150 C150,150 150,200 200,200 L380,200" 
              stroke={getPathStyle('personalize').stroke}
              strokeWidth={getPathStyle('personalize').strokeWidth}
              fill="none"
            />
            <circle cx="100" cy="150" r="30" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <text x="100" y="155" textAnchor="middle" fill="white" fontSize="12">Input</text>
            
            {/* Monitor node */}
            <circle 
              cx="400" 
              cy="100" 
              r="20" 
              fill={getNodeStyle('monitor').fill}
              stroke={getNodeStyle('monitor').stroke}
              strokeWidth={getNodeStyle('monitor').strokeWidth}
            />
            <text x="400" y="105" textAnchor="middle" fill="white" fontSize="10">Monitor</text>
            
            {/* Contextualize node */}
            <circle 
              cx="400" 
              cy="150" 
              r="20" 
              fill={getNodeStyle('contextualize').fill}
              stroke={getNodeStyle('contextualize').stroke}
              strokeWidth={getNodeStyle('contextualize').strokeWidth}
            />
            <text x="400" y="155" textAnchor="middle" fill="white" fontSize="9">Context</text>
            
            {/* Personalize node */}
            <circle 
              cx="400" 
              cy="200" 
              r="20" 
              fill={getNodeStyle('personalize').fill}
              stroke={getNodeStyle('personalize').stroke}
              strokeWidth={getNodeStyle('personalize').strokeWidth}
            />
            <text x="400" y="205" textAnchor="middle" fill="white" fontSize="9">Personalize</text>
            
            {/* Database node */}
            <rect x="470" y="130" width="40" height="40" rx="5" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
            <text x="490" y="155" textAnchor="middle" fill="white" fontSize="10">DB</text>
            
            {/* Connection lines to DB */}
            <path d="M420,100 L470,150" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2" fill="none" />
            <path d="M420,150 L470,150" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2" fill="none" />
            <path d="M420,200 L470,150" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2" fill="none" />
            <path d="M420,200 L470,150" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2" fill="none" />
          </svg>
          
          {/* Animated data flow indicators */}
          {processingStage === 'monitor' && (
            <div className="absolute top-[98px] left-[100px] h-4 w-4 rounded-full bg-blue-500 animate-bounce"></div>
          )}
          {processingStage === 'contextualize' && (
            <div className="absolute top-[148px] left-[180px] h-3 w-3 rounded-full bg-purple-500 animate-bounce"></div>
          )}
          {processingStage === 'personalize' && (
            <div className="absolute top-[198px] left-[250px] h-3 w-3 rounded-full bg-pink-500 animate-bounce"></div>
          )}
          {processingStage === 'feedback' && (
            <div className="absolute top-[148px] left-[420px] h-3 w-3 rounded-full bg-green-500 animate-bounce"></div>
          )}
          
          {/* Status indicators */}
          <div className="absolute bottom-2 left-2 text-xs text-slate-400">
            Status: {processingStage ? `${processingStage} processing...` : 'Idle'}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowVisualizer;
