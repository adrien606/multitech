-- Créer une table de liaison pour les prestataires et bâtiments
CREATE TABLE public.provider_buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, building_id)
);

-- Enable Row Level Security
ALTER TABLE public.provider_buildings ENABLE ROW LEVEL SECURITY;

-- Create policies for provider_buildings
CREATE POLICY "Supervisors and admins can manage provider buildings" 
ON public.provider_buildings 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));

CREATE POLICY "Users can view all provider buildings" 
ON public.provider_buildings 
FOR SELECT 
USING (true);

-- Supprimer la colonne building_id de la table providers (si elle existe)
-- Note: cette colonne n'existe pas encore dans la DB actuelle donc cette ligne ne fera rien
ALTER TABLE public.providers DROP COLUMN IF EXISTS building_id;