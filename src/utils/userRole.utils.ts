import { Shield, UserCheck, UserX, Users, Crown } from "lucide-react";

export type UserRole = 'admin' | 'supervisor' | 'agent';

export const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive' as const;
    case 'supervisor': return 'default' as const;
    case 'agent': return 'secondary' as const;
    default: return 'secondary' as const;
  }
};

export const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin': return Shield;
    case 'supervisor': return UserCheck;
    case 'agent': return UserX;
    default: return Users;
  }
};

export const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrateur';
    case 'supervisor': return 'Superviseur';
    case 'agent': return 'Agent';
    default: return 'Utilisateur';
  }
};

export const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case 'admin': return 'administrateur';
    case 'supervisor': return 'superviseur';
    case 'agent': return 'agent';
  }
};

export const roleOptions = [
  { value: 'admin' as const, label: 'Admin', icon: Crown },
  { value: 'supervisor' as const, label: 'Superviseur', icon: Shield },
  { value: 'agent' as const, label: 'Agent', icon: UserCheck },
];