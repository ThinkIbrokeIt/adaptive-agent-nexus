
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface McpTriggerCardsProps {
  triggerCount: {
    monitor: number;
    contextualize: number;
    personalize: number;
  };
  processingStage: string | null;
}

const McpTriggerCards = ({ triggerCount, processingStage }: McpTriggerCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Monitor Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{triggerCount.monitor}</div>
          <p className="text-sm text-slate-400 mt-1">Total triggers captured</p>
          {processingStage === "monitor" && (
            <Progress value={45} className="h-1 mt-4" />
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 pt-0">
          DuckDB + Webhook Triggers
        </CardFooter>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Contextualize Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{triggerCount.contextualize}</div>
          <p className="text-sm text-slate-400 mt-1">Context enrichments</p>
          {processingStage === "contextualize" && (
            <Progress value={60} className="h-1 mt-4" />
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 pt-0">
          ChromaDB + Vector Search
        </CardFooter>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Personalize Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{triggerCount.personalize}</div>
          <p className="text-sm text-slate-400 mt-1">Adaptive responses</p>
          {processingStage === "personalize" && (
            <Progress value={80} className="h-1 mt-4" />
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 pt-0">
          SQLite + MinIO Storage
        </CardFooter>
      </Card>
    </div>
  );
};

export default McpTriggerCards;
