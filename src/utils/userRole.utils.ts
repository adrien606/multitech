import { Shield, UserCheck, UserX, Users, Crown } from "lucide-react";

export type UserRole = 'admin' | 'facility_manager' | 'supervisor' | 'agent';

export const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive' as const;
    case 'facility_manager': return 'default' as const;
    case 'supervisor': return 'secondary' as const;
    case 'agent': return 'outline' as const;
    default: return 'secondary' as const;
  }
};

export const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin': return Shield;
    case 'facility_manager': return Crown;
    case 'supervisor': return UserCheck;
    case 'agent': return UserX;
    default: return Users;
  }
};

export const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrateur';
    case 'facility_manager': return 'Facility Manager';
    case 'supervisor': return 'Superviseur';
    case 'agent': return 'Agent';
    default: return 'Utilisateur';
  }
};

export const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case 'admin': return 'administrateur';
    case 'facility_manager': return 'facility manager';
    case 'supervisor': return 'superviseur';
    case 'agent': return 'agent';
  }
};

export const roleOptions = [
  { value: 'admin' as const, label: 'Admin', icon: Crown },
  { value: 'facility_manager' as const, label: 'Facility Manager', icon: Shield },
  { value: 'supervisor' as const, label: 'Superviseur', icon: UserCheck },
  { value: 'agent' as const, label: 'Agent', icon: UserX },
];