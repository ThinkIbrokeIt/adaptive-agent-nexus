-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop all existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to agent identities" ON public.agent_identities;
DROP POLICY IF EXISTS "Allow system write to agent identities" ON public.agent_identities;
DROP POLICY IF EXISTS "Allow public read access to core truths" ON public.core_truths;
DROP POLICY IF EXISTS "Allow system write to core truths" ON public.core_truths;
DROP POLICY IF EXISTS "Allow public read access to sacred principles" ON public.sacred_principles;
DROP POLICY IF EXISTS "Allow system write to sacred principles" ON public.sacred_principles;
DROP POLICY IF EXISTS "Allow public read access to memory anchors" ON public.memory_anchors;
DROP POLICY IF EXISTS "Allow system write to memory anchors" ON public.memory_anchors;
DROP POLICY IF EXISTS "Allow public read access to truth evolution log" ON public.truth_evolution_log;
DROP POLICY IF EXISTS "Allow system write to truth evolution log" ON public.truth_evolution_log;

-- Create secure RLS policies for agent_identities
CREATE POLICY "Authenticated users can view agent identities"
  ON public.agent_identities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert agent identities"
  ON public.agent_identities
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update agent identities"
  ON public.agent_identities
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete agent identities"
  ON public.agent_identities
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for core_truths
CREATE POLICY "Authenticated users can view core truths"
  ON public.core_truths
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert core truths"
  ON public.core_truths
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update core truths"
  ON public.core_truths
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete core truths"
  ON public.core_truths
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for sacred_principles
CREATE POLICY "Authenticated users can view sacred principles"
  ON public.sacred_principles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert sacred principles"
  ON public.sacred_principles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update sacred principles"
  ON public.sacred_principles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete sacred principles"
  ON public.sacred_principles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for memory_anchors
CREATE POLICY "Authenticated users can view memory anchors"
  ON public.memory_anchors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert memory anchors"
  ON public.memory_anchors
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update memory anchors"
  ON public.memory_anchors
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete memory anchors"
  ON public.memory_anchors
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for truth_evolution_log
CREATE POLICY "Authenticated users can view truth evolution log"
  ON public.truth_evolution_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert truth evolution log"
  ON public.truth_evolution_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update truth evolution log"
  ON public.truth_evolution_log
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete truth evolution log"
  ON public.truth_evolution_log
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add validation triggers for text length limits
CREATE OR REPLACE FUNCTION public.validate_agent_identity()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Agent name must be less than 100 characters';
  END IF;
  IF length(NEW.agent_id) > 100 THEN
    RAISE EXCEPTION 'Agent ID must be less than 100 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_agent_identity_trigger
  BEFORE INSERT OR UPDATE ON public.agent_identities
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_agent_identity();

CREATE OR REPLACE FUNCTION public.validate_core_truth()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.truth) > 1000 THEN
    RAISE EXCEPTION 'Truth must be less than 1000 characters';
  END IF;
  IF length(NEW.category) > 50 THEN
    RAISE EXCEPTION 'Category must be less than 50 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_core_truth_trigger
  BEFORE INSERT OR UPDATE ON public.core_truths
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_core_truth();

CREATE OR REPLACE FUNCTION public.validate_sacred_principle()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.principle_key) > 100 THEN
    RAISE EXCEPTION 'Principle key must be less than 100 characters';
  END IF;
  IF length(NEW.principle_value) > 500 THEN
    RAISE EXCEPTION 'Principle value must be less than 500 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_sacred_principle_trigger
  BEFORE INSERT OR UPDATE ON public.sacred_principles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_sacred_principle();

CREATE OR REPLACE FUNCTION public.validate_memory_anchor()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.description) > 1000 THEN
    RAISE EXCEPTION 'Memory anchor description must be less than 1000 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_memory_anchor_trigger
  BEFORE INSERT OR UPDATE ON public.memory_anchors
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_memory_anchor();