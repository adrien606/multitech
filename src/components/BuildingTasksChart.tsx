import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

interface Task {
  id: string;
  building_id: string;
  building_name?: string;
  due_date: string;
  status: string;
}

interface Building {
  id: string;
  name: string;
}

interface BuildingTasksChartProps {
  tasks: Task[];
  buildings: Building[];
}

export function BuildingTasksChart({ tasks, buildings }: BuildingTasksChartProps) {
  // Calculer les données par bâtiment
  const chartData = buildings.map(building => {
    const buildingTasks = tasks.filter(task => task.building_id === building.id);

    return {
      name: building.name.length > 15 ? building.name.substring(0, 15) + '...' : building.name,
      fullName: building.name,
      interventions: buildingTasks.length,
    };
  }).filter(data => data.interventions > 0)
    .sort((a, b) => b.interventions - a.interventions);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Interventions par bâtiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune intervention à afficher.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-1">{data.fullName}</p>
          <p className="text-sm text-muted-foreground">
            Interventions: <span className="font-medium text-foreground">{data.interventions}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Interventions par bâtiment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="interventions" 
                name="Interventions" 
                fill="hsl(217, 35%, 45%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
