-- Ajouter les colonnes pour tracer qui a créé et modifié les contrôles
ALTER TABLE public.regulatory_controls 
ADD COLUMN created_by UUID REFERENCES auth.users(id),
ADD COLUMN updated_by UUID REFERENCES auth.users(id);

-- Mettre à jour les enregistrements existants avec l'utilisateur actuel (si connecté)
-- Cette partie sera exécutée lors de la migration
UPDATE public.regulatory_controls 
SET created_by = auth.uid(), updated_by = auth.uid()
WHERE created_by IS NULL OR updated_by IS NULL;

-- Créer un trigger pour automatiquement remplir ces champs
CREATE OR REPLACE FUNCTION public.handle_regulatory_controls_audit()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_regulatory_controls_audit ON public.regulatory_controls;
CREATE TRIGGER trigger_regulatory_controls_audit
  BEFORE INSERT OR UPDATE ON public.regulatory_controls
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_regulatory_controls_audit();