import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import type { Order } from "@shared/schema";

interface RecentOrdersProps {
  orders: Order[];
  isLoading: boolean;
}

export default function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card className="glass-effect border-0 shadow-xl">
        <CardHeader className="pb-4">
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentOrders = orders?.slice(0, 4) || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "outline",
      processing: "secondary",
      failed: "destructive",
      cancelled: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return dateObj.toLocaleDateString();
  };

  return (
    <Card className="glass-effect border-0 shadow-xl" data-testid="recent-orders-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Recent Orders</h3>
            <p className="text-xs text-muted-foreground">Latest transactions</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      {recentOrders.length === 0 ? (
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent orders found</p>
          </div>
        </CardContent>
      ) : (
        <>
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 transition-colors hover:bg-muted/30"
                data-testid={`order-${order.order_number}`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      #{order.order_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items_count} items
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(order.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-4">
            <Button variant="outline" className="w-full" data-testid="view-all-orders-button">
              View All Orders
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
