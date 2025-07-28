-- Create storage buckets for task photos
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('task-photos', 'task-photos', true),
  ('task-comments', 'task-comments', true);

-- Create storage policies for task photos
CREATE POLICY "Users can view task photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-photos');

CREATE POLICY "Users can upload task photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own task photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'task-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own task photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'task-photos' AND auth.uid() IS NOT NULL);

-- Create storage policies for task comment photos
CREATE POLICY "Users can view task comment photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-comments');

CREATE POLICY "Users can upload task comment photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-comments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own task comment photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'task-comments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own task comment photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'task-comments' AND auth.uid() IS NOT NULL);