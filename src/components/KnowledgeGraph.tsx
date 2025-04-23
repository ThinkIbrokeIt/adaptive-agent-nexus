
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const KnowledgeGraph = () => {
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Knowledge Relationships</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              Nodes: 32
            </Badge>
            <Badge variant="outline">
              Edges: 47
            </Badge>
            <div className="flex items-center gap-1 text-xs">
              <button 
                className="h-6 w-6 rounded bg-slate-700 flex items-center justify-center"
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              >
                -
              </button>
              <span>{Math.round(zoomLevel * 100)}%</span>
              <button 
                className="h-6 w-6 rounded bg-slate-700 flex items-center justify-center"
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
              >
                +
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="bg-slate-900/60 rounded-lg overflow-hidden h-[500px] relative" 
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {/* This is a simplified visualization of a knowledge graph */}
            <svg width="100%" height="100%" viewBox="0 0 800 500">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                </marker>
              </defs>
              
              {/* Core nodes and connections */}
              <g>
                {/* Central node: electronic_music */}
                <circle cx="400" cy="250" r="25" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
                <text x="400" y="250" textAnchor="middle" fill="white" fontSize="10">electronic_music</text>
                
                {/* Connected nodes */}
                <circle cx="250" cy="180" r="20" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" />
                <text x="250" y="180" textAnchor="middle" fill="white" fontSize="10">sound_design</text>
                
                <circle cx="300" cy="350" r="20" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" />
                <text x="300" y="350" textAnchor="middle" fill="white" fontSize="10">midi_basics</text>
                
                <circle cx="550" cy="180" r="20" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" />
                <text x="550" y="180" textAnchor="middle" fill="white" fontSize="10">ableton_basics</text>
                
                <circle cx="500" cy="350" r="20" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" />
                <text x="500" y="350" textAnchor="middle" fill="white" fontSize="10">music_theory</text>
                
                {/* Second-level nodes */}
                <circle cx="150" cy="120" r="15" fill="#14b8a6" fillOpacity="0.2" stroke="#14b8a6" strokeWidth="2" />
                <text x="150" y="120" textAnchor="middle" fill="white" fontSize="8">synthesis</text>
                
                <circle cx="180" cy="220" r="15" fill="#14b8a6" fillOpacity="0.2" stroke="#14b8a6" strokeWidth="2" />
                <text x="180" y="220" textAnchor="middle" fill="white" fontSize="8">sampling</text>
                
                <circle cx="650" cy="150" r="15" fill="#14b8a6" fillOpacity="0.2" stroke="#14b8a6" strokeWidth="2" />
                <text x="650" y="150" textAnchor="middle" fill="white" fontSize="8">effects</text>
                
                <circle cx="630" cy="220" r="15" fill="#14b8a6" fillOpacity="0.2" stroke="#14b8a6" strokeWidth="2" />
                <text x="630" y="220" textAnchor="middle" fill="white" fontSize="8">arrangement</text>
                
                {/* Connections */}
                <line x1="400" y1="250" x2="250" y2="180" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead)" />
                <line x1="400" y1="250" x2="300" y2="350" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead)" />
                <line x1="400" y1="250" x2="550" y2="180" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead)" />
                <line x1="400" y1="250" x2="500" y2="350" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead)" />
                
                <line x1="250" y1="180" x2="150" y2="120" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead)" />
                <line x1="250" y1="180" x2="180" y2="220" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead)" />
                <line x1="550" y1="180" x2="650" y2="150" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead)" />
                <line x1="550" y1="180" x2="630" y2="220" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead)" />
                
                {/* Connection strength indicators */}
                <text x="325" y="200" textAnchor="middle" fill="#64748b" fontSize="8" transform="rotate(-30, 325, 200)">0.85</text>
                <text x="350" y="300" textAnchor="middle" fill="#64748b" fontSize="8" transform="rotate(30, 350, 300)">0.72</text>
                <text x="475" y="200" textAnchor="middle" fill="#64748b" fontSize="8" transform="rotate(30, 475, 200)">0.79</text>
                <text x="450" y="300" textAnchor="middle" fill="#64748b" fontSize="8" transform="rotate(-30, 450, 300)">0.68</text>
              </g>
              
              {/* Animation to represent active connections */}
              <circle cx="400" cy="250" r="30" fill="none" stroke="#3b82f6" strokeWidth="1">
                <animate 
                  attributeName="r" 
                  values="25;40;25" 
                  dur="4s" 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="opacity" 
                  values="1;0;1" 
                  dur="4s" 
                  repeatCount="indefinite" 
                />
              </circle>
            </svg>
            <div className="absolute bottom-4 left-4 bg-black/70 text-xs p-2 rounded">
              <div className="flex items-center gap-2">
                <span className="block h-3 w-3 rounded-full bg-blue-500"></span>
                <span>Core Concepts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="block h-3 w-3 rounded-full bg-purple-500"></span>
                <span>Primary Topics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="block h-3 w-3 rounded-full bg-teal-500"></span>
                <span>Subtopics</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeGraph;
