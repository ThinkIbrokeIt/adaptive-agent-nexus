
import SystemHealth from "@/components/SystemHealth";
import McpTriggerCards from "@/components/McpTriggerCards";
import RecentTriggers from "@/components/RecentTriggers";
import WorkflowVisualizer from "@/components/WorkflowVisualizer";

interface DashboardTabProps {
  triggerCount: {
    monitor: number;
    contextualize: number;
    personalize: number;
    feedback: number;
  };
  processingStage: string | null;
  feedbackEnabled: boolean;
  onRunWorkflow?: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ 
  triggerCount, 
  processingStage, 
  feedbackEnabled,
  onRunWorkflow
}) => {
  return (
    <div className="space-y-4">
      <McpTriggerCards 
        triggerCount={triggerCount}
        processingStage={processingStage}
        feedbackEnabled={feedbackEnabled}
        onRunWorkflow={onRunWorkflow}
      />
      <SystemHealth />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTriggers />
        <WorkflowVisualizer processingStage={processingStage} />
      </div>
    </div>
  );
};

export default DashboardTab;
