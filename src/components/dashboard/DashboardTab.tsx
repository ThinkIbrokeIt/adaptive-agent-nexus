
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
}

const DashboardTab: React.FC<DashboardTabProps> = ({ 
  triggerCount, 
  processingStage, 
  feedbackEnabled 
}) => {
  return (
    <div className="space-y-4">
      <McpTriggerCards 
        triggerCount={triggerCount}
        processingStage={processingStage}
        feedbackEnabled={feedbackEnabled}
      />
      <SystemHealth />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTriggers />
        <WorkflowVisualizer />
      </div>
    </div>
  );
};

export default DashboardTab;
