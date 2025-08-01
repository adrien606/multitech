-- Create regulatory controls tables

-- Table pour les types de contrôles réglementaires
CREATE TABLE public.control_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  frequency_months INTEGER NOT NULL, -- fréquence en mois
  building_types TEXT[], -- types de bâtiments concernés (bureau, industriel, ERP)
  mandatory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les contrôles réglementaires
CREATE TABLE public.regulatory_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  control_type_id UUID NOT NULL REFERENCES public.control_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  provider_id UUID, -- référence vers le prestataire assigné
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les prestataires
CREATE TABLE public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  specialties TEXT[], -- domaines de spécialité
  certifications TEXT[], -- certifications détenues
  notes TEXT,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour lier les prestataires aux bâtiments
CREATE TABLE public.building_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  services TEXT[], -- services fournis pour ce bâtiment
  contract_start_date DATE,
  contract_end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(building_id, provider_id)
);

-- Table pour les interventions des prestataires
CREATE TABLE public.provider_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  control_id UUID REFERENCES public.regulatory_controls(id) ON DELETE SET NULL,
  intervention_date DATE NOT NULL,
  intervention_type TEXT NOT NULL,
  description TEXT NOT NULL,
  cost DECIMAL(10,2),
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les documents liés aux contrôles
CREATE TABLE public.control_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  control_id UUID REFERENCES public.regulatory_controls(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'quote', 'report', 'invoice', 'certificate', 'other')),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les commentaires sur les contrôles
CREATE TABLE public.control_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  control_id UUID NOT NULL REFERENCES public.regulatory_controls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'general' CHECK (comment_type IN ('general', 'progress', 'issue', 'completion')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter la référence provider_id à regulatory_controls
ALTER TABLE public.regulatory_controls 
ADD CONSTRAINT fk_regulatory_controls_provider 
FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE SET NULL;

-- Enable RLS sur toutes les tables
ALTER TABLE public.control_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour control_types
CREATE POLICY "Users can view all control types" ON public.control_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage control types" ON public.control_types FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies pour regulatory_controls
CREATE POLICY "Users can view all regulatory controls" ON public.regulatory_controls FOR SELECT USING (true);
CREATE POLICY "Supervisors and admins can manage regulatory controls" ON public.regulatory_controls FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor', 'admin']));
CREATE POLICY "Users can create regulatory controls" ON public.regulatory_controls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies pour providers
CREATE POLICY "Users can view all providers" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Supervisors and admins can manage providers" ON public.providers FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor', 'admin']));

-- RLS Policies pour building_providers
CREATE POLICY "Users can view all building providers" ON public.building_providers FOR SELECT USING (true);
CREATE POLICY "Supervisors and admins can manage building providers" ON public.building_providers FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor', 'admin']));

-- RLS Policies pour provider_interventions
CREATE POLICY "Users can view all provider interventions" ON public.provider_interventions FOR SELECT USING (true);
CREATE POLICY "Supervisors and admins can manage provider interventions" ON public.provider_interventions FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor', 'admin']));

-- RLS Policies pour control_documents
CREATE POLICY "Users can view all control documents" ON public.control_documents FOR SELECT USING (true);
CREATE POLICY "Users can upload control documents" ON public.control_documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Supervisors and admins can manage control documents" ON public.control_documents FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['supervisor', 'admin']));

-- RLS Policies pour control_comments
CREATE POLICY "Users can view all control comments" ON public.control_comments FOR SELECT USING (true);
CREATE POLICY "Users can add control comments" ON public.control_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own control comments" ON public.control_comments FOR UPDATE USING (auth.uid() = user_id);

-- Triggers pour updated_at
CREATE TRIGGER update_control_types_updated_at BEFORE UPDATE ON public.control_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_regulatory_controls_updated_at BEFORE UPDATE ON public.regulatory_controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques types de contrôles par défaut
INSERT INTO public.control_types (name, description, frequency_months, building_types, mandatory) VALUES
('Contrôle électrique', 'Vérification périodique des installations électriques', 12, ARRAY['bureau', 'industriel', 'ERP'], true),
('Contrôle sécurité incendie', 'Vérification des systèmes de sécurité incendie', 6, ARRAY['bureau', 'industriel', 'ERP'], true),
('Contrôle ascenseur', 'Contrôle technique des ascenseurs', 6, ARRAY['bureau', 'ERP'], true),
('Contrôle ventilation', 'Vérification des systèmes de ventilation', 12, ARRAY['bureau', 'industriel', 'ERP'], true),
('Contrôle chauffage', 'Maintenance et contrôle du système de chauffage', 12, ARRAY['bureau', 'industriel', 'ERP'], true),
('Contrôle légionellose', 'Analyse et prévention de la légionellose', 3, ARRAY['bureau', 'industriel', 'ERP'], true),
('Contrôle accessibilité', 'Vérification de l''accessibilité PMR', 24, ARRAY['ERP'], true);