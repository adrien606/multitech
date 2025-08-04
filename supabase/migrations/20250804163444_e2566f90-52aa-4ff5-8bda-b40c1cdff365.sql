-- Créer la table pour les PDL (Points de Livraison / Compteurs électriques)
CREATE TABLE public.electrical_meters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL,
  meter_number TEXT NOT NULL,
  name TEXT NOT NULL,
  pdl_number TEXT, -- Numéro de Point de Livraison
  supplier TEXT, -- Fournisseur d'électricité
  contract_reference TEXT, -- Référence du contrat
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_meter_per_building UNIQUE(building_id, meter_number)
);

-- Enable Row Level Security
ALTER TABLE public.electrical_meters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Facility managers and admins can manage electrical meters" 
ON public.electrical_meters 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['facility_manager'::user_role, 'admin'::user_role]));

CREATE POLICY "Users can view all electrical meters" 
ON public.electrical_meters 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_electrical_meters_updated_at
BEFORE UPDATE ON public.electrical_meters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();