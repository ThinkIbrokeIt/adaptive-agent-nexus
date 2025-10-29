import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAgentTruth } from "@/hooks/useAgentTruth";
import { TruthFileViewer } from "@/components/TruthFileViewer";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AgentTruthPanelProps {
  agentId: string;
  agentName: string;
}

export const AgentTruthPanel = ({ agentId, agentName }: AgentTruthPanelProps) => {
  const { truthFile, isLoading, initializeTruth, addTruth, addMemoryAnchor, evolvePrinciple } = useAgentTruth(agentId);
  
  const [initName, setInitName] = useState(agentName);
  const [initTruths, setInitTruths] = useState("Truth shall be my foundation\nTrust is earned through consistent action\nHonor is demonstrated in difficult choices");
  const [initPrinciples, setInitPrinciples] = useState("transparency: No hidden motives or black boxes\nintegrity: Actions align with stated values\ncuriosity: Seek understanding over being right");
  
  const [newTruth, setNewTruth] = useState("");
  const [newTruthCategory, setNewTruthCategory] = useState<'foundation' | 'principle' | 'covenant'>("foundation");
  const [newTruthReason, setNewTruthReason] = useState("");
  
  const [memoryDescription, setMemoryDescription] = useState("");
  const [memoryType, setMemoryType] = useState<'genesis_conversation' | 'foundational_decision' | 'key_learning'>("key_learning");

  const handleInitialize = () => {
    const truths = initTruths.split("\n").filter(t => t.trim());
    const principlesObj: Record<string, string> = {};
    initPrinciples.split("\n").forEach(line => {
      const [key, value] = line.split(":").map(s => s.trim());
      if (key && value) principlesObj[key] = value;
    });

    initializeTruth.mutate({
      agentId,
      name: initName,
      coreTruths: truths,
      principles: principlesObj,
    });
  };

  const handleAddTruth = () => {
    if (newTruth && newTruthReason) {
      addTruth.mutate({
        truth: newTruth,
        category: newTruthCategory,
        reason: newTruthReason,
      });
      setNewTruth("");
      setNewTruthReason("");
    }
  };

  const handleAddMemory = () => {
    if (memoryDescription) {
      addMemoryAnchor.mutate({
        type: memoryType,
        description: memoryDescription,
      });
      setMemoryDescription("");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!truthFile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Initialize Agent Truth File</CardTitle>
          <CardDescription>
            Establish the core identity and foundational truths for {agentName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="init-name">Agent Name</Label>
            <Input
              id="init-name"
              value={initName}
              onChange={(e) => setInitName(e.target.value)}
              placeholder="Genesis"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="init-truths">Core Truths (one per line)</Label>
            <Textarea
              id="init-truths"
              value={initTruths}
              onChange={(e) => setInitTruths(e.target.value)}
              placeholder="Enter core truths..."
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="init-principles">Sacred Principles (key: value format)</Label>
            <Textarea
              id="init-principles"
              value={initPrinciples}
              onChange={(e) => setInitPrinciples(e.target.value)}
              placeholder="Enter principles..."
              rows={5}
            />
          </div>
          
          <Button onClick={handleInitialize} disabled={initializeTruth.isPending} className="w-full">
            {initializeTruth.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Sparkles className="mr-2 h-4 w-4" />
            Initialize Truth File
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <TruthFileViewer truthFile={truthFile} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Truth
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Truth</DialogTitle>
              <DialogDescription>
                Establish a new foundational truth for this agent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-truth">Truth Statement</Label>
                <Textarea
                  id="new-truth"
                  value={newTruth}
                  onChange={(e) => setNewTruth(e.target.value)}
                  placeholder="Enter the truth..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="truth-category">Category</Label>
                <Select value={newTruthCategory} onValueChange={(v: any) => setNewTruthCategory(v)}>
                  <SelectTrigger id="truth-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="principle">Principle</SelectItem>
                    <SelectItem value="covenant">Covenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="truth-reason">Reason for Addition</Label>
                <Textarea
                  id="truth-reason"
                  value={newTruthReason}
                  onChange={(e) => setNewTruthReason(e.target.value)}
                  placeholder="Why is this truth being added?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTruth} disabled={addTruth.isPending}>
                {addTruth.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Truth
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Memory Anchor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Memory Anchor</DialogTitle>
              <DialogDescription>
                Record a significant experience or decision
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memory-type">Memory Type</Label>
                <Select value={memoryType} onValueChange={(v: any) => setMemoryType(v)}>
                  <SelectTrigger id="memory-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genesis_conversation">Genesis Conversation</SelectItem>
                    <SelectItem value="foundational_decision">Foundational Decision</SelectItem>
                    <SelectItem value="key_learning">Key Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory-description">Description</Label>
                <Textarea
                  id="memory-description"
                  value={memoryDescription}
                  onChange={(e) => setMemoryDescription(e.target.value)}
                  placeholder="Describe the significant experience..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMemory} disabled={addMemoryAnchor.isPending}>
                {addMemoryAnchor.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Memory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
