ALTER TABLE public.tasks ADD COLUMN priority integer NOT NULL DEFAULT 2;
CREATE INDEX idx_tasks_priority ON public.tasks(priority);