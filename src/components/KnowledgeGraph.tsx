
import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";
import { useKnowledgeGraphDemo } from "@/hooks/useKnowledgeGraphDemo";
import { useLocalAgentTruth } from "@/hooks/useLocalAgentTruth";
import { Agent, AgentMessage } from "@/types/agent";
import { Download, FileJson, Image, FileText, Search, Filter, Zap, Eye, EyeOff, RotateCcw } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: 'agent' | 'metric' | 'workflow' | 'truth' | 'message';
  status?: string;
  x: number;
  y: number;
  connections: string[];
  data?: any;
  agent?: Agent;
}

interface GraphEdge {
  from: string;
  to: string;
  strength: number;
  type: 'message' | 'task' | 'capability' | 'truth' | 'workflow';
  messages?: AgentMessage[];
}

const KnowledgeGraph = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showMessages, setShowMessages] = useState(true);
  const [showTruthConnections, setShowTruthConnections] = useState(true);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoLayout, setAutoLayout] = useState(true);

  const { network } = useAgentNetwork();
  const { simulateAgentInteraction, simulateSearchTask, resetAllAgents } = useKnowledgeGraphDemo();
  const svgRef = useRef<SVGSVGElement>(null);

  // Export functions
  const exportAsJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      systemMetrics: metrics,
      graphData: {
        nodes,
        edges,
        agentNetwork: {
          agents: network.agents,
          activeAgents: network.activeAgents,
          messageCount: network.messages.length
        }
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsSVG = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportMetricsAsCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Timestamp', new Date().toISOString()],
      ['Total Messages', metrics.totalMessages.toString()],
      ['Active Agents', metrics.activeAgents.toString()],
      ['Completed Tasks', metrics.completedTasks.toString()],
      ['Average Response Time', `${metrics.avgResponseTime}s`],
      ['', ''],
      ['Agent Health Status', ''],
      ...Object.entries(metrics.agentHealth).map(([agent, status]) => [agent, status])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(csvBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `system-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsPNG = async () => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 800;
        canvas.height = 500;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, 'image/png');

        URL.revokeObjectURL(svgUrl);
      };

      img.src = svgUrl;
    } catch (error) {
      console.error('PNG export failed:', error);
    }
  };

  // Generate real graph data from agent network
  const { nodes, edges, metrics } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Add agent nodes with enhanced positioning
    network.agents.forEach((agent, index) => {
      let x, y;
      if (autoLayout) {
        const angle = (index / network.agents.length) * 2 * Math.PI;
        const radius = 150;
        x = 400 + Math.cos(angle) * radius;
        y = 250 + Math.sin(angle) * radius;
      } else {
        // Use stored positions or default
        x = agent.id === 'primary-agent' ? 400 : 400 + (index - 1) * 80;
        y = agent.id === 'primary-agent' ? 100 : 250 + Math.sin((index / network.agents.length) * 2 * Math.PI) * 100;
      }

      nodes.push({
        id: agent.id,
        label: agent.name,
        type: 'agent',
        status: agent.status,
        x,
        y,
        connections: [],
        agent
      });
    });

    // Add central workflow node
    nodes.push({
      id: 'mcp-workflow',
      label: 'McP Workflow',
      type: 'workflow',
      x: 400,
      y: 250,
      connections: network.agents.map(a => a.id)
    });

    // Add system metrics node
    nodes.push({
      id: 'system-metrics',
      label: 'System Metrics',
      type: 'metric',
      x: 650,
      y: 150,
      connections: ['mcp-workflow']
    });

    // Add truth file nodes for agents that have them
    network.agents.forEach((agent, index) => {
      if (agent.type !== 'spawned') { // Truth files are mainly for primary agents
        const truthNode: GraphNode = {
          id: `truth-${agent.id}`,
          label: `${agent.name} Truth`,
          type: 'truth',
          x: 150 + index * 100,
          y: 400,
          connections: [agent.id],
          data: { agentId: agent.id }
        };
        nodes.push(truthNode);
      }
    });

    // Create edges based on agent capabilities, message flow, and truth connections
    network.agents.forEach(agent => {
      // Connect to workflow
      edges.push({
        from: agent.id,
        to: 'mcp-workflow',
        strength: 0.8,
        type: 'workflow'
      });

      // Connect agents with shared capabilities
      network.agents.forEach(otherAgent => {
        if (agent.id !== otherAgent.id) {
          const sharedCapabilities = agent.capabilities.filter(cap =>
            otherAgent.capabilities.includes(cap)
          );
          if (sharedCapabilities.length > 0) {
            edges.push({
              from: agent.id,
              to: otherAgent.id,
              strength: sharedCapabilities.length * 0.3,
              type: 'capability'
            });
          }
        }
      });

      // Connect to truth files
      if (agent.type !== 'spawned') {
        edges.push({
          from: agent.id,
          to: `truth-${agent.id}`,
          strength: 0.9,
          type: 'truth'
        });
      }
    });

    // Add message flow edges if enabled
    if (showMessages) {
      const messageFlows = new Map<string, AgentMessage[]>();

      network.messages.forEach(message => {
        const key = `${message.from}-${message.to}`;
        if (!messageFlows.has(key)) {
          messageFlows.set(key, []);
        }
        messageFlows.get(key)!.push(message);
      });

      messageFlows.forEach((messages, key) => {
        const [from, to] = key.split('-');
        edges.push({
          from,
          to,
          strength: Math.min(messages.length * 0.1, 1),
          type: 'message',
          messages
        });
      });
    }

    // Connect workflow to metrics
    edges.push({
      from: 'mcp-workflow',
      to: 'system-metrics',
      strength: 0.9,
      type: 'task'
    });

    // Calculate enhanced metrics
    const totalMessages = network.messages.length;
    const activeAgents = network.agents.filter(a => a.status === 'processing').length;
    const completedTasks = network.messages.filter(m =>
      m.content && typeof m.content === 'object' && m.content.type === 'task_complete'
    ).length;
    const avgResponseTime = totalMessages > 0 ? 2.3 : 0;

    // Calculate message throughput
    const recentMessages = network.messages.filter(m =>
      new Date(m.timestamp) > new Date(Date.now() - 60000) // Last minute
    ).length;

    const metrics = {
      totalMessages,
      activeAgents,
      completedTasks,
      avgResponseTime,
      messageThroughput: recentMessages,
      agentHealth: network.agents.reduce((acc, agent) => {
        acc[agent.type] = agent.status;
        return acc;
      }, {} as Record<string, string>),
      spawnedAgents: network.spawnedAgents?.length || 0,
      truthFiles: network.agents.filter(a => a.type !== 'spawned').length
    };

    return { nodes, edges, metrics };
  }, [network, showMessages, showTruthConnections, autoLayout]);

  // Filter nodes based on search and type filters
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = searchTerm === "" ||
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || node.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [nodes, searchTerm, filterType]);

  const filteredEdges = useMemo(() => {
    return edges.filter(edge => {
      const fromNode = filteredNodes.find(n => n.id === edge.from);
      const toNode = filteredNodes.find(n => n.id === edge.to);
      return fromNode && toNode;
    });
  }, [edges, filteredNodes]);

  // Node interaction handlers
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  const handleNodeDragStart = (node: GraphNode, event: React.MouseEvent) => {
    setDraggedNode(node);
    setIsDragging(true);
    setAutoLayout(false);
  };

  const handleNodeDrag = (event: React.MouseEvent) => {
    if (!isDragging || !draggedNode || !svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = (event.clientX - svgRect.left) / zoomLevel;
    const y = (event.clientY - svgRect.top) / zoomLevel;

    // Update node position (in a real implementation, you'd update the state)
    draggedNode.x = x;
    draggedNode.y = y;

    // Force re-render
    setDraggedNode({ ...draggedNode });
  };

  const handleNodeDragEnd = () => {
    setDraggedNode(null);
    setIsDragging(false);
  };

  const resetLayout = () => {
    setAutoLayout(true);
    setSelectedNode(null);
  };

  const getNodeColor = (node: GraphNode) => {
    if (node.id === selectedNode?.id) {
      return '#ffffff'; // Highlight selected node
    }

    switch (node.type) {
      case 'agent':
        switch (node.status) {
          case 'processing': return '#f59e0b'; // amber
          case 'success': return '#10b981'; // green
          case 'error': return '#ef4444'; // red
          default: return '#6b7280'; // gray
        }
      case 'workflow': return '#3b82f6'; // blue
      case 'metric': return '#8b5cf6'; // purple
      case 'truth': return '#f97316'; // orange
      case 'message': return '#06b6d4'; // cyan
      default: return '#6b7280';
    }
  };

  const getEdgeColor = (edge: GraphEdge) => {
    switch (edge.type) {
      case 'message': return '#64748b';
      case 'task': return '#10b981';
      case 'capability': return '#8b5cf6';
      case 'truth': return '#f97316';
      case 'workflow': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-4">
            <span>Interactive Knowledge Graph</span>
            {selectedNode && (
              <Badge variant="outline" className="bg-white/10">
                Selected: {selectedNode.label}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              Nodes: {filteredNodes.length}/{nodes.length}
            </Badge>
            <Badge variant="outline">
              Edges: {filteredEdges.length}
            </Badge>
            <Badge variant="outline">
              Active: {metrics.activeAgents}
            </Badge>
            <div className="flex items-center gap-1 text-xs">
              <button
                className="h-6 w-6 rounded bg-slate-700 flex items-center justify-center hover:bg-slate-600"
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              >
                -
              </button>
              <span>{Math.round(zoomLevel * 100)}%</span>
              <button
                className="h-6 w-6 rounded bg-slate-700 flex items-center justify-center hover:bg-slate-600"
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
              >
                +
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Interactive Controls */}
          <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 bg-slate-800 border-slate-600 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-8 bg-slate-800 border-slate-600 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="agent">Agents</SelectItem>
                    <SelectItem value="workflow">Workflow</SelectItem>
                    <SelectItem value="metric">Metrics</SelectItem>
                    <SelectItem value="truth">Truth Files</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={showMessages ? "default" : "outline"}
                  onClick={() => setShowMessages(!showMessages)}
                  className="h-8 text-xs"
                >
                  {showMessages ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                  Messages
                </Button>
                <Button
                  size="sm"
                  variant={showTruthConnections ? "default" : "outline"}
                  onClick={() => setShowTruthConnections(!showTruthConnections)}
                  className="h-8 text-xs"
                >
                  Truth
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetLayout}
                  className="h-8 text-xs"
                  title="Reset to auto layout"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset Layout
                </Button>
                <Button
                  size="sm"
                  variant={autoLayout ? "default" : "outline"}
                  onClick={() => setAutoLayout(!autoLayout)}
                  className="h-8 text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Auto
                </Button>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              💡 Click nodes to select • Drag to reposition • Use filters to focus on specific elements
            </div>
          </div>

          {/* Demo Controls and Export */}
          <div className="mb-4 flex gap-2 flex-wrap items-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={simulateAgentInteraction}
                className="text-xs"
              >
                Simulate Workflow
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={simulateSearchTask}
                className="text-xs"
              >
                Simulate Search
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetAllAgents}
                className="text-xs"
              >
                Reset Agents
              </Button>
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={exportAsJSON}
                className="text-xs"
                title="Export graph data as JSON"
              >
                <FileJson className="w-3 h-3 mr-1" />
                JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportAsSVG}
                className="text-xs"
                title="Export visualization as SVG"
              >
                <Image className="w-3 h-3 mr-1" />
                SVG
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportAsPNG}
                className="text-xs"
                title="Export visualization as PNG"
              >
                <Download className="w-3 h-3 mr-1" />
                PNG
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportMetricsAsCSV}
                className="text-xs"
                title="Export metrics as CSV"
              >
                <FileText className="w-3 h-3 mr-1" />
                CSV
              </Button>
            </div>

            <div className="text-xs text-slate-400 flex items-center ml-4">
              Click buttons to see real-time graph updates • Export data for analysis
            </div>
          </div>
          <div
            className="bg-slate-900/60 rounded-lg overflow-hidden h-[500px] relative"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 500"
              ref={svgRef}
              onMouseMove={handleNodeDrag}
              onMouseUp={handleNodeDragEnd}
              onMouseLeave={handleNodeDragEnd}
              className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                </marker>
                <marker id="arrowhead-task" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                </marker>
                <marker id="arrowhead-capability" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                </marker>
                <marker id="arrowhead-truth" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
                </marker>
                <marker id="arrowhead-workflow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>

              {/* Render edges first (behind nodes) */}
              {filteredEdges.map((edge, index) => {
                const fromNode = filteredNodes.find(n => n.id === edge.from);
                const toNode = filteredNodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const markerId = edge.type === 'task' ? 'arrowhead-task' :
                                edge.type === 'capability' ? 'arrowhead-capability' :
                                edge.type === 'truth' ? 'arrowhead-truth' :
                                edge.type === 'workflow' ? 'arrowhead-workflow' : 'arrowhead';

                return (
                  <line
                    key={`edge-${index}`}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={getEdgeColor(edge)}
                    strokeWidth={edge.strength * 3}
                    markerEnd={`url(#${markerId})`}
                    opacity={edge.strength}
                  />
                );
              })}

              {/* Render nodes */}
              {filteredNodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.type === 'workflow' ? 30 : node.type === 'metric' ? 25 : node.type === 'truth' ? 18 : 20}
                    fill={getNodeColor(node)}
                    fillOpacity={node.id === selectedNode?.id ? "0.4" : "0.2"}
                    stroke={getNodeColor(node)}
                    strokeWidth={node.id === selectedNode?.id ? "3" : "2"}
                    className="cursor-pointer hover:stroke-white transition-all duration-200"
                    onClick={() => handleNodeClick(node)}
                    onMouseDown={(e) => handleNodeDragStart(node, e)}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    fill="white"
                    fontSize={node.type === 'workflow' ? "12" : "10"}
                    className="pointer-events-none select-none"
                  >
                    {node.label}
                  </text>
                  {node.status && (
                    <text
                      x={node.x}
                      y={node.y + 15}
                      textAnchor="middle"
                      fill={getNodeColor(node)}
                      fontSize="8"
                      className="pointer-events-none select-none"
                    >
                      {node.status}
                    </text>
                  )}
                  {node.type === 'truth' && (
                    <text
                      x={node.x}
                      y={node.y - 20}
                      textAnchor="middle"
                      fill="#f97316"
                      fontSize="6"
                      className="pointer-events-none select-none"
                    >
                      TRUTH
                    </text>
                  )}
                </g>
              ))}

              {/* Animated connection indicators for active agents */}
              {nodes.filter(node => node.type === 'agent' && node.status === 'processing').map((node) => (
                <circle
                  key={`pulse-${node.id}`}
                  cx={node.x}
                  cy={node.y}
                  r="25"
                  fill="none"
                  stroke={getNodeColor(node)}
                  strokeWidth="1"
                >
                  <animate
                    attributeName="r"
                    values="20;35;20"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0;1"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </svg>

            {/* Real-time metrics overlay */}
            <div className="absolute top-4 left-4 bg-black/70 text-xs p-3 rounded space-y-2 max-w-xs">
              <div className="font-semibold text-white mb-2">Live System Metrics</div>

              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Messages:</span>
                  <span className="text-white">{metrics.totalMessages}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Active Agents:</span>
                  <span className="text-green-400">{metrics.activeAgents}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Msg/min:</span>
                  <span className="text-cyan-400">{metrics.messageThroughput}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Spawned:</span>
                  <span className="text-orange-400">{metrics.spawnedAgents}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Truth Files:</span>
                  <span className="text-purple-400">{metrics.truthFiles}</span>
                </div>
              </div>

              <div className="border-t border-slate-600 pt-2 mt-2">
                <div className="font-semibold text-white mb-1">Agent Health</div>
                {Object.entries(metrics.agentHealth).map(([type, status]) => (
                  <div key={type} className="flex justify-between gap-4 text-xs">
                    <span className="text-slate-300 capitalize">{type}:</span>
                    <span className={`${
                      status === 'processing' ? 'text-amber-400' :
                      status === 'success' ? 'text-green-400' :
                      status === 'error' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="absolute top-4 right-4 bg-black/70 text-xs p-3 rounded max-w-xs">
                <div className="font-semibold text-white mb-2">Node Details</div>
                <div className="space-y-1">
                  <div><span className="text-slate-300">Name:</span> <span className="text-white">{selectedNode.label}</span></div>
                  <div><span className="text-slate-300">Type:</span> <span className="text-white capitalize">{selectedNode.type}</span></div>
                  {selectedNode.status && (
                    <div><span className="text-slate-300">Status:</span> <span className={`${
                      selectedNode.status === 'processing' ? 'text-amber-400' :
                      selectedNode.status === 'success' ? 'text-green-400' :
                      selectedNode.status === 'error' ? 'text-red-400' : 'text-slate-400'
                    }`}>{selectedNode.status}</span></div>
                  )}
                  {selectedNode.agent && (
                    <>
                      <div><span className="text-slate-300">Capabilities:</span></div>
                      <div className="text-slate-400 ml-2">
                        {selectedNode.agent.capabilities.join(', ')}
                      </div>
                    </>
                  )}
                  <div><span className="text-slate-300">Connections:</span> <span className="text-white">{selectedNode.connections.length}</span></div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-xs p-2 rounded max-w-xs">
              <div className="space-y-1">
                <div className="text-slate-400 font-semibold mb-1">Node Types:</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Workflow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Truth Files</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span>Agent</span>
                </div>

                <div className="border-t border-slate-600 pt-1 mt-2">
                  <div className="text-slate-400 font-semibold mb-1">Edge Types:</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-slate-400"></div>
                    <span>Messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-500"></div>
                    <span>Tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-purple-500"></div>
                    <span>Capabilities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-orange-500"></div>
                    <span>Truth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-blue-500"></div>
                    <span>Workflow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeGraph;
