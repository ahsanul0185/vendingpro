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
import type { MaintenanceRecord } from "@shared/schema";

interface MaintenanceTableProps {
  records: MaintenanceRecord[];
  isLoading: boolean;
  onEdit: (record: MaintenanceRecord) => void;
}

export default function MaintenanceTable({ records, isLoading, onEdit }: MaintenanceTableProps) {
  if (isLoading) {
    return (
      <Card className="glass-effect overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
      scheduled: "outline",
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

  const formatDateTime = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return dateObj.toLocaleString();
  };

  if (records.length === 0) {
    return (
      <Card className="glass-effect p-12">
        <div className="text-center">
          <Wrench className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No maintenance records</h3>
          <p className="text-muted-foreground">Maintenance records will appear here when scheduled.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-effect overflow-hidden" data-testid="maintenance-table">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
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
                Scheduled
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Technician
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Cost
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {records.map((record) => (
              <TableRow
                key={record.id}
                className="transition-colors hover:bg-muted/30"
                data-testid={`maintenance-row-${record.id}`}
              >
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-foreground capitalize">
                    {record.type.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getPriorityBadge(record.priority)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getStatusBadge(record.status)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDateTime(record.scheduled_date)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">
                  {record.technician || "Not assigned"}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">
                  {record.cost ? `$${parseFloat(record.cost).toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(record)}
                    data-testid={`edit-maintenance-${record.id}`}
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
