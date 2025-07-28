-- Mettre à jour la fonction handle_new_user pour utiliser le rôle fourni lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, pin_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'pin_code', '0000')
  );
  
  -- Utiliser le rôle fourni lors de l'inscription, ou agent par défaut
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'agent')::user_role);
  
  RETURN NEW;
END;
$function$