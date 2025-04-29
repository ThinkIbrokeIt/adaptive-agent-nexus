
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CircleArrowUp, Database, Waves, UserCog, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface McpTriggerCardsProps {
  triggerCount: {
    monitor: number;
    contextualize: number;
    personalize: number;
    feedback?: number;
  };
  processingStage: string | null;
  feedbackEnabled?: boolean;
}

const McpTriggerCards = ({ triggerCount, processingStage, feedbackEnabled = true }: McpTriggerCardsProps) => {
  const gridCols = feedbackEnabled ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  
  return (
    <div className={`grid ${gridCols} gap-4`}>
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900 border-slate-700 shadow-lg hover:shadow-slate-700/20 transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Database className="h-4 w-4 mr-2 text-blue-400" />
            Monitor Phase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-300">{triggerCount.monitor}</div>
          <p className="text-sm text-slate-400 mt-1">Total triggers captured</p>
          {processingStage === "monitor" && (
            <Progress value={45} className="h-1 mt-4 bg-slate-700" />
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 pt-0">
          DuckDB + Webhook Triggers
        </CardFooter>
      </Card>
      
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900 border-slate-700 shadow-lg hover:shadow-slate-700/20 transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Waves className="h-4 w-4 mr-2 text-purple-400" />
            Contextualize Phase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-purple-300">{triggerCount.contextualize}</div>
          <p className="text-sm text-slate-400 mt-1">Context enrichments</p>
          {processingStage === "contextualize" && (
            <Progress value={60} className="h-1 mt-4 bg-slate-700" />
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 pt-0">
          ChromaDB + Vector Search
        </CardFooter>
      </Card>
      
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900 border-slate-700 shadow-lg hover:shadow-slate-700/20 transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <UserCog className="h-4 w-4 mr-2 text-green-400" />
            Personalize Phase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-300">{triggerCount.personalize}</div>
          <p className="text-sm text-slate-400 mt-1">Adaptive responses</p>
          {processingStage === "personalize" && (
            <Progress value={80} className="h-1 mt-4 bg-slate-700" />
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 pt-0">
          SQLite + MinIO Storage
        </CardFooter>
      </Card>
      
      {feedbackEnabled && (
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900 border-slate-700 shadow-lg hover:shadow-slate-700/20 transition-all duration-200 hover:-translate-y-1 relative overflow-hidden">
          <div className={`absolute inset-0 bg-green-500/5 ${processingStage === "feedback" ? "animate-pulse" : ""}`}></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-lg flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 text-amber-400" />
              Feedback Loop
              <Badge variant="outline" className="ml-2 bg-green-900/30 text-green-400 border-green-600 text-xs">
                <CircleArrowUp className="h-3 w-3 mr-1" />
                Learning
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-amber-300">{triggerCount.feedback || 0}</div>
            <p className="text-sm text-slate-400 mt-1">Self-improvement cycles</p>
            {processingStage === "feedback" && (
              <Progress value={65} className="h-1 mt-4 bg-slate-700" />
            )}
          </CardContent>
          <CardFooter className="text-xs text-slate-500 pt-0 relative">
            n8n + LLM Fine-tuning
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default McpTriggerCards;
