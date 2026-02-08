
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface WorkflowVisualizerProps {
  processingStage?: string | null;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ processingStage }) => {
  const [currentStage, setCurrentStage] = useState<string | null>(processingStage || null);

  useEffect(() => {
    console.log('WorkflowVisualizer: processingStage changed to:', processingStage);
    setCurrentStage(processingStage || null);
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
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          McP Workflow Visualization
          {processingStage && (
            <span className="text-sm text-blue-400 capitalize">
              {processingStage} active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[300px] flex items-center justify-center">
          <svg width="100%" height="300" viewBox="0 0 600 300" className="overflow-visible">
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
      </CardContent>
    </Card>
  );
};

export default WorkflowVisualizer;
