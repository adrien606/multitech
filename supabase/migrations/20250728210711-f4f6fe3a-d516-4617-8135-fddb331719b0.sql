-- Ajouter le rôle admin à l'enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';