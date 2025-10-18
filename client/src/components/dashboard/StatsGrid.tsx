import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingCart, Activity, DollarSign, TrendingUp } from "lucide-react";

interface StatsGridProps {
  stats: any;
  isLoading: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-effect p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || "0",
      icon: Package,
      gradient: "from-blue-500 to-blue-600",
      badge: "+12%",
      badgeVariant: "secondary" as const,
      trend: "12% increase from last month",
      testId: "stat-products",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || "0",
      icon: ShoppingCart,
      gradient: "from-purple-500 to-purple-600",
      badge: `Pending: ${stats?.pendingOrders || "0"}`,
      badgeVariant: "outline" as const,
      trend: "8% increase from last week",
      testId: "stat-orders",
    },
    {
      title: "Active Machines",
      value: `${stats?.activeMachines || "0"}/${stats?.totalMachines || "0"}`,
      icon: Activity,
      gradient: "from-green-500 to-green-600",
      badge: `Online: ${stats?.activeMachines || "0"}`,
      badgeVariant: "secondary" as const,
      trend: `${((stats?.activeMachines / stats?.totalMachines) * 100).toFixed(1) || "0"}% uptime`,
      testId: "stat-machines",
    },
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      gradient: "from-orange-500 to-orange-600",
      badge: "+24%",
      badgeVariant: "secondary" as const,
      trend: "24% increase from last month",
      testId: "stat-revenue",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="glass-effect hover-lift rounded-xl p-6 shadow-xl"
            data-testid={stat.testId}
          >
            <CardContent className="p-0">
              <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <Badge variant={stat.badgeVariant}>{stat.badge}</Badge>
              </div>
              <h3 className="mb-1 text-2xl font-bold text-foreground" data-testid={`${stat.testId}-value`}>
                {stat.value}
              </h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
