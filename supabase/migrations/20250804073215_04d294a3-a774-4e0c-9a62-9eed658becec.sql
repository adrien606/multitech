-- Create table for building meter configurations
CREATE TABLE public.building_meter_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL,
  price_per_kwh DECIMAL(10,3) NOT NULL DEFAULT 0.15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(building_id)
);

-- Create table for meter lots
CREATE TABLE public.meter_lots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL,
  name TEXT NOT NULL,
  client_name TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for meter readings
CREATE TABLE public.meter_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_id UUID NOT NULL REFERENCES public.meter_lots(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  current_reading DECIMAL(10,2) NOT NULL,
  previous_reading DECIMAL(10,2) NOT NULL DEFAULT 0,
  consumption DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lot_id, month, year)
);

-- Enable RLS on all tables
ALTER TABLE public.building_meter_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;

-- RLS policies for building_meter_configs
CREATE POLICY "Users can view all building meter configs" 
ON public.building_meter_configs 
FOR SELECT 
USING (true);

CREATE POLICY "Facility managers and admins can manage building meter configs" 
ON public.building_meter_configs 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['facility_manager'::user_role, 'admin'::user_role]));

-- RLS policies for meter_lots
CREATE POLICY "Users can view all meter lots" 
ON public.meter_lots 
FOR SELECT 
USING (true);

CREATE POLICY "Facility managers and admins can manage meter lots" 
ON public.meter_lots 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['facility_manager'::user_role, 'admin'::user_role]));

-- RLS policies for meter_readings
CREATE POLICY "Users can view all meter readings" 
ON public.meter_readings 
FOR SELECT 
USING (true);

CREATE POLICY "Facility managers and admins can manage meter readings" 
ON public.meter_readings 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['facility_manager'::user_role, 'admin'::user_role]));

-- Create triggers for automatic timestamps
CREATE TRIGGER update_building_meter_configs_updated_at
BEFORE UPDATE ON public.building_meter_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meter_lots_updated_at
BEFORE UPDATE ON public.meter_lots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meter_readings_updated_at
BEFORE UPDATE ON public.meter_readings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();