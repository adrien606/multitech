-- Create table for provider contracts
CREATE TABLE public.provider_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.provider_contracts ENABLE ROW LEVEL SECURITY;

-- Create policies for provider contracts
CREATE POLICY "Users can view all provider contracts" 
ON public.provider_contracts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert provider contracts" 
ON public.provider_contracts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Facility managers and admins can manage provider contracts" 
ON public.provider_contracts 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['facility_manager'::user_role, 'admin'::user_role]));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_provider_contracts_updated_at
BEFORE UPDATE ON public.provider_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();