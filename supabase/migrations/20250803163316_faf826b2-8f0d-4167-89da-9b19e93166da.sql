-- Créer le bucket control-documents s'il n'existe pas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('control-documents', 'control-documents', true)
ON CONFLICT (id) DO NOTHING;