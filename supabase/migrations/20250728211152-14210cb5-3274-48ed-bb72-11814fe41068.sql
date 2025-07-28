-- Créer la table buildings
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'progress', 'validated')) DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  assigned_to_id UUID REFERENCES public.agents(user_id) ON DELETE SET NULL,
  proof_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table task_photos
CREATE TABLE public.task_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table task_comments
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('assignment', 'progress', 'clarification')) DEFAULT 'progress',
  photo_url TEXT,
  photo_filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour buildings
CREATE POLICY "Users can view all buildings" ON public.buildings FOR SELECT USING (true);
CREATE POLICY "Supervisors and admins can manage buildings" ON public.buildings 
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));

-- Politiques RLS pour tasks
CREATE POLICY "Users can view all tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Supervisors and admins can manage tasks" ON public.tasks 
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor'::user_role, 'admin'::user_role]));
CREATE POLICY "Agents can update their assigned tasks" ON public.tasks 
  FOR UPDATE USING (assigned_to_id = auth.uid());

-- Politiques RLS pour task_photos
CREATE POLICY "Users can view all task photos" ON public.task_photos FOR SELECT USING (true);
CREATE POLICY "Users can manage task photos" ON public.task_photos 
  FOR ALL USING (true);

-- Politiques RLS pour task_comments
CREATE POLICY "Users can view all task comments" ON public.task_comments FOR SELECT USING (true);
CREATE POLICY "Users can add task comments" ON public.task_comments 
  FOR INSERT WITH CHECK (true);

-- Créer les triggers pour les timestamps
CREATE TRIGGER update_buildings_updated_at
  BEFORE UPDATE ON public.buildings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer les données de base
INSERT INTO public.buildings (name, address, description) VALUES
  ('Bâtiment A - Bureaux', '123 Avenue des Entreprises, 75001 Paris', 'Immeuble de bureaux de 8 étages'),
  ('Bâtiment B - Résidentiel', '456 Rue de la Paix, 75002 Paris', 'Résidence de 15 appartements'),
  ('Entrepôt C', '789 Zone Industrielle, 94000 Créteil', 'Entrepôt logistique 2000m²');