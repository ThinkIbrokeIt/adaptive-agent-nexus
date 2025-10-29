import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgentIdentity, CoreTruth, SacredPrinciple, MemoryAnchor, TruthEvolutionLog, CompleteTruthFile } from "@/types/truth";
import { useToast } from "@/hooks/use-toast";

export const useAgentTruth = (agentId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch complete truth file for an agent
  const { data: truthFile, isLoading } = useQuery({
    queryKey: ["agent-truth", agentId],
    queryFn: async (): Promise<CompleteTruthFile | null> => {
      // Get identity
      const { data: identity, error: identityError } = await supabase
        .from("agent_identities")
        .select("*")
        .eq("agent_id", agentId)
        .maybeSingle();

      if (identityError) throw identityError;
      if (!identity) return null;

      // Get all related data
      const [truths, principles, anchors, logs] = await Promise.all([
        supabase
          .from("core_truths")
          .select("*")
          .eq("agent_identity_id", identity.id)
          .order("order_index"),
        supabase
          .from("sacred_principles")
          .select("*")
          .eq("agent_identity_id", identity.id),
        supabase
          .from("memory_anchors")
          .select("*")
          .eq("agent_identity_id", identity.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("truth_evolution_log")
          .select("*")
          .eq("agent_identity_id", identity.id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      return {
        identity: identity as AgentIdentity,
        core_truths: (truths.data || []) as CoreTruth[],
        sacred_principles: (principles.data || []) as SacredPrinciple[],
        memory_anchors: (anchors.data || []) as MemoryAnchor[],
        evolution_log: (logs.data || []) as TruthEvolutionLog[],
      };
    },
  });

  // Initialize agent truth file
  const initializeTruth = useMutation({
    mutationFn: async (params: {
      agentId: string;
      name: string;
      coreTruths: string[];
      principles: Record<string, string>;
    }) => {
      // Create identity
      const { data: identity, error: identityError } = await supabase
        .from("agent_identities")
        .insert({
          agent_id: params.agentId,
          name: params.name,
          version: "1.0",
        })
        .select()
        .single();

      if (identityError) throw identityError;

      // Insert core truths
      const truthsToInsert = params.coreTruths.map((truth, index) => ({
        agent_identity_id: identity.id,
        truth,
        category: "foundation" as const,
        order_index: index,
      }));

      await supabase.from("core_truths").insert(truthsToInsert);

      // Insert principles
      const principlesToInsert = Object.entries(params.principles).map(([key, value]) => ({
        agent_identity_id: identity.id,
        principle_key: key,
        principle_value: value,
      }));

      await supabase.from("sacred_principles").insert(principlesToInsert);

      // Log genesis
      await supabase.from("truth_evolution_log").insert({
        agent_identity_id: identity.id,
        change_type: "memory_anchored",
        new_value: "Genesis - Truth file initialized",
        reason: "Initial agent creation and truth establishment",
      });

      return identity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-truth", agentId] });
      toast({
        title: "Truth File Initialized",
        description: "Agent identity and core truths have been established.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Initialization Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add new truth
  const addTruth = useMutation({
    mutationFn: async (params: {
      truth: string;
      category: 'foundation' | 'principle' | 'covenant';
      reason: string;
    }) => {
      if (!truthFile?.identity) throw new Error("Agent identity not found");

      const { error } = await supabase.from("core_truths").insert({
        agent_identity_id: truthFile.identity.id,
        truth: params.truth,
        category: params.category,
        order_index: truthFile.core_truths.length,
      });

      if (error) throw error;

      // Log evolution
      await supabase.from("truth_evolution_log").insert({
        agent_identity_id: truthFile.identity.id,
        change_type: "truth_added",
        new_value: params.truth,
        reason: params.reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-truth", agentId] });
      toast({
        title: "Truth Added",
        description: "New core truth has been established.",
      });
    },
  });

  // Add memory anchor
  const addMemoryAnchor = useMutation({
    mutationFn: async (params: {
      type: 'genesis_conversation' | 'foundational_decision' | 'key_learning';
      description: string;
      referenceData?: Record<string, any>;
    }) => {
      if (!truthFile?.identity) throw new Error("Agent identity not found");

      const { error } = await supabase.from("memory_anchors").insert({
        agent_identity_id: truthFile.identity.id,
        anchor_type: params.type,
        description: params.description,
        reference_data: params.referenceData,
      });

      if (error) throw error;

      // Log evolution
      await supabase.from("truth_evolution_log").insert({
        agent_identity_id: truthFile.identity.id,
        change_type: "memory_anchored",
        new_value: params.description,
        reason: `Memory anchor: ${params.type}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-truth", agentId] });
      toast({
        title: "Memory Anchored",
        description: "Significant experience has been recorded.",
      });
    },
  });

  // Evolve principle
  const evolvePrinciple = useMutation({
    mutationFn: async (params: {
      principleKey: string;
      newValue: string;
      reason: string;
    }) => {
      if (!truthFile?.identity) throw new Error("Agent identity not found");

      const existing = truthFile.sacred_principles.find(
        (p) => p.principle_key === params.principleKey
      );

      const { error } = await supabase
        .from("sacred_principles")
        .update({ principle_value: params.newValue })
        .eq("agent_identity_id", truthFile.identity.id)
        .eq("principle_key", params.principleKey);

      if (error) throw error;

      // Log evolution
      await supabase.from("truth_evolution_log").insert({
        agent_identity_id: truthFile.identity.id,
        change_type: "principle_evolved",
        previous_value: existing?.principle_value,
        new_value: params.newValue,
        reason: params.reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-truth", agentId] });
      toast({
        title: "Principle Evolved",
        description: "Sacred principle has been refined through growth.",
      });
    },
  });

  return {
    truthFile,
    isLoading,
    initializeTruth,
    addTruth,
    addMemoryAnchor,
    evolvePrinciple,
  };
};
