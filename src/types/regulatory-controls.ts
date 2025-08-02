// Interface pour un contrôle réglementaire
export interface RegulatoryControl {
  id: string;
  building_id: string;
  building_name?: string;
  control_type_id: string;
  control_type_name?: string;
  due_date: string;
  assigned_provider_id?: string;
  provider_name?: string;
  completed_date?: string;
  next_due_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
}

// Interface pour les statistiques
export interface ControlStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  upcoming: number;
}