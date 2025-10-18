import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

interface OrderDetailsDrawerProps {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailsDrawer({ order, onClose }: OrderDetailsDrawerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiRequest("PATCH", `/api/orders/${order.id}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

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

  const formatDateTime = (date: Date | null) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleString();
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md" data-testid="order-details-drawer">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg">Order Details</SheetTitle>
              <SheetDescription>#{order.order_number}</SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="close-order-details">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            <span className="text-sm text-muted-foreground">
              {formatDateTime(order.created_at)}
            </span>
          </div>

          {isAdmin && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Update Status</h3>
              <Select 
                value={order.status} 
                onValueChange={handleStatusChange}
                disabled={updateStatusMutation.isPending}
              >
                <SelectTrigger className="w-full" data-testid="order-status-select">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{order.items_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">{order.payment_method || "Not specified"}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          {order.customer_info && typeof order.customer_info === 'object' && (
            <>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(order.customer_info as Record<string, any>).map(([key, value]) => {
                    // Format address objects
                    if (value && typeof value === 'object' && 'address' in value) {
                      const addr = value as { address?: string; city?: string; state?: string; zip?: string; country?: string };
                      const formattedAddress = [
                        addr.address,
                        addr.city,
                        addr.state,
                        addr.zip,
                        addr.country
                      ].filter(Boolean).join(', ');
                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium text-foreground">{formattedAddress || 'N/A'}</span>
                        </div>
                      );
                    }
                    // Render primitive values normally
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{value?.toString() || 'N/A'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Order Total */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between font-semibold text-foreground">
                <span>Total Amount:</span>
                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Order Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="text-sm">
                  <p className="font-medium">Order Created</p>
                  <p className="text-muted-foreground">{formatDateTime(order.created_at)}</p>
                </div>
              </div>
              
              {order.updated_at !== order.created_at && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="text-sm">
                    <p className="font-medium">Status Updated</p>
                    <p className="text-muted-foreground">{formatDateTime(order.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
