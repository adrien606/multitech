// Types pour compatibilité avec les anciens composants
export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  createdAt: Date;
  isActive: boolean;
}