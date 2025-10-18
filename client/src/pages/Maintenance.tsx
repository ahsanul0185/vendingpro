import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import MaintenanceTable from "@/components/maintenance/MaintenanceTable";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Wrench, CheckCircle, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MaintenanceRecord, InsertMaintenanceRecord } from "@shared/schema";

export default function Maintenance() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: maintenanceRecords = [], isLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMaintenanceRecord) => {
      const response = await apiRequest("POST", "/api/maintenance", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      setShowForm(false);
      toast({
        title: "Success",
        description: "Maintenance record created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create maintenance record",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertMaintenanceRecord }) => {
      const response = await apiRequest("PUT", `/api/maintenance/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      setShowForm(false);
      setEditingRecord(null);
      toast({
        title: "Success",
        description: "Maintenance record updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update maintenance record",
        variant: "destructive",
      });
    },
  });

  const maintenanceStats = {
    total: maintenanceRecords?.length || 0,
    scheduled: maintenanceRecords?.filter((r: MaintenanceRecord) => r.status === "scheduled").length || 0,
    in_progress: maintenanceRecords?.filter((r: MaintenanceRecord) => r.status === "in_progress").length || 0,
    completed: maintenanceRecords?.filter((r: MaintenanceRecord) => r.status === "completed").length || 0,
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleSubmit = (data: InsertMaintenanceRecord) => {
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-foreground">Maintenance</h2>
          <p className="text-muted-foreground">Schedule and track maintenance activities</p>
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="schedule-maintenance-button">
          <PlusCircle className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">Total Records</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="total-maintenance-stat">
              {maintenanceStats.total}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm text-muted-foreground">Scheduled</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="scheduled-maintenance-stat">
              {maintenanceStats.scheduled}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="in-progress-maintenance-stat">
              {maintenanceStats.in_progress}
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
            <p className="text-2xl font-bold text-foreground" data-testid="completed-maintenance-stat">
              {maintenanceStats.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Table */}
      <MaintenanceTable 
        records={maintenanceRecords || []} 
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      {/* Maintenance Form Modal */}
      {showForm && (
        <MaintenanceForm
          record={editingRecord}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
