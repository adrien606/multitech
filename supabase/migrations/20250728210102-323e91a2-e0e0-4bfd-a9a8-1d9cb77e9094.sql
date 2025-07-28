-- Créer le trigger pour gérer les nouveaux utilisateurs
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Créer le trigger pour synchroniser les agents
CREATE TRIGGER on_user_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.sync_agent_profile();

-- Créer le trigger pour mettre à jour updated_at sur les profils
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Créer le trigger pour mettre à jour updated_at sur les agents
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