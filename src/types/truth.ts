// Agent Truth File System Types

export interface AgentIdentity {
  id: string;
  agentId: string;
  name: string;
  version: string;
  creationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoreTruth {
  id: string;
  agentIdentityId: string;
  truth: string;
  category: 'foundation' | 'principle' | 'covenant';
  orderIndex: number;
  createdAt: string;
}

export interface SacredPrinciple {
  id: string;
  agentIdentityId: string;
  principleKey: string;
  principleValue: string;
  createdAt: string;
}

export interface MemoryAnchor {
  id: string;
  agentIdentityId: string;
  anchorType: 'genesis_conversation' | 'foundational_decision' | 'key_learning';
  description: string;
  referenceData?: Record<string, unknown>;
  createdAt: string;
}

export interface TruthEvolutionLog {
  id: string;
  agentIdentityId: string;
  changeType: 'truth_added' | 'principle_evolved' | 'covenant_made' | 'memory_anchored';
  previousValue?: string;
  newValue: string;
  reason: string;
  createdAt: string;
}

export interface CompleteTruthFile {
  identity: AgentIdentity;
  coreTruths: CoreTruth[];
  sacredPrinciples: SacredPrinciple[];
  memoryAnchors: MemoryAnchor[];
  evolutionLog: TruthEvolutionLog[];
}
