-- Trigger pour synchroniser automatiquement quand un rôle est créé
CREATE TRIGGER sync_agent_on_role_insert
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_agent_profile();