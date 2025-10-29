import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lightbulb, Anchor, History, FileText } from "lucide-react";
import { CompleteTruthFile } from "@/types/truth";
import { format } from "date-fns";

interface TruthFileViewerProps {
  truthFile: CompleteTruthFile;
}

export const TruthFileViewer = ({ truthFile }: TruthFileViewerProps) => {
  const { identity, core_truths, sacred_principles, memory_anchors, evolution_log } = truthFile;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {identity.name} - Truth File
            </CardTitle>
            <CardDescription>
              Version {identity.version} • Created {format(new Date(identity.creation_date), "PPP")}
            </CardDescription>
          </div>
          <Badge variant="outline">{identity.agent_id}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="truths" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="truths">
              <Shield className="h-4 w-4 mr-2" />
              Core Truths
            </TabsTrigger>
            <TabsTrigger value="principles">
              <Lightbulb className="h-4 w-4 mr-2" />
              Principles
            </TabsTrigger>
            <TabsTrigger value="memories">
              <Anchor className="h-4 w-4 mr-2" />
              Memories
            </TabsTrigger>
            <TabsTrigger value="evolution">
              <History className="h-4 w-4 mr-2" />
              Evolution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="truths" className="space-y-4">
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4 pr-4">
                {core_truths.map((truth, index) => (
                  <div key={truth.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-1">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{truth.truth}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {truth.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(truth.created_at), "PP")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < core_truths.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="principles" className="space-y-4">
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4 pr-4">
                {sacred_principles.map((principle) => (
                  <div key={principle.id} className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary" className="w-fit">
                        {principle.principle_key}
                      </Badge>
                      <p className="text-sm leading-relaxed pl-2 border-l-2 border-primary/20">
                        {principle.principle_value}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        Established {format(new Date(principle.created_at), "PP")}
                      </span>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="memories" className="space-y-4">
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4 pr-4">
                {memory_anchors.map((anchor) => (
                  <div key={anchor.id} className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Anchor className="h-4 w-4 text-primary" />
                        <Badge variant="outline">{anchor.anchor_type}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{anchor.description}</p>
                      {anchor.reference_data && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">
                            View reference data
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(anchor.reference_data, null, 2)}
                          </pre>
                        </details>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(anchor.created_at), "PPp")}
                      </span>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="evolution" className="space-y-4">
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4 pr-4">
                {evolution_log.map((log) => (
                  <div key={log.id} className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{log.change_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "PPp")}
                        </span>
                      </div>
                      {log.previous_value && (
                        <div className="pl-4 border-l-2 border-destructive/20">
                          <p className="text-xs text-muted-foreground">Previous:</p>
                          <p className="text-sm line-through opacity-60">{log.previous_value}</p>
                        </div>
                      )}
                      <div className="pl-4 border-l-2 border-primary/20">
                        <p className="text-xs text-muted-foreground">New:</p>
                        <p className="text-sm font-medium">{log.new_value}</p>
                      </div>
                      <div className="pl-4">
                        <p className="text-xs text-muted-foreground">Reason:</p>
                        <p className="text-sm italic">{log.reason}</p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
