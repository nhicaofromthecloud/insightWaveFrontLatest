import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend ? (
          <p
            className={cn(
              'text-xs',
              trend.value === 0
                ? 'text-muted-foreground'
                : trend.isPositive
                ? 'text-green-600'
                : 'text-red-600'
            )}
          >
            {trend.value === 0
              ? 'No change'
              : `${trend.value > 0 ? '+' : ''}${trend.value.toFixed(
                  1
                )}% ${subtitle}`}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
