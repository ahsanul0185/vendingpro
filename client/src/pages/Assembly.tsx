import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AssemblyTable from "@/components/assembly/AssemblyTable";
import AssemblyFilters from "@/components/assembly/AssemblyFilters";
import AssemblyForm from "@/components/assembly/AssemblyForm";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Wrench, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Assembly, InsertAssembly } from "@shared/schema";

export default function Assembly() {
  const [showForm, setShowForm] = useState(false);
  const [editingAssembly, setEditingAssembly] = useState<Assembly | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    priority: "all",
  });
  const { toast} = useToast();
  const queryClient = useQueryClient();

  const { data: assemblies = [], isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAssembly) => {
      const response = await apiRequest("POST", "/api/assemblies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      setShowForm(false);
      toast({
        title: "Success",
        description: "Assembly created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create assembly",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertAssembly }) => {
      const response = await apiRequest("PUT", `/api/assemblies/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      setShowForm(false);
      setEditingAssembly(null);
      toast({
        title: "Success",
        description: "Assembly updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update assembly",
        variant: "destructive",
      });
    },
  });

  const assemblyStats = {
    total: assemblies?.length || 0,
    pending: assemblies?.filter((a: Assembly) => a.status === "pending").length || 0,
    in_progress: assemblies?.filter((a: Assembly) => a.status === "in_progress").length || 0,
    completed: assemblies?.filter((a: Assembly) => a.status === "completed").length || 0,
  };

  const handleEdit = (assembly: Assembly) => {
    setEditingAssembly(assembly);
    setShowForm(true);
  };

  const handleSubmit = (data: InsertAssembly) => {
    if (editingAssembly) {
      updateMutation.mutate({ id: editingAssembly.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Apply filters
  const filteredAssemblies = assemblies?.filter((assembly: Assembly) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !assembly.name.toLowerCase().includes(searchLower) &&
        !(assembly.assigned_to && assembly.assigned_to.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }
    // Type filter
    if (filters.type !== "all" && assembly.type !== filters.type) {
      return false;
    }
    // Status filter
    if (filters.status !== "all" && assembly.status !== filters.status) {
      return false;
    }
    // Priority filter
    if (filters.priority !== "all" && assembly.priority !== filters.priority) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-foreground">Assembly</h2>
          <p className="text-muted-foreground">Manage vending machine component assembly</p>
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="create-assembly-button">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Assembly Task
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
              <span className="text-sm text-muted-foreground">Total Tasks</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="total-assemblies-stat">
              {assemblyStats.total}
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
            <p className="text-2xl font-bold text-foreground" data-testid="pending-assemblies-stat">
              {assemblyStats.pending}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="in-progress-assemblies-stat">
              {assemblyStats.in_progress}
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
            <p className="text-2xl font-bold text-foreground" data-testid="completed-assemblies-stat">
              {assemblyStats.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AssemblyFilters filters={filters} onFiltersChange={setFilters} />

      {/* Assembly Table */}
      <AssemblyTable 
        assemblies={filteredAssemblies} 
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      {/* Assembly Form Modal */}
      {showForm && (
        <AssemblyForm
          assembly={editingAssembly}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAssembly(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
