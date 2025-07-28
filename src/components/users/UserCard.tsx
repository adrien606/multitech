import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserProfile } from "@/hooks/useUserProfiles";
import { UserRole, getRoleIcon, getRoleBadgeVariant, getRoleLabel } from "@/utils/userRole.utils";
import { UserRoleSelector } from "./UserRoleSelector";
import { UserDeleteDialog } from "./UserDeleteDialog";

interface UserCardProps {
  profile: UserProfile;
  currentUserRole: UserRole;
  onRoleChange: (userId: string, newRole: UserRole, userName: string) => void;
  onDelete: (userId: string, userName: string) => void;
  isDeleting: boolean;
}

export function UserCard({ 
  profile, 
  currentUserRole, 
  onRoleChange, 
  onDelete, 
  isDeleting 
}: UserCardProps) {
  const RoleIcon = getRoleIcon(profile.role);
  const isAdmin = currentUserRole === 'admin';

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <RoleIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">{profile.full_name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Inscrit le {format(new Date(profile.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={getRoleBadgeVariant(profile.role)} 
              className="min-w-[100px] justify-center"
            >
              {getRoleLabel(profile.role)}
            </Badge>
            
            {isAdmin && (
              <div className="flex items-center gap-1">
                <UserRoleSelector
                  value={profile.role}
                  onValueChange={(newRole) => onRoleChange(profile.user_id, newRole, profile.full_name)}
                />
                
                <UserDeleteDialog
                  userName={profile.full_name}
                  onConfirm={() => onDelete(profile.user_id, profile.full_name)}
                  disabled={isDeleting}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}