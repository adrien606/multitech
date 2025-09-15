-- Update default price to 0.36 and broaden permissions so non-admins can update it

-- 1) Set default to 0.36 instead of 0.15
ALTER TABLE public.building_meter_configs
  ALTER COLUMN price_per_kwh SET DEFAULT 0.36;

-- 2) Broaden RLS policy to include supervisors as well as facility managers and admins
DROP POLICY IF EXISTS "Facility managers and admins can manage building meter configs" ON public.building_meter_configs;

CREATE POLICY "Supervisors and facility managers and admins can manage building meter configs"
ON public.building_meter_configs
FOR ALL
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'facility_manager'::user_role, 'admin'::user_role])
)
WITH CHECK (
  get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'facility_manager'::user_role, 'admin'::user_role])
);

-- 3) Optional backfill: ensure existing configs use the new standard price
UPDATE public.building_meter_configs
SET price_per_kwh = 0.36
WHERE price_per_kwh IS DISTINCT FROM 0.36;