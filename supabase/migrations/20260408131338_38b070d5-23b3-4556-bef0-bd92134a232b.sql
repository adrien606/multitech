CREATE POLICY "Authenticated users can update unassigned tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (assigned_to_id IS NULL)
WITH CHECK (true);