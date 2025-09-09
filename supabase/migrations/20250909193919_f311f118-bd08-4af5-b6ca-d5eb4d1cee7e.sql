-- Créer le type enum user_role qui est manquant
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'agent', 'facility_manager');

-- Vérifier que les trigger et fonctions fonctionnent correctement
-- Créer une fonction pour obtenir le rôle utilisateur (si elle n'existe pas déjà)
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result
    FROM public.user_roles
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(user_role_result, 'agent'::user_role);
END;
$$;