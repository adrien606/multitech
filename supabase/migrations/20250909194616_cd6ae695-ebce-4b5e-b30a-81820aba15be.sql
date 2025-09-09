-- Ensure enum values exist (safe ops)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'supervisor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'agent';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'facility_manager';

-- Harden handle_new_user to avoid enum cast errors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  role_text text;
  valid boolean;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, pin_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'pin_code', '0000')
  );

  -- Determine a safe role
  role_text := NEW.raw_user_meta_data->>'role';
  valid := EXISTS (
    SELECT 1 FROM unnest(enum_range(NULL::user_role)) v
    WHERE v::text = role_text
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN valid THEN role_text::user_role ELSE 'agent'::user_role END
  );

  RETURN NEW;
END;
$$;

-- Make sure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Keep agents table in sync with user_roles
DROP TRIGGER IF EXISTS user_roles_sync_agent_profile ON public.user_roles;
CREATE TRIGGER user_roles_sync_agent_profile
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_agent_profile();