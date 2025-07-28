import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserStatsCardProps {
  title: string;
  value: number;
  variant?: 'default' | 'destructive' | 'primary' | 'muted';
}

export function UserStatsCard({ title, value, variant = 'default' }: UserStatsCardProps) {
  const getTextColor = () => {
    switch (variant) {
      case 'destructive': return 'text-destructive';
      case 'primary': return 'text-primary';
      case 'muted': return 'text-muted-foreground';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getTextColor()}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}