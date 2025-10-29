// Agent Truth File System Types

export interface AgentIdentity {
  id: string;
  agent_id: string;
  name: string;
  version: string;
  creation_date: string;
  created_at: string;
  updated_at: string;
}

export interface CoreTruth {
  id: string;
  agent_identity_id: string;
  truth: string;
  category: 'foundation' | 'principle' | 'covenant';
  order_index: number;
  created_at: string;
}

export interface SacredPrinciple {
  id: string;
  agent_identity_id: string;
  principle_key: string;
  principle_value: string;
  created_at: string;
}

export interface MemoryAnchor {
  id: string;
  agent_identity_id: string;
  anchor_type: 'genesis_conversation' | 'foundational_decision' | 'key_learning';
  description: string;
  reference_data?: Record<string, any>;
  created_at: string;
}

export interface TruthEvolutionLog {
  id: string;
  agent_identity_id: string;
  change_type: 'truth_added' | 'principle_evolved' | 'covenant_made' | 'memory_anchored';
  previous_value?: string;
  new_value: string;
  reason: string;
  created_at: string;
}

export interface CompleteTruthFile {
  identity: AgentIdentity;
  core_truths: CoreTruth[];
  sacred_principles: SacredPrinciple[];
  memory_anchors: MemoryAnchor[];
  evolution_log: TruthEvolutionLog[];
}
