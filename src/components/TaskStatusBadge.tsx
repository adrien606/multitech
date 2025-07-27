import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types";
import { Clock, Play, CheckCircle } from "lucide-react";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "En attente",
    icon: Clock,
    variant: "pending" as const,
  },
  progress: {
    label: "En cours",
    icon: Play,
    variant: "progress" as const,
  },
  validated: {
    label: "Validée",
    icon: CheckCircle,
    variant: "validated" as const,
  },
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}