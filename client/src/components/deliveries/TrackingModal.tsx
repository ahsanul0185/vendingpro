import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck, Package, User, Clock, CheckCircle } from "lucide-react";
import type { Delivery } from "@shared/schema";

interface TrackingModalProps {
  delivery: Delivery;
  onClose: () => void;
}

export default function TrackingModal({ delivery, onClose }: TrackingModalProps) {
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

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Not scheduled";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleString();
  };

  const getItemsArray = (items: any) => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === 'object') {
      return Object.entries(items).map(([key, value]) => ({
        name: key,
        quantity: value
      }));
    }
    return [];
  };

  const getTrackingInfo = (tracking: any) => {
    if (!tracking || typeof tracking !== 'object') return null;
    return tracking;
  };

  const trackingInfo = getTrackingInfo(delivery.tracking_info);
  const itemsArray = getItemsArray(delivery.items);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="tracking-modal">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">Delivery Tracking</DialogTitle>
              <DialogDescription>#{delivery.delivery_number}</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(delivery.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delivery Summary */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Delivery Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Driver:</span>
                  <p className="font-medium">{delivery.driver_name || "Not assigned"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Scheduled:</span>
                  <p className="font-medium">{formatDateTime(delivery.delivery_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Items:</span>
                  <p className="font-medium">{itemsArray.length} items</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Items List */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Delivery Items</h3>
            <div className="max-h-32 space-y-2 overflow-y-auto">
              {itemsArray.length > 0 ? (
                itemsArray.map((item, index) => (
                  <div key={index} className="flex justify-between rounded-lg bg-muted/30 p-2 text-sm">
                    <span className="text-foreground">{item.name || `Item ${index + 1}`}</span>
                    <span className="text-muted-foreground">
                      Qty: {item.quantity || 1}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No items specified</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Tracking Timeline */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Tracking Timeline</h3>
            <div className="space-y-3">
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="text-sm">
                  <p className="font-medium">Delivery Scheduled</p>
                  <p className="text-muted-foreground">{formatDateTime(delivery.created_at)}</p>
                </div>
              </div>

              {/* In Transit */}
              {delivery.status !== "pending" && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-orange-500"></div>
                  <div className="text-sm">
                    <p className="font-medium">Out for Delivery</p>
                    <p className="text-muted-foreground">
                      {trackingInfo?.started_at ? formatDateTime(trackingInfo.started_at) : "Status updated"}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivered */}
              {delivery.status === "delivered" && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="text-sm">
                    <p className="font-medium">Delivered</p>
                    <p className="text-muted-foreground">
                      {trackingInfo?.delivered_at ? formatDateTime(trackingInfo.delivered_at) : formatDateTime(delivery.updated_at)}
                    </p>
                  </div>
                </div>
              )}

              {/* Cancelled */}
              {delivery.status === "cancelled" && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-red-500"></div>
                  <div className="text-sm">
                    <p className="font-medium">Delivery Cancelled</p>
                    <p className="text-muted-foreground">{formatDateTime(delivery.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {delivery.notes && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Notes</h3>
                <p className="text-sm text-muted-foreground">{delivery.notes}</p>
              </div>
            </>
          )}

          {/* Additional Tracking Info */}
          {trackingInfo && Object.keys(trackingInfo).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Additional Information</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(trackingInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} data-testid="close-tracking-modal">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
