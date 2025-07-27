import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building } from "@/types";
import { Building as BuildingIcon } from "lucide-react";

interface BuildingSelectorProps {
  buildings: Building[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function BuildingSelector({ 
  buildings, 
  value, 
  onValueChange, 
  placeholder = "Sélectionner un bâtiment" 
}: BuildingSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <BuildingIcon className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {buildings.map((building) => (
          <SelectItem key={building.id} value={building.id}>
            <div className="flex flex-col">
              <span className="font-medium">{building.name}</span>
              <span className="text-xs text-muted-foreground">{building.address}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}