import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  systemLoad: number;
  processingStage: string | null;
  runMcpWorkflow: () => void;
}

const Header = ({ systemLoad, processingStage, runMcpWorkflow }: HeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="border-b border-slate-700 bg-black/30 backdrop-blur-sm">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="font-bold">A²</span>
            </div>
            <h1 className="text-xl font-bold">Adaptive Agent Nexus</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-slate-800">
              System Load: {systemLoad.toFixed(1)}%
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate("/truths")}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Truth Files
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate("/settings")}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button size="sm" variant="outline" onClick={runMcpWorkflow} disabled={!!processingStage}>
              {processingStage ? `Processing: ${processingStage}` : "Run McP Workflow"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
