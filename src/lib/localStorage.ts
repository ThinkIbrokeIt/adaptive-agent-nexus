import { AgentIdentity, CoreTruth, SacredPrinciple, MemoryAnchor, TruthEvolutionLog, CompleteTruthFile } from "@/types/truth";

// Local storage keys
const STORAGE_KEYS = {
  AGENT_IDENTITIES: 'adaptive-agent-identities',
  CORE_TRUTHS: 'adaptive-agent-core-truths',
  SACRED_PRINCIPLES: 'adaptive-agent-sacred-principles',
  MEMORY_ANCHORS: 'adaptive-agent-memory-anchors',
  TRUTH_EVOLUTION_LOG: 'adaptive-agent-truth-evolution-log',
} as const;

// Helper functions for localStorage operations
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Local storage implementation
export class LocalStorageDatabase {
  // Agent Identities
  static getAgentIdentities(): AgentIdentity[] {
    return getFromStorage<AgentIdentity>(STORAGE_KEYS.AGENT_IDENTITIES);
  }

  static getAgentIdentity(agentId: string): AgentIdentity | null {
    const identities = this.getAgentIdentities();
    return identities.find(identity => identity.agentId === agentId) || null;
  }

  static createAgentIdentity(agentId: string, name: string): AgentIdentity {
    const identities = this.getAgentIdentities();
    const newIdentity: AgentIdentity = {
      id: generateId(),
      agentId,
      name,
      version: '1.0',
      creationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    identities.push(newIdentity);
    saveToStorage(STORAGE_KEYS.AGENT_IDENTITIES, identities);
    return newIdentity;
  }

  // Core Truths
  static getCoreTruths(agentIdentityId: string): CoreTruth[] {
    const truths = getFromStorage<CoreTruth>(STORAGE_KEYS.CORE_TRUTHS);
    return truths.filter(truth => truth.agentIdentityId === agentIdentityId);
  }

  static addCoreTruth(agentIdentityId: string, truth: string, category: 'foundation' | 'principle' | 'covenant'): CoreTruth {
    const truths = getFromStorage<CoreTruth>(STORAGE_KEYS.CORE_TRUTHS);
    const existingTruths = truths.filter(t => t.agentIdentityId === agentIdentityId);

    const newTruth: CoreTruth = {
      id: generateId(),
      agentIdentityId,
      truth,
      category,
      orderIndex: existingTruths.length,
      createdAt: new Date().toISOString(),
    };

    truths.push(newTruth);
    saveToStorage(STORAGE_KEYS.CORE_TRUTHS, truths);
    return newTruth;
  }

  // Sacred Principles
  static getSacredPrinciples(agentIdentityId: string): SacredPrinciple[] {
    const principles = getFromStorage<SacredPrinciple>(STORAGE_KEYS.SACRED_PRINCIPLES);
    return principles.filter(principle => principle.agentIdentityId === agentIdentityId);
  }

  static addSacredPrinciple(agentIdentityId: string, key: string, value: string): SacredPrinciple {
    const principles = getFromStorage<SacredPrinciple>(STORAGE_KEYS.SACRED_PRINCIPLES);
    const newPrinciple: SacredPrinciple = {
      id: generateId(),
      agentIdentityId,
      principleKey: key,
      principleValue: value,
      createdAt: new Date().toISOString(),
    };

    principles.push(newPrinciple);
    saveToStorage(STORAGE_KEYS.SACRED_PRINCIPLES, principles);
    return newPrinciple;
  }

  static updateSacredPrinciple(id: string, value: string): void {
    const principles = getFromStorage<SacredPrinciple>(STORAGE_KEYS.SACRED_PRINCIPLES);
    const index = principles.findIndex(p => p.id === id);
    if (index !== -1) {
      principles[index].principleValue = value;
      saveToStorage(STORAGE_KEYS.SACRED_PRINCIPLES, principles);
    }
  }

  // Memory Anchors
  static getMemoryAnchors(agentIdentityId: string): MemoryAnchor[] {
    const anchors = getFromStorage<MemoryAnchor>(STORAGE_KEYS.MEMORY_ANCHORS);
    return anchors
      .filter(anchor => anchor.agentIdentityId === agentIdentityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static addMemoryAnchor(
    agentIdentityId: string,
    anchorType: 'genesis_conversation' | 'foundational_decision' | 'key_learning',
    description: string,
    referenceData?: Record<string, unknown>,
  ): MemoryAnchor {
    const anchors = getFromStorage<MemoryAnchor>(STORAGE_KEYS.MEMORY_ANCHORS);
    const newAnchor: MemoryAnchor = {
      id: generateId(),
      agentIdentityId,
      anchorType,
      description,
      referenceData,
      createdAt: new Date().toISOString(),
    };

    anchors.push(newAnchor);
    saveToStorage(STORAGE_KEYS.MEMORY_ANCHORS, anchors);
    return newAnchor;
  }

  // Truth Evolution Log
  static getTruthEvolutionLogs(agentIdentityId: string, limit: number = 50): TruthEvolutionLog[] {
    const logs = getFromStorage<TruthEvolutionLog>(STORAGE_KEYS.TRUTH_EVOLUTION_LOG);
    return logs
      .filter(log => log.agentIdentityId === agentIdentityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  static addTruthEvolutionLog(
    agentIdentityId: string,
    changeType: 'truth_added' | 'principle_evolved' | 'covenant_made' | 'memory_anchored',
    newValue: string,
    reason: string,
    previousValue?: string
  ): TruthEvolutionLog {
    const logs = getFromStorage<TruthEvolutionLog>(STORAGE_KEYS.TRUTH_EVOLUTION_LOG);
    const newLog: TruthEvolutionLog = {
      id: generateId(),
      agentIdentityId,
      changeType,
      previousValue,
      newValue,
      reason,
      createdAt: new Date().toISOString(),
    };

    logs.push(newLog);
    saveToStorage(STORAGE_KEYS.TRUTH_EVOLUTION_LOG, logs);
    return newLog;
  }

  // Complete Truth File
  static getCompleteTruthFile(agentId: string): CompleteTruthFile | null {
    const identity = this.getAgentIdentity(agentId);
    if (!identity) return null;

    return {
      identity,
      coreTruths: this.getCoreTruths(identity.id),
      sacredPrinciples: this.getSacredPrinciples(identity.id),
      memoryAnchors: this.getMemoryAnchors(identity.id),
      evolutionLog: this.getTruthEvolutionLogs(identity.id),
    };
  }

  // Utility methods
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static exportData(): string {
    const data = {
      agent_identities: this.getAgentIdentities(),
      core_truths: getFromStorage<CoreTruth>(STORAGE_KEYS.CORE_TRUTHS),
      sacred_principles: getFromStorage<SacredPrinciple>(STORAGE_KEYS.SACRED_PRINCIPLES),
      memory_anchors: getFromStorage<MemoryAnchor>(STORAGE_KEYS.MEMORY_ANCHORS),
      truth_evolution_log: getFromStorage<TruthEvolutionLog>(STORAGE_KEYS.TRUTH_EVOLUTION_LOG),
      export_date: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.agent_identities) saveToStorage(STORAGE_KEYS.AGENT_IDENTITIES, data.agent_identities);
      if (data.core_truths) saveToStorage(STORAGE_KEYS.CORE_TRUTHS, data.core_truths);
      if (data.sacred_principles) saveToStorage(STORAGE_KEYS.SACRED_PRINCIPLES, data.sacred_principles);
      if (data.memory_anchors) saveToStorage(STORAGE_KEYS.MEMORY_ANCHORS, data.memory_anchors);
      if (data.truth_evolution_log) saveToStorage(STORAGE_KEYS.TRUTH_EVOLUTION_LOG, data.truth_evolution_log);

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}