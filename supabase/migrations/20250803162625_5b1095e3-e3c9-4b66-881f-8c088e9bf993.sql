-- Add foreign key constraint between control_documents and regulatory_controls
ALTER TABLE public.control_documents 
ADD CONSTRAINT fk_control_documents_regulatory_control 
FOREIGN KEY (regulatory_control_id) 
REFERENCES public.regulatory_controls(id) 
ON DELETE CASCADE;