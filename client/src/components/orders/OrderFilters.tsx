import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface OrderFiltersProps {
  filters: {
    search: string;
    status: string;
    dateRange: string;
    payment: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="glass-effect">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="order-search" className="mb-2 block text-sm font-medium text-foreground">
              Search
            </Label>
            <Input
              id="order-search"
              type="text"
              placeholder="Order ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              data-testid="order-search-input"
            />
          </div>
          
          <div>
            <Label htmlFor="order-status" className="mb-2 block text-sm font-medium text-foreground">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
              data-testid="order-status-select"
            >
              <SelectTrigger id="order-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="order-date" className="mb-2 block text-sm font-medium text-foreground">
              Date Range
            </Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
              data-testid="order-date-select"
            >
              <SelectTrigger id="order-date">
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
          
          <div>
            <Label htmlFor="order-payment" className="mb-2 block text-sm font-medium text-foreground">
              Payment Method
            </Label>
            <Select
              value={filters.payment}
              onValueChange={(value) => handleFilterChange("payment", value)}
              data-testid="order-payment-select"
            >
              <SelectTrigger id="order-payment">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cashapp">CashApp</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
                <SelectItem value="western_union">Western Union</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
