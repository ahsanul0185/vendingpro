import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download } from "lucide-react";
import DeliveriesTable from "@/components/deliveries/DeliveriesTable";
import DeliveryFilters from "@/components/deliveries/DeliveryFilters";
import TrackingModal from "@/components/deliveries/TrackingModal";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Delivery } from "@shared/schema";

export default function Deliveries() {
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateRange: "all",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deliveries = [], isLoading } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
  });

  const updateDeliveryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/deliveries/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Success",
        description: "Delivery updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update delivery",
        variant: "destructive",
      });
    },
  });

  const deliveryStats = {
    total: deliveries?.length || 0,
    pending: deliveries?.filter((d: Delivery) => d.status === "pending").length || 0,
    in_transit: deliveries?.filter((d: Delivery) => d.status === "in_transit").length || 0,
    delivered: deliveries?.filter((d: Delivery) => d.status === "delivered").length || 0,
    cancelled: deliveries?.filter((d: Delivery) => d.status === "cancelled").length || 0,
  };

  const handleStatusUpdate = (deliveryId: string, status: string) => {
    updateDeliveryMutation.mutate({
      id: deliveryId,
      data: { status }
    });
  };

  // Apply filters
  const filteredDeliveries = deliveries?.filter((delivery: Delivery) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !delivery.delivery_number.toLowerCase().includes(searchLower) &&
        !(delivery.driver_name && delivery.driver_name.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }
    // Status filter
    if (filters.status !== "all" && delivery.status !== filters.status) {
      return false;
    }
    // Date range filter
    if (filters.dateRange !== "all" && delivery.delivery_date) {
      const deliveryDate = new Date(delivery.delivery_date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (filters.dateRange === "today" && deliveryDate < today) {
        return false;
      }
      if (filters.dateRange === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        if (deliveryDate < weekAgo) {
          return false;
        }
      }
      if (filters.dateRange === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        if (deliveryDate < monthAgo) {
          return false;
        }
      }
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-foreground">Deliveries</h2>
          <p className="text-muted-foreground">Track and manage inventory deliveries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="export-deliveries-button">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button data-testid="schedule-delivery-button">
            <PlusCircle className="mr-2 h-4 w-4" />
            Schedule Delivery
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">Total Deliveries</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="total-deliveries-stat">
              {deliveryStats.total}
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
            <p className="text-2xl font-bold text-foreground" data-testid="pending-deliveries-stat">
              {deliveryStats.pending}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">In Transit</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="in-transit-deliveries-stat">
              {deliveryStats.in_transit}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-muted-foreground">Delivered</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="delivered-deliveries-stat">
              {deliveryStats.delivered}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <DeliveryFilters filters={filters} onFiltersChange={setFilters} />

      {/* Deliveries Table */}
      <DeliveriesTable 
        deliveries={filteredDeliveries} 
        isLoading={isLoading}
        onTrackDelivery={setSelectedDelivery}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Tracking Modal */}
      {selectedDelivery && (
        <TrackingModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
        />
      )}
    </div>
  );
}
