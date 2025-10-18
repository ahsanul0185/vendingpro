import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

interface AssemblyScheduleDialogProps {
  order: Order;
  onClose: () => void;
}

export default function AssemblyScheduleDialog({ order, onClose }: AssemblyScheduleDialogProps) {
  const [assemblyDate, setAssemblyDate] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (order.assembly_scheduled_date) {
      const date = new Date(order.assembly_scheduled_date);
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
      setAssemblyDate(localDate);
    }
  }, [order]);

  const scheduleAssemblyMutation = useMutation({
    mutationFn: async (date: string) => {
      const response = await apiRequest("POST", `/api/orders/${order.id}/assembly`, {
        assembly_scheduled_date: new Date(date).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Assembly scheduled successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule assembly",
        variant: "destructive",
      });
    },
  });

  const updateAssemblyStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PATCH", `/api/orders/${order.id}/assembly`, {
        assembly_status: status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Assembly status updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update assembly status",
        variant: "destructive",
      });
    },
  });

  const handleSchedule = () => {
    if (!assemblyDate) {
      toast({
        title: "Error",
        description: "Please select an assembly date",
        variant: "destructive",
      });
      return;
    }
    scheduleAssemblyMutation.mutate(assemblyDate);
  };

  const handleComplete = () => {
    updateAssemblyStatusMutation.mutate("completed");
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="assembly-schedule-dialog">
        <DialogHeader>
          <DialogTitle>Assembly Schedule</DialogTitle>
          <DialogDescription>
            Schedule or update assembly for order #{order.order_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Order Details</Label>
            <div className="rounded-lg border p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-medium">#{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
              {order.assembly_status && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge variant={order.assembly_status === 'completed' ? 'default' : 'secondary'}>
                    {order.assembly_status}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assembly-date">Assembly Date</Label>
            <Input
              id="assembly-date"
              type="date"
              value={assemblyDate}
              onChange={(e) => setAssemblyDate(e.target.value)}
              data-testid="assembly-date-input"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="assembly-dialog-cancel"
          >
            Cancel
          </Button>
          {order.assembly_scheduled_date && order.assembly_status !== 'completed' && (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={updateAssemblyStatusMutation.isPending}
              data-testid="assembly-complete-button"
            >
              {updateAssemblyStatusMutation.isPending ? "Updating..." : "Mark as Completed"}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSchedule}
            disabled={scheduleAssemblyMutation.isPending}
            data-testid="assembly-schedule-button"
          >
            {scheduleAssemblyMutation.isPending ? "Scheduling..." : order.assembly_scheduled_date ? "Update Schedule" : "Schedule Assembly"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
