-- Promouvoir l'utilisateur actuel (adrien) en tant qu'admin
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = 'ba8b4cea-9507-4378-9e08-4ee027b595fa';

-- Vérifier que la mise à jour a fonctionné
SELECT p.full_name, ur.role 
FROM public.profiles p 
JOIN public.user_roles ur ON p.user_id = ur.user_id 
WHERE p.user_id = 'ba8b4cea-9507-4378-9e08-4ee027b595fa';