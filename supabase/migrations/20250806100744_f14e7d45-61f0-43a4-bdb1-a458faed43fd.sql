-- Create junction table for provider contracts and buildings
CREATE TABLE public.provider_contract_buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_contract_id UUID NOT NULL REFERENCES public.provider_contracts(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_contract_id, building_id)
);

-- Enable Row Level Security
ALTER TABLE public.provider_contract_buildings ENABLE ROW LEVEL SECURITY;

-- Create policies for provider contract buildings
CREATE POLICY "Users can view all provider contract buildings" 
ON public.provider_contract_buildings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert provider contract buildings" 
ON public.provider_contract_buildings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Facility managers and admins can manage provider contract buildings" 
ON public.provider_contract_buildings 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['facility_manager'::user_role, 'admin'::user_role]));