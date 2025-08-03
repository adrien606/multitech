-- Corriger la fonction avec le bon search_path
CREATE OR REPLACE FUNCTION public.handle_regulatory_controls_audit()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Pour les insertions
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
    NEW.updated_by = auth.uid();
    NEW.created_at = now();
    NEW.updated_at = now();
    RETURN NEW;
  END IF;
  
  -- Pour les mises à jour
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
    NEW.updated_at = now();
    NEW.created_by = OLD.created_by; -- Préserver le créateur original
    NEW.created_at = OLD.created_at; -- Préserver la date de création
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;