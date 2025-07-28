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