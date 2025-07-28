-- Créer une vue pour les agents basée sur les profils
CREATE OR REPLACE VIEW public.agents AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  ur.role,
  p.created_at,
  p.updated_at,
  true as is_active -- Par défaut, tous les agents sont actifs
FROM public.profiles p
JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE ur.role = 'agent';

-- Politique RLS pour la vue agents
-- Les utilisateurs peuvent voir tous les agents (nécessaire pour assigner des tâches)
CREATE POLICY "Users can view all agents" 
ON public.agents 
FOR SELECT 
USING (true);