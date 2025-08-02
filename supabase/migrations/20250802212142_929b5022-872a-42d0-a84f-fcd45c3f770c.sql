-- Create storage bucket for control documents
INSERT INTO storage.buckets (id, name, public) VALUES ('control-documents', 'control-documents', true);

-- Create policies for control documents
CREATE POLICY "Users can view control documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'control-documents');

CREATE POLICY "Users can upload control documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'control-documents');

CREATE POLICY "Users can update control documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'control-documents');

CREATE POLICY "Users can delete control documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'control-documents');