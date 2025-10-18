import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, ShoppingCart, Calendar } from "lucide-react";
import OrderDetailsDrawer from "./OrderDetailsDrawer";
import AssemblyScheduleDialog from "./AssemblyScheduleDialog";
import type { Order } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
}

export default function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assemblyOrder, setAssemblyOrder] = useState<Order | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  if (isLoading) {
    return (
      <Card className="glass-effect overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Transfer ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assembly</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "outline", 
      paid: "secondary",
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

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return dateObj.toLocaleDateString();
  };

  if (orders.length === 0) {
    return (
      <Card className="glass-effect p-12">
        <div className="text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No orders found</h3>
          <p className="text-muted-foreground">Orders will appear here when customers make purchases.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-effect overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Order ID
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Items
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Total
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Payment
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Transfer ID
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Assembly
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="transition-colors hover:bg-muted/30"
                  data-testid={`order-row-${order.order_number}`}
                >
                  <TableCell className="px-6 py-4">
                    <span className="font-semibold text-foreground">
                      #{order.order_number}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {order.items_count} items
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="font-semibold text-foreground">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {order.payment_method ? (
                      <span className="capitalize">
                        {order.payment_method.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">Not set</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm">
                    {order.payment_transfer_id ? (
                      <span className="font-mono text-xs">{order.payment_transfer_id}</span>
                    ) : (
                      <span className="text-muted-foreground/50">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm">
                    {order.assembly_scheduled_date ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                          {new Date(order.assembly_scheduled_date).toLocaleDateString()}
                        </span>
                        {order.assembly_status && (
                          <Badge variant={order.assembly_status === 'completed' ? 'default' : 'secondary'} className="w-fit">
                            {order.assembly_status}
                          </Badge>
                        )}
                      </div>
                    ) : isAdmin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssemblyOrder(order)}
                        data-testid={`schedule-assembly-${order.order_number}`}
                      >
                        <Calendar className="mr-1 h-3 w-3" />
                        Schedule
                      </Button>
                    ) : (
                      <span className="text-muted-foreground/50">Not scheduled</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                        data-testid={`view-order-${order.order_number}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && order.assembly_scheduled_date && order.assembly_status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAssemblyOrder(order)}
                          data-testid={`update-assembly-${order.order_number}`}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {assemblyOrder && (
        <AssemblyScheduleDialog
          order={assemblyOrder}
          onClose={() => setAssemblyOrder(null)}
        />
      )}
    </>
  );
}
