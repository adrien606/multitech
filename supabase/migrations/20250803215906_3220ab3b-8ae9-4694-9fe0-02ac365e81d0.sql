-- Mettre à jour les politiques RLS pour les contrôles réglementaires
-- Permettre aux facility managers et admins de gérer les contrôles

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Supervisors and admins can manage regulatory controls" ON public.regulatory_controls;

-- Créer de nouvelles politiques pour facility managers et admins
CREATE POLICY "Facility managers and admins can manage regulatory controls" 
ON public.regulatory_controls 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['facility_manager'::user_role, 'admin'::user_role]));

-- Mettre à jour aussi les politiques pour les documents de contrôle
DROP POLICY IF EXISTS "Supervisors and admins can manage control documents" ON public.control_documents;

CREATE POLICY "Facility managers and admins can manage control documents" 
ON public.control_documents 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['facility_manager'::user_role, 'admin'::user_role]));