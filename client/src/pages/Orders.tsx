import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import OrdersTable from "@/components/orders/OrdersTable";
import OrderFilters from "@/components/orders/OrderFilters";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, ShoppingCart } from "lucide-react";
import type { Order } from "@shared/schema";

export default function Orders() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateRange: "all",
    payment: "all",
  });

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Apply filters
  const filteredOrders = orders?.filter((order: Order) => {
    // Search filter
    if (filters.search && !order.order_number.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    // Status filter
    if (filters.status !== "all" && order.status !== filters.status) {
      return false;
    }
    // Date range filter
    if (filters.dateRange !== "all" && order.created_at) {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (filters.dateRange === "today" && orderDate < today) {
        return false;
      }
      if (filters.dateRange === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        if (orderDate < weekAgo) {
          return false;
        }
      }
      if (filters.dateRange === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        if (orderDate < monthAgo) {
          return false;
        }
      }
    }
    // Payment method filter
    if (filters.payment !== "all") {
      const customerInfo = order.customer_info as any;
      if (!customerInfo?.payment_method || customerInfo.payment_method !== filters.payment) {
        return false;
      }
    }
    return true;
  }) || [];

  const orderStats = {
    total: orders?.length || 0,
    completed: orders?.filter((o: any) => o.status === "completed").length || 0,
    pending: orders?.filter((o: any) => o.status === "pending").length || 0,
    failed: orders?.filter((o: any) => o.status === "failed").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-foreground">Orders</h2>
          <p className="text-muted-foreground">Track and manage all vending machine transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="export-orders-button">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button data-testid="filter-orders-button">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">Total Orders</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="total-orders-stat">
              {orderStats.total}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="completed-orders-stat">
              {orderStats.completed}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="pending-orders-stat">
              {orderStats.pending}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm text-muted-foreground">Failed</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="failed-orders-stat">
              {orderStats.failed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <OrderFilters filters={filters} onFiltersChange={setFilters} />

      {/* Orders Table */}
      <OrdersTable orders={filteredOrders} isLoading={isLoading} />
    </div>
  );
}
