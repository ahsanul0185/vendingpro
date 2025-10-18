import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AssemblyFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
    priority: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function AssemblyFilters({ filters, onFiltersChange }: AssemblyFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="glass-effect" data-testid="assembly-filters">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="assembly-search" className="mb-2 block text-sm font-medium text-foreground">
              Search
            </Label>
            <Input
              id="assembly-search"
              type="text"
              placeholder="Task name, assignee..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              data-testid="assembly-search-input"
            />
          </div>
          
          <div>
            <Label htmlFor="assembly-type" className="mb-2 block text-sm font-medium text-foreground">
              Type
            </Label>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
              data-testid="assembly-type-select"
            >
              <SelectTrigger id="assembly-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="component">Component</SelectItem>
                <SelectItem value="kit">Kit</SelectItem>
                <SelectItem value="full_machine">Full Machine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="assembly-status" className="mb-2 block text-sm font-medium text-foreground">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
              data-testid="assembly-status-select"
            >
              <SelectTrigger id="assembly-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="assembly-priority" className="mb-2 block text-sm font-medium text-foreground">
              Priority
            </Label>
            <Select
              value={filters.priority}
              onValueChange={(value) => handleFilterChange("priority", value)}
              data-testid="assembly-priority-select"
            >
              <SelectTrigger id="assembly-priority">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
