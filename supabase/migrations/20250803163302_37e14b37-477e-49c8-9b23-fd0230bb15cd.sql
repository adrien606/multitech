-- Créer le bucket control-documents s'il n'existe pas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('control-documents', 'control-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre la lecture des documents
CREATE POLICY "Users can view control documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'control-documents');

-- Politique pour permettre l'upload de documents
CREATE POLICY "Users can upload control documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'control-documents' AND auth.uid() IS NOT NULL);

-- Politique pour permettre la mise à jour de documents
CREATE POLICY "Users can update control documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'control-documents' AND auth.uid() IS NOT NULL);

-- Politique pour permettre la suppression de documents (pour les admins)
CREATE POLICY "Admins can delete control documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'control-documents' AND get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));