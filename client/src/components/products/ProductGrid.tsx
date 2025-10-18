import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Package } from "lucide-react";
import type { Product, Category, Subcategory } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  subcategories?: Subcategory[];
  categories?: Category[];
}

export default function ProductGrid({ products, isLoading, onEdit, onDelete, subcategories = [], categories = [] }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="glass-effect overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="mb-2 h-6 w-full" />
              <Skeleton className="mb-3 h-4 w-20" />
              <Skeleton className="mb-3 h-6 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (stock < 20) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
        <Package className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No products found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or add a new product.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className="glass-effect hover-lift overflow-hidden"
          data-testid={`product-card-${product.id}`}
        >
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-semibold text-foreground line-clamp-1" title={product.name}>
                {product.name}
              </h3>
              {getStatusBadge(product.status, product.stock)}
            </div>
            <div className="mb-3 space-y-1">
              <p className="text-sm text-muted-foreground">
                {categories.find(cat => cat.id === product.category_id)?.name || 'Uncategorized'}
              </p>
              {product.subcategory_id && subcategories.length > 0 && (
                <p className="text-xs text-muted-foreground/80">
                  {subcategories.find(sub => sub.id === product.subcategory_id)?.name || ''}
                </p>
              )}
            </div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-lg font-bold text-foreground">
                ${parseFloat(product.price).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
            </div>
            {product.specifications && (
              <div className="mb-3 space-y-1 border-t pt-2">
                <p className="text-xs font-semibold text-foreground">Specifications:</p>
                {(product.specifications as Record<string, any>).Dimensions && (
                  <p className="text-xs text-muted-foreground">Dimensions: {(product.specifications as Record<string, any>).Dimensions}</p>
                )}
                {(product.specifications as Record<string, any>).Capacity && (
                  <p className="text-xs text-muted-foreground">Capacity: {(product.specifications as Record<string, any>).Capacity}</p>
                )}
                {(product.specifications as Record<string, any>)["Power Consumption"] && (
                  <p className="text-xs text-muted-foreground">Power: {(product.specifications as Record<string, any>)["Power Consumption"]}</p>
                )}
                {(product.specifications as Record<string, any>).Weight && (
                  <p className="text-xs text-muted-foreground">Weight: {(product.specifications as Record<string, any>).Weight}</p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(product)}
                data-testid={`edit-product-${product.id}`}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(product.id)}
                data-testid={`delete-product-${product.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
