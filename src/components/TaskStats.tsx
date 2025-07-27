import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types";
import { Clock, Play, CheckCircle, AlertCircle } from "lucide-react";

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    progress: tasks.filter(t => t.status === 'progress').length,
    validated: tasks.filter(t => t.status === 'validated').length,
    overdue: tasks.filter(t => new Date() > t.dueDate && t.status !== 'validated').length,
  };

  const statCards = [
    {
      title: "En attente",
      value: stats.pending,
      icon: Clock,
      color: "text-status-pending",
      bgColor: "bg-status-pending/10",
    },
    {
      title: "En cours",
      value: stats.progress,
      icon: Play,
      color: "text-status-progress",
      bgColor: "bg-status-progress/10",
    },
    {
      title: "Validées",
      value: stats.validated,
      icon: CheckCircle,
      color: "text-status-validated",
      bgColor: "bg-status-validated/10",
    },
    {
      title: "En retard",
      value: stats.overdue,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}