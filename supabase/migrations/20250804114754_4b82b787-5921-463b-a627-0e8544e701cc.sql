-- Ajouter une colonne pour la refacturation client dans la table buildings
ALTER TABLE public.buildings 
ADD COLUMN client_billing_enabled boolean NOT NULL DEFAULT false;

-- Créer un index pour améliorer les performances des requêtes sur cette colonne
CREATE INDEX idx_buildings_client_billing ON public.buildings(client_billing_enabled);