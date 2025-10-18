import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { List, Grid, PackageCheck, MapPin, User, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Monitoring() {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: deliveredOrders = [], isLoading: isLoadingDelivered } = useQuery<any[]>({
    queryKey: ["/api/monitoring/delivered"],
    enabled: isAdmin,
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <PackageCheck className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Admin Access Required</h3>
        <p className="text-muted-foreground">This page is only accessible to administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <PackageCheck className="h-8 w-8 text-foreground" />
            <h2 className="text-3xl font-bold text-foreground">Successfully Delivered Orders</h2>
          </div>
          <p className="text-muted-foreground">Track and monitor all successfully delivered orders</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            onClick={() => setViewMode("card")}
            data-testid="card-view-button"
          >
            <Grid className="mr-2 h-4 w-4" />
            Card View
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            data-testid="list-view-button"
          >
            <List className="mr-2 h-4 w-4" />
            List View
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "card" ? (
        // Card View
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingDelivered ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass-effect">
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))
          ) : deliveredOrders.length > 0 ? (
            deliveredOrders.map((order) => (
              <Card key={order.order_id} className="glass-effect hover-lift" data-testid={`delivered-order-card-${order.order_number}`}>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="text-xl font-bold text-foreground">#{order.order_number}</p>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      <PackageCheck className="mr-1 h-3 w-3" />
                      Delivered
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{order.username || 'Guest'}</p>
                        <p className="text-xs text-muted-foreground">{order.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{order.machine_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{order.machine_location || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Items</p>
                      <p className="text-sm font-medium">{order.items_count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold text-foreground">${parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
              <PackageCheck className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No delivered orders yet</h3>
              <p className="text-muted-foreground">Delivered orders will appear here when completed.</p>
            </div>
          )}
        </div>
      ) : (
        // List View
        <Card className="glass-effect overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6 py-4 text-xs font-semibold uppercase">Order ID</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold uppercase">Customer</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold uppercase">Machine</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold uppercase">Items</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold uppercase">Total</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold uppercase">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {isLoadingDelivered ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : deliveredOrders.length > 0 ? (
                  deliveredOrders.map((order) => (
                    <TableRow key={order.order_id} data-testid={`delivered-order-list-${order.order_number}`}>
                      <TableCell className="px-6 py-4 font-semibold">#{order.order_number}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.username || 'Guest'}</p>
                          <p className="text-sm text-muted-foreground">{order.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.machine_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{order.machine_location || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">{order.items_count} items</TableCell>
                      <TableCell className="px-6 py-4 font-semibold">${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <p className="text-muted-foreground">No delivered orders yet</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
