-- Create regulatory_controls table
CREATE TABLE public.regulatory_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  control_type_id UUID NOT NULL REFERENCES public.control_types(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  assigned_provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  notes TEXT,
  completed_date DATE,
  next_due_date DATE,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.regulatory_controls ENABLE ROW LEVEL SECURITY;

-- Create policies for regulatory_controls
CREATE POLICY "Users can view all regulatory controls" 
ON public.regulatory_controls 
FOR SELECT 
USING (true);

CREATE POLICY "Supervisors and admins can manage regulatory controls" 
ON public.regulatory_controls 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_regulatory_controls_updated_at
BEFORE UPDATE ON public.regulatory_controls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_regulatory_controls_building_id ON public.regulatory_controls(building_id);
CREATE INDEX idx_regulatory_controls_control_type_id ON public.regulatory_controls(control_type_id);
CREATE INDEX idx_regulatory_controls_due_date ON public.regulatory_controls(due_date);
CREATE INDEX idx_regulatory_controls_status ON public.regulatory_controls(status);

-- Insert some sample data
INSERT INTO public.regulatory_controls (building_id, control_type_id, due_date, status, notes, estimated_cost) 
SELECT 
  b.id as building_id,
  ct.id as control_type_id,
  CURRENT_DATE + (RANDOM() * 365)::INTEGER as due_date,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'pending'
    WHEN RANDOM() < 0.6 THEN 'in_progress'
    WHEN RANDOM() < 0.8 THEN 'completed'
    ELSE 'overdue'
  END as status,
  'Contrôle réglementaire automatiquement généré' as notes,
  (RANDOM() * 1000 + 100)::DECIMAL(10,2) as estimated_cost
FROM public.buildings b
CROSS JOIN public.control_types ct
WHERE RANDOM() < 0.4  -- Only create controls for 40% of building/control_type combinations
LIMIT 50;