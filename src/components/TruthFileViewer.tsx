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
  const { identity, coreTruths, sacredPrinciples, memoryAnchors, evolutionLog } = truthFile;

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
              Version {identity.version} • Created {format(new Date(identity.creationDate), "PPP")}
            </CardDescription>
          </div>
          <Badge variant="outline">{identity.agentId}</Badge>
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
                {coreTruths.map((truth, index) => (
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
                            {format(new Date(truth.createdAt), "PP")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < coreTruths.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="principles" className="space-y-4">
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4 pr-4">
                {sacredPrinciples.map((principle) => (
                  <div key={principle.id} className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary" className="w-fit">
                        {principle.principleKey}
                      </Badge>
                      <p className="text-sm leading-relaxed pl-2 border-l-2 border-primary/20">
                        {principle.principleValue}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        Established {format(new Date(principle.createdAt), "PP")}
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
                {memoryAnchors.map((anchor) => (
                  <div key={anchor.id} className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Anchor className="h-4 w-4 text-primary" />
                        <Badge variant="outline">{anchor.anchorType}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{anchor.description}</p>
                      {anchor.referenceData && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">
                            View reference data
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(anchor.referenceData, null, 2)}
                          </pre>
                        </details>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(anchor.createdAt), "PPp")}
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
                {evolutionLog.map((log) => (
                  <div key={log.id} className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{log.changeType}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "PPp")}
                        </span>
                      </div>
                      {log.previousValue && (
                        <div className="pl-4 border-l-2 border-destructive/20">
                          <p className="text-xs text-muted-foreground">Previous:</p>
                          <p className="text-sm line-through opacity-60">{log.previousValue}</p>
                        </div>
                      )}
                      <div className="pl-4 border-l-2 border-primary/20">
                        <p className="text-xs text-muted-foreground">New:</p>
                        <p className="text-sm font-medium">{log.newValue}</p>
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
