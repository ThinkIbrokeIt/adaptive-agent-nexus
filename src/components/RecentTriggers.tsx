
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const RecentTriggers = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle>Recent Triggers</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto">
        {[
          { timestamp: "2025-04-23T14:32:05Z", type: "monitor", data: "ambient music production query" },
          { timestamp: "2025-04-23T14:30:22Z", type: "contextualize", data: "matched with sound design conversations" },
          { timestamp: "2025-04-23T14:28:11Z", type: "personalize", data: "generated Ableton Live tutorial plan" },
          { timestamp: "2025-04-23T14:15:47Z", type: "monitor", data: "electronic music production basics" },
          { timestamp: "2025-04-23T13:52:18Z", type: "contextualize", data: "identified knowledge gap: sound synthesis" },
        ].map((item, idx) => (
          <div key={idx} className="py-2 border-t border-slate-700 first:border-t-0">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant={item.type === "monitor" ? "default" : item.type === "contextualize" ? "secondary" : "outline"} className="mb-1">
                  {item.type}
                </Badge>
                <p className="text-sm">{item.data}</p>
              </div>
              <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
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
