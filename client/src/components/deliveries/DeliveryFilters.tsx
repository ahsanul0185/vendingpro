import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DeliveryFiltersProps {
  filters: {
    search: string;
    status: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function DeliveryFilters({ filters, onFiltersChange }: DeliveryFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="glass-effect" data-testid="delivery-filters">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="delivery-search" className="mb-2 block text-sm font-medium text-foreground">
              Search
            </Label>
            <Input
              id="delivery-search"
              type="text"
              placeholder="Delivery #, Driver..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              data-testid="delivery-search-input"
            />
          </div>
          
          <div>
            <Label htmlFor="delivery-status" className="mb-2 block text-sm font-medium text-foreground">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
              data-testid="delivery-status-select"
            >
              <SelectTrigger id="delivery-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="delivery-date" className="mb-2 block text-sm font-medium text-foreground">
              Date Range
            </Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
              data-testid="delivery-date-select"
            >
              <SelectTrigger id="delivery-date">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
