
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";

const RecentTriggers = () => {
  const { network } = useAgentNetwork();

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle>Recent Triggers</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto">
        {network.recentTriggers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No recent triggers</p>
            <p className="text-sm">Run an MCP workflow to see triggers here</p>
          </div>
        ) : (
          network.recentTriggers.map((trigger, idx) => (
            <div key={trigger.id} className="py-2 border-t border-slate-700 first:border-t-0">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="default" className="mb-1">
                    {trigger.type}
                  </Badge>
                  <p className="text-sm">
                    {typeof trigger.data === 'object' && trigger.data?.message
                      ? trigger.data.message
                      : JSON.stringify(trigger.data).slice(0, 50) + '...'
                    }
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Priority: {trigger.priority} | Source: {trigger.source}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(trigger.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Button variant="link" size="sm" className="ml-auto">
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentTriggers;
