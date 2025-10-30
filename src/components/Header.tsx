import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  systemLoad: number;
  processingStage: string | null;
  runMcpWorkflow: () => void;
}

const Header = ({ systemLoad, processingStage, runMcpWorkflow }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  
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
            {user && (
              <>
                {isAdmin && (
                  <Badge variant="default" className="bg-primary">
                    Admin
                  </Badge>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate("/truths")}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Truth Files
                </Button>
                <Button size="sm" variant="outline" onClick={runMcpWorkflow} disabled={!!processingStage}>
                  {processingStage ? `Processing: ${processingStage}` : "Run McP Workflow"}
                </Button>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user.email}
                </span>
                <Button size="sm" variant="outline" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            )}
            {!user && (
              <Button size="sm" variant="outline" onClick={() => navigate("/auth")} className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
