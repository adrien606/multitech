-- Corriger les politiques RLS pour permettre aux agents de créer des tâches
DROP POLICY IF EXISTS "Supervisors and admins can manage tasks" ON public.tasks;

-- Permettre à tous les utilisateurs connectés de créer des tâches
CREATE POLICY "Users can create tasks" ON public.tasks 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permettre aux superviseurs et admins de modifier toutes les tâches
CREATE POLICY "Supervisors and admins can manage all tasks" ON public.tasks 
  FOR UPDATE USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));

-- Permettre aux superviseurs et admins de supprimer toutes les tâches  
CREATE POLICY "Supervisors and admins can delete all tasks" ON public.tasks 
  FOR DELETE USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));