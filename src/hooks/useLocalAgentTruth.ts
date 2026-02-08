import { useState, useEffect } from "react";
import { LocalStorageDatabase } from "@/lib/localStorage";
import { AgentIdentity, CoreTruth, SacredPrinciple, MemoryAnchor, TruthEvolutionLog, CompleteTruthFile } from "@/types/truth";

export const useLocalAgentTruth = (agentId: string) => {
  const [truthFile, setTruthFile] = useState<CompleteTruthFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount and when agentId changes
  useEffect(() => {
    const loadTruthFile = () => {
      setIsLoading(true);
      const data = LocalStorageDatabase.getCompleteTruthFile(agentId);
      setTruthFile(data);
      setIsLoading(false);
    };

    loadTruthFile();
  }, [agentId]);

  // Initialize agent truth file
  const initializeTruth = async (params: {
    agentId: string;
    name: string;
    coreTruths: string[];
    principles: Record<string, string>;
  }) => {
    try {
      // Create identity
      const identity = LocalStorageDatabase.createAgentIdentity(params.agentId, params.name);

      // Insert core truths
      params.coreTruths.forEach((truth, index) => {
        LocalStorageDatabase.addCoreTruth(identity.id, truth, 'foundation');
      });

      // Insert principles
      Object.entries(params.principles).forEach(([key, value]) => {
        LocalStorageDatabase.addSacredPrinciple(identity.id, key, value);
      });

      // Log genesis
      LocalStorageDatabase.addTruthEvolutionLog(
        identity.id,
        'memory_anchored',
        'Genesis - Truth file initialized',
        'Initial agent creation and truth establishment'
      );

      // Reload data
      const updatedData = LocalStorageDatabase.getCompleteTruthFile(params.agentId);
      setTruthFile(updatedData);

      return identity;
    } catch (error) {
      throw new Error(`Failed to initialize truth file: ${error}`);
    }
  };

  // Add new truth
  const addTruth = async (params: {
    truth: string;
    category: 'foundation' | 'principle' | 'covenant';
    reason: string;
  }) => {
    if (!truthFile?.identity) throw new Error("Agent identity not found");

    try {
      LocalStorageDatabase.addCoreTruth(truthFile.identity.id, params.truth, params.category);

      // Log evolution
      LocalStorageDatabase.addTruthEvolutionLog(
        truthFile.identity.id,
        'truth_added',
        params.truth,
        params.reason
      );

      // Reload data
      const updatedData = LocalStorageDatabase.getCompleteTruthFile(agentId);
      setTruthFile(updatedData);
    } catch (error) {
      throw new Error(`Failed to add truth: ${error}`);
    }
  };

  // Add memory anchor
  const addMemoryAnchor = async (params: {
    anchorType: 'genesis_conversation' | 'foundational_decision' | 'key_learning';
    description: string;
    referenceData?: Record<string, unknown>;
  }) => {
    if (!truthFile?.identity) throw new Error("Agent identity not found");

    try {
      LocalStorageDatabase.addMemoryAnchor(
        truthFile.identity.id,
        params.anchorType,
        params.description,
        params.referenceData
      );

      // Log evolution
      LocalStorageDatabase.addTruthEvolutionLog(
        truthFile.identity.id,
        'memory_anchored',
        params.description,
        `Memory anchor created: ${params.anchorType}`
      );

      // Reload data
      const updatedData = LocalStorageDatabase.getCompleteTruthFile(agentId);
      setTruthFile(updatedData);
    } catch (error) {
      throw new Error(`Failed to add memory anchor: ${error}`);
    }
  };

  // Evolve principle
  const evolvePrinciple = async (params: {
    principleId: string;
    newValue: string;
    reason: string;
  }) => {
    try {
      const principles = LocalStorageDatabase.getSacredPrinciples(truthFile?.identity?.id || '');
      const principle = principles.find(p => p.id === params.principleId);

      if (!principle) throw new Error("Principle not found");

      // Log evolution before change
      LocalStorageDatabase.addTruthEvolutionLog(
        principle.agentIdentityId,
        'principle_evolved',
        params.newValue,
        params.reason,
        principle.principleValue
      );

      // Update principle
      LocalStorageDatabase.updateSacredPrinciple(params.principleId, params.newValue);

      // Reload data
      const updatedData = LocalStorageDatabase.getCompleteTruthFile(agentId);
      setTruthFile(updatedData);
    } catch (error) {
      throw new Error(`Failed to evolve principle: ${error}`);
    }
  };

  // Utility functions
  const exportData = () => {
    return LocalStorageDatabase.exportData();
  };

  const importData = (jsonData: string) => {
    const success = LocalStorageDatabase.importData(jsonData);
    if (success) {
      // Reload data
      const updatedData = LocalStorageDatabase.getCompleteTruthFile(agentId);
      setTruthFile(updatedData);
    }
    return success;
  };

  const clearAllData = () => {
    LocalStorageDatabase.clearAllData();
    setTruthFile(null);
  };

  return {
    truthFile,
    isLoading,
    initializeTruth,
    addTruth,
    addMemoryAnchor,
    evolvePrinciple,
    exportData,
    importData,
    clearAllData,
  };
};