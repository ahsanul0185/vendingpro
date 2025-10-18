import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import type { Order } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function OrderTrack() {
  const { user } = useAuth();
  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: userOrders = [], isLoading: isLoadingUserOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderNumber.trim()) return;

    const order = userOrders.find(
      (o) => o.order_number.toLowerCase() === searchOrderNumber.toLowerCase()
    );
    
    if (order) {
      setSelectedOrder(order);
    } else {
      setSelectedOrder(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      processing: "secondary",
      paid: "default",
      failed: "destructive",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"} data-testid={`badge-status-${status}`}>
        {status}
      </Badge>
    );
  };

  const getStatusSteps = (status: string) => {
    const allSteps = ["pending", "paid", "processing", "completed"];
    const currentIndex = allSteps.indexOf(status);
    
    return allSteps.map((step, index) => ({
      label: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index <= currentIndex,
      active: step === status,
    }));
  };

  return (
    <div className="space-y-6" data-testid="order-track-page">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Track Order
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter your order number to track your order status
        </p>
      </div>

      {/* Search Order */}
      <Card>
        <CardHeader>
          <CardTitle>Search Order</CardTitle>
          <CardDescription>Enter your order number to track your order</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter order number (e.g., ORD-001)"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              data-testid="input-search-order"
            />
            <Button type="submit" data-testid="button-search-order">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Order Details */}
      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Details</span>
              {getStatusBadge(selectedOrder.status)}
            </CardTitle>
            <CardDescription>Order #{selectedOrder.order_number}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-semibold" data-testid="text-order-date">
                  {selectedOrder.created_at ? format(new Date(selectedOrder.created_at), "PPP") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-lg" data-testid="text-order-total">
                  ${selectedOrder.total_amount}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items Count</p>
                <p className="font-semibold" data-testid="text-items-count">
                  {selectedOrder.items_count} items
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold" data-testid="text-payment-method">
                  {selectedOrder.payment_method || "N/A"}
                </p>
              </div>
            </div>

            {/* Status Timeline */}
            <div>
              <p className="text-sm text-muted-foreground mb-4">Order Progress</p>
              <div className="flex items-center justify-between">
                {getStatusSteps(selectedOrder.status).map((step, index, array) => (
                  <div key={step.label} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {step.completed ? "✓" : index + 1}
                      </div>
                      <p
                        className={`text-xs mt-2 ${
                          step.active ? "font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    {index < array.length - 1 && (
                      <div
                        className={`h-1 flex-1 ${
                          step.completed ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Recent Orders (for logged in users) */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>My Recent Orders</CardTitle>
            <CardDescription>Your order history</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUserOrders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userOrders.length > 0 ? (
              <div className="space-y-3">
                {userOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedOrder(order);
                      setSearchOrderNumber(order.order_number);
                    }}
                    data-testid={`order-item-${order.order_number}`}
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.created_at ? format(new Date(order.created_at), "PP") : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total_amount}</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No orders found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
