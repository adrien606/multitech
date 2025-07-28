import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Settings } from "lucide-react";
import { UserRole, roleOptions } from "@/utils/userRole.utils";

interface UserRoleSelectorProps {
  value: UserRole;
  onValueChange: (newRole: UserRole) => void;
}

export function UserRoleSelector({ value, onValueChange }: UserRoleSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-32 h-8">
        <Settings className="w-3 h-3" />
      </SelectTrigger>
      <SelectContent>
        {roleOptions.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Icon className="w-3 h-3" />
                {option.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}