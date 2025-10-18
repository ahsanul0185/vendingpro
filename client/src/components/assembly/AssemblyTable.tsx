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
import { MoreVertical, Wrench } from "lucide-react";
import type { Assembly } from "@shared/schema";

interface AssemblyTableProps {
  assemblies: Assembly[];
  isLoading: boolean;
  onEdit: (assembly: Assembly) => void;
}

export default function AssemblyTable({ assemblies, isLoading, onEdit }: AssemblyTableProps) {
  if (isLoading) {
    return (
      <Card className="glass-effect overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Est. Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
      in_progress: "secondary",
      completed: "default", 
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "outline",
      normal: "secondary",
      high: "destructive",
      urgent: "destructive",
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "outline"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const formatEstimatedTime = (minutes: number | null) => {
    if (!minutes) return "Not set";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  };

  if (assemblies.length === 0) {
    return (
      <Card className="glass-effect p-12">
        <div className="text-center">
          <Wrench className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No assembly tasks</h3>
          <p className="text-muted-foreground">Assembly tasks will appear here when created.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-effect overflow-hidden" data-testid="assembly-table">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Task Name
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Type
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Priority
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Assigned To
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Est. Time
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Created
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {assemblies.map((assembly) => (
              <TableRow
                key={assembly.id}
                className="transition-colors hover:bg-muted/30"
                data-testid={`assembly-row-${assembly.id}`}
              >
                <TableCell className="px-6 py-4">
                  <div>
                    <span className="font-semibold text-foreground">{assembly.name}</span>
                    {assembly.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {assembly.notes}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-foreground capitalize">
                    {assembly.type.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getPriorityBadge(assembly.priority)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getStatusBadge(assembly.status)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">
                  {assembly.assigned_to || "Unassigned"}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {formatEstimatedTime(assembly.estimated_time)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDate(assembly.created_at)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(assembly)}
                    data-testid={`edit-assembly-${assembly.id}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
