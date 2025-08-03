-- Créer une table pour les documents de contrôle réglementaire
CREATE TABLE public.control_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  regulatory_control_id UUID NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')),
  uploaded_by UUID,
  validated_by UUID,
  validated_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.control_documents ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS
CREATE POLICY "Users can view all control documents" 
ON public.control_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert control documents" 
ON public.control_documents 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Supervisors and admins can manage control documents" 
ON public.control_documents 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));

-- Créer un trigger pour la mise à jour automatique du timestamp
CREATE TRIGGER update_control_documents_updated_at
BEFORE UPDATE ON public.control_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ajouter quelques documents d'exemple liés aux contrôles existants
INSERT INTO public.control_documents (regulatory_control_id, filename, original_filename, file_path, file_size, file_type, status, notes) 
SELECT 
  rc.id,
  'rapport_' || rc.id || '_' || EXTRACT(year FROM rc.due_date) || '.pdf',
  'Rapport ' || ct.name || ' - ' || b.name || '.pdf',
  '/documents/control_' || rc.id || '.pdf',
  FLOOR(random() * 3000000 + 1000000)::INTEGER, -- Taille entre 1MB et 4MB
  'application/pdf',
  CASE WHEN rc.status = 'completed' THEN 'validated' ELSE 'pending' END,
  CASE WHEN rc.status = 'completed' THEN 'Document validé automatiquement' ELSE 'En attente de validation' END
FROM public.regulatory_controls rc
JOIN public.control_types ct ON rc.control_type_id = ct.id
JOIN public.buildings b ON rc.building_id = b.id
LIMIT 10;