import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface ProductFiltersProps {
  filters: {
    search: string;
    category: string;
    status: string;
    sortBy: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const { data: categoriesWithSubs = [] } = useQuery<any[]>({
    queryKey: ["/api/categories-with-subcategories"],
  });

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="glass-effect">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="search" className="mb-2 block text-sm font-medium text-foreground">
              Search
            </Label>
            <Input
              id="search"
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              data-testid="product-search-input"
            />
          </div>
          <div>
            <Label htmlFor="category" className="mb-2 block text-sm font-medium text-foreground">
              Category
            </Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
              data-testid="product-category-select"
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesWithSubs.map((category) => (
                  <div key={category.id}>
                    <SelectItem value={category.name}>{category.name}</SelectItem>
                    {category.subcategories && category.subcategories.length > 0 && (
                      category.subcategories.map((sub: any) => (
                        <SelectItem key={sub.id} value={sub.name} className="pl-6">
                          └ {sub.name}
                        </SelectItem>
                      ))
                    )}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status" className="mb-2 block text-sm font-medium text-foreground">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
              data-testid="product-status-select"
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sortBy" className="mb-2 block text-sm font-medium text-foreground">
              Sort By
            </Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
              data-testid="product-sort-select"
            >
              <SelectTrigger id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="stock">Stock Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
