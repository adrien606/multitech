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
  const now = new Date();

  // Calculer les données par bâtiment
  const chartData = buildings.map(building => {
    const buildingTasks = tasks.filter(task => task.building_id === building.id);
    
    const pastTasks = buildingTasks.filter(task => task.status !== 'pending' && task.status !== 'validation_requested');
    const futureTasks = buildingTasks.filter(task => task.status === 'pending');
    const validationTasks = buildingTasks.filter(task => task.status === 'validation_requested');

    return {
      name: building.name.length > 15 ? building.name.substring(0, 15) + '...' : building.name,
      fullName: building.name,
      passées: pastTasks.length,
      futures: futureTasks.length,
      validation: validationTasks.length,
      total: buildingTasks.length,
    };
  }).filter(data => data.total > 0)
    .sort((a, b) => b.total - a.total);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{data.fullName}</p>
          <div className="space-y-1 text-sm">
             <p className="text-muted-foreground">
               <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(var(--chart-past))' }}></span>
               Passées: <span className="font-medium text-foreground">{data.passées}</span>
             </p>
             <p className="text-muted-foreground">
               <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(var(--status-validation-requested))' }}></span>
               En attente de validation: <span className="font-medium text-foreground">{data.validation}</span>
             </p>
             <p className="text-muted-foreground">
               <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(var(--chart-future))' }}></span>
               Futures: <span className="font-medium text-foreground">{data.futures}</span>
             </p>
             <p className="text-muted-foreground border-t border-border pt-1 mt-1">
               Total: <span className="font-medium text-foreground">{data.total}</span>
             </p>
          </div>
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
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar 
                dataKey="passées" 
                name="Passées" 
                fill="hsl(215, 15%, 55%)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="futures" 
                name="Futures" 
                fill="hsl(142, 70%, 45%)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="validation" 
                name="Attente validation" 
                fill="hsl(280, 60%, 55%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
