-- Créer le trigger pour synchroniser les agents (si pas déjà créé)
DROP TRIGGER IF EXISTS on_user_role_created ON public.user_roles;
CREATE TRIGGER on_user_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.sync_agent_profile();

-- Créer le trigger pour mettre à jour updated_at sur les profils
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Créer le trigger pour mettre à jour updated_at sur les agents
DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Synchroniser manuellement les agents existants (pour rattraper les utilisateurs déjà créés)
INSERT INTO public.agents (user_id, full_name)
SELECT p.user_id, p.full_name
FROM public.profiles p
JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE ur.role = 'agent'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = now();