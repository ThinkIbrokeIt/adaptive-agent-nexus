
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WorkflowVisualizer = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle>McP Workflow Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[300px] flex items-center justify-center">
          <svg width="100%" height="300" viewBox="0 0 600 300" className="overflow-visible">
            {/* Workflow paths */}
            <path 
              d="M100,150 C150,150 150,100 200,100 L380,100" 
              stroke="#3b82f6" 
              strokeWidth="2" 
              fill="none"
            />
            <path 
              d="M100,150 C150,150 150,150 200,150 L380,150" 
              stroke="#8b5cf6" 
              strokeWidth="2" 
              fill="none"
            />
            <path 
              d="M100,150 C150,150 150,200 200,200 L380,200" 
              stroke="#ec4899" 
              strokeWidth="2" 
              fill="none"
            />
            
            {/* Input node */}
            <circle cx="100" cy="150" r="30" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <text x="100" y="155" textAnchor="middle" fill="white" fontSize="12">Input</text>
            
            {/* Monitor node */}
            <circle cx="400" cy="100" r="20" fill="#1e40af" stroke="#3b82f6" strokeWidth="2" />
            <text x="400" y="105" textAnchor="middle" fill="white" fontSize="10">Monitor</text>
            
            {/* Contextualize node */}
            <circle cx="400" cy="150" r="20" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="2" />
            <text x="400" y="155" textAnchor="middle" fill="white" fontSize="9">Context</text>
            
            {/* Personalize node */}
            <circle cx="400" cy="200" r="20" fill="#9d174d" stroke="#ec4899" strokeWidth="2" />
            <text x="400" y="205" textAnchor="middle" fill="white" fontSize="9">Personalize</text>
            
            {/* Database node */}
            <rect x="470" y="130" width="40" height="40" rx="5" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
            <text x="490" y="155" textAnchor="middle" fill="white" fontSize="10">DB</text>
            
            {/* Connection lines to DB */}
            <path d="M420,100 L470,150" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2" fill="none" />
            <path d="M420,150 L470,150" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2" fill="none" />
            <path d="M420,200 L470,150" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2" fill="none" />
          </svg>
          
          {/* Animated circles to represent data flowing */}
          <div className="absolute top-[98px] left-[100px] h-4 w-4 rounded-full bg-blue-500 animate-ping opacity-75"></div>
          <div className="absolute top-[148px] left-[180px] h-3 w-3 rounded-full bg-purple-500 animate-ping opacity-75 animation-delay-500"></div>
          <div className="absolute top-[198px] left-[250px] h-3 w-3 rounded-full bg-pink-500 animate-ping opacity-75 animation-delay-1000"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowVisualizer;
