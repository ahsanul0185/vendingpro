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
import { Eye, MapPin, Truck } from "lucide-react";
import type { Delivery } from "@shared/schema";

interface DeliveriesTableProps {
  deliveries: Delivery[];
  isLoading: boolean;
  onTrackDelivery: (delivery: Delivery) => void;
  onStatusUpdate: (id: string, status: string) => void;
}

export default function DeliveriesTable({ 
  deliveries, 
  isLoading, 
  onTrackDelivery, 
  onStatusUpdate 
}: DeliveriesTableProps) {
  if (isLoading) {
    return (
      <Card className="glass-effect overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery #</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
      pending: "outline",
      in_transit: "secondary",
      delivered: "default",
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not scheduled";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleString();
  };

  const getItemsCount = (items: any) => {
    if (!items || typeof items !== 'object') return 0;
    if (Array.isArray(items)) return items.length;
    return Object.keys(items).length;
  };

  if (deliveries.length === 0) {
    return (
      <Card className="glass-effect p-12">
        <div className="text-center">
          <Truck className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No deliveries scheduled</h3>
          <p className="text-muted-foreground">Deliveries will appear here when scheduled.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-effect overflow-hidden" data-testid="deliveries-table">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Delivery #
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Items
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Driver
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Scheduled
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {deliveries.map((delivery) => (
              <TableRow
                key={delivery.id}
                className="transition-colors hover:bg-muted/30"
                data-testid={`delivery-row-${delivery.delivery_number}`}
              >
                <TableCell className="px-6 py-4">
                  <span className="font-semibold text-foreground">
                    #{delivery.delivery_number}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {getItemsCount(delivery.items)} items
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getStatusBadge(delivery.status)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">
                  {delivery.driver_name || "Not assigned"}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDate(delivery.delivery_date)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onTrackDelivery(delivery)}
                      data-testid={`track-delivery-${delivery.delivery_number}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {delivery.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStatusUpdate(delivery.id, "in_transit")}
                        data-testid={`start-delivery-${delivery.delivery_number}`}
                      >
                        Start
                      </Button>
                    )}
                    {delivery.status === "in_transit" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStatusUpdate(delivery.id, "delivered")}
                        data-testid={`complete-delivery-${delivery.delivery_number}`}
                      >
                        Complete
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
  );
}
