-- Create control_types table
CREATE TABLE public.control_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.control_types ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all control types" 
ON public.control_types 
FOR SELECT 
USING (true);

CREATE POLICY "Supervisors and admins can manage control types" 
ON public.control_types 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_control_types_updated_at
BEFORE UPDATE ON public.control_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default control types
INSERT INTO public.control_types (name, description) VALUES 
('Vérification périodique ascenseurs', 'Contrôle réglementaire des ascenseurs selon la réglementation'),
('Contrôle incendie annuel', 'Vérification des systèmes de sécurité incendie'),
('Vérification électrique', 'Contrôle des installations électriques'),
('Contrôle climatisation', 'Vérification des systèmes de climatisation et ventilation'),
('Vérification gaz', 'Contrôle des installations de gaz'),
('Contrôle sécurité', 'Vérification générale de sécurité'),
('Inspection sanitaire', 'Contrôle des installations sanitaires'),
('Contrôle accessibilité', 'Vérification de la conformité accessibilité');