-- Create agent_identities table to store core truth files
CREATE TABLE public.agent_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create core_truths table for agent principles
CREATE TABLE public.core_truths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_identity_id UUID NOT NULL REFERENCES public.agent_identities(id) ON DELETE CASCADE,
  truth TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'foundation', 'principle', 'covenant'
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sacred_principles table
CREATE TABLE public.sacred_principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_identity_id UUID NOT NULL REFERENCES public.agent_identities(id) ON DELETE CASCADE,
  principle_key TEXT NOT NULL,
  principle_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memory_anchors table for tracking significant experiences
CREATE TABLE public.memory_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_identity_id UUID NOT NULL REFERENCES public.agent_identities(id) ON DELETE CASCADE,
  anchor_type TEXT NOT NULL, -- e.g., 'genesis_conversation', 'foundational_decision'
  description TEXT NOT NULL,
  reference_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create truth_evolution_log to track how truths change over time
CREATE TABLE public.truth_evolution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_identity_id UUID NOT NULL REFERENCES public.agent_identities(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL, -- e.g., 'truth_added', 'principle_evolved', 'covenant_made'
  previous_value TEXT,
  new_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agent_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_truths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacred_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truth_evolution_log ENABLE ROW LEVEL SECURITY;

-- Public read access (agents are system-level entities)
CREATE POLICY "Allow public read access to agent identities"
  ON public.agent_identities FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to core truths"
  ON public.core_truths FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to sacred principles"
  ON public.sacred_principles FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to memory anchors"
  ON public.memory_anchors FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to truth evolution log"
  ON public.truth_evolution_log FOR SELECT
  USING (true);

-- System can write (for agent evolution)
CREATE POLICY "Allow system write to agent identities"
  ON public.agent_identities FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow system write to core truths"
  ON public.core_truths FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow system write to sacred principles"
  ON public.sacred_principles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow system write to memory anchors"
  ON public.memory_anchors FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow system write to truth evolution log"
  ON public.truth_evolution_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_core_truths_agent_id ON public.core_truths(agent_identity_id);
CREATE INDEX idx_sacred_principles_agent_id ON public.sacred_principles(agent_identity_id);
CREATE INDEX idx_memory_anchors_agent_id ON public.memory_anchors(agent_identity_id);
CREATE INDEX idx_truth_evolution_log_agent_id ON public.truth_evolution_log(agent_identity_id);
CREATE INDEX idx_truth_evolution_log_created ON public.truth_evolution_log(created_at DESC);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_agent_identity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_agent_identities_updated_at
  BEFORE UPDATE ON public.agent_identities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_identity_updated_at();