-- Ajouter une colonne pour l'année du document
ALTER TABLE public.control_documents 
ADD COLUMN document_year integer;

-- Ajouter un index pour améliorer les recherches par année
CREATE INDEX idx_control_documents_year ON public.control_documents(document_year);