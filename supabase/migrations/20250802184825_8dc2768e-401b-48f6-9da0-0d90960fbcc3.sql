-- Create specialities table
CREATE TABLE public.specialities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provider_specialities junction table for many-to-many relationship
CREATE TABLE public.provider_specialities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES public.specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, speciality_id)
);

-- Enable RLS on specialities table
ALTER TABLE public.specialities ENABLE ROW LEVEL SECURITY;

-- Create policies for specialities
CREATE POLICY "Users can view all specialities" 
ON public.specialities 
FOR SELECT 
USING (true);

CREATE POLICY "Supervisors and admins can manage specialities" 
ON public.specialities 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));

-- Enable RLS on provider_specialities table
ALTER TABLE public.provider_specialities ENABLE ROW LEVEL SECURITY;

-- Create policies for provider_specialities
CREATE POLICY "Users can view all provider specialities" 
ON public.provider_specialities 
FOR SELECT 
USING (true);

CREATE POLICY "Supervisors and admins can manage provider specialities" 
ON public.provider_specialities 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));

-- Add trigger for updating specialities updated_at
CREATE TRIGGER update_specialities_updated_at
BEFORE UPDATE ON public.specialities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default specialities
INSERT INTO public.specialities (name, description) VALUES
  ('Électricien', 'Travaux électriques et installations'),
  ('Plombier', 'Plomberie et sanitaires'),
  ('Chauffagiste', 'Chauffage et climatisation'),
  ('Peintre', 'Peinture et décoration'),
  ('Menuisier', 'Menuiserie et aménagements'),
  ('Maçon', 'Maçonnerie et gros œuvre'),
  ('Couvreur', 'Toiture et étanchéité'),
  ('Serrurier', 'Serrurerie et métallerie');