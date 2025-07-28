-- Retirer les admins de la table agents (ils ne doivent pas y être)
DELETE FROM public.agents 
WHERE user_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);

-- Mettre à jour le trigger pour ne pas ajouter les admins dans agents
CREATE OR REPLACE FUNCTION public.sync_agent_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Si un utilisateur avec le rôle agent est créé, l'ajouter à la table agents
  -- Les admins et superviseurs ne doivent PAS être dans la table agents
  IF NEW.role = 'agent' THEN
    INSERT INTO public.agents (user_id, full_name)
    SELECT p.user_id, p.full_name
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      updated_at = now();
  -- Si l'utilisateur n'est plus agent, le retirer de la table agents
  ELSIF OLD.role = 'agent' AND NEW.role != 'agent' THEN
    DELETE FROM public.agents WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;