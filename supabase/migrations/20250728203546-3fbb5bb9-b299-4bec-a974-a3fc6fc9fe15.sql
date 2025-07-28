-- Créer une vraie table agents
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all agents" 
ON public.agents 
FOR SELECT 
USING (true);

-- Seuls les superviseurs et admins peuvent gérer les agents
CREATE POLICY "Supervisors and admins can manage agents" 
ON public.agents 
FOR ALL 
USING (get_user_role(auth.uid()) IN ('supervisor', 'admin'));

-- Trigger pour mise à jour automatique
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour synchroniser les agents avec les profils
CREATE OR REPLACE FUNCTION public.sync_agent_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Si un utilisateur avec le rôle agent est créé, l'ajouter à la table agents
  IF NEW.role = 'agent' THEN
    INSERT INTO public.agents (user_id, full_name)
    SELECT p.user_id, p.full_name
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$

-- Trigger pour synchroniser automatiquement quand un rôle est créé
CREATE TRIGGER sync_agent_on_role_insert
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_agent_profile();