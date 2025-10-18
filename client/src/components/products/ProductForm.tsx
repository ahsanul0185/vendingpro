import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertProductSchema, type Product, type InsertProduct, type Category, type Subcategory } from "@shared/schema";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: InsertProduct) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: subcategories = [] } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const response = await fetch(`/api/subcategories?categoryId=${selectedCategoryId}`);
      if (!response.ok) throw new Error("Failed to fetch subcategories");
      return response.json();
    },
    enabled: !!selectedCategoryId,
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      category: "",
      category_id: "",
      subcategory_id: "",
      price: "",
      description: "",
      image: "",
      stock: 0,
      specifications: null,
      status: "active",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        category: product.category || "",
        category_id: product.category_id || "",
        subcategory_id: product.subcategory_id || "",
        price: product.price,
        description: product.description || "",
        image: product.image || "",
        stock: product.stock,
        specifications: product.specifications || null,
        status: product.status,
      });
      if (product.category_id) {
        setSelectedCategoryId(product.category_id);
      }
    }
  }, [product, form]);

  const handleSubmit = (data: InsertProduct) => {
    onSubmit(data);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="product-form-dialog">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product information below." : "Fill in the details for the new product."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} data-testid="product-name-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategoryId(value);
                        form.setValue("subcategory_id", "");
                      }} 
                      value={field.value || ""} 
                      data-testid="product-category-select"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""} 
                      disabled={!selectedCategoryId || subcategories.length === 0}
                      data-testid="product-subcategory-select"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedCategoryId ? "Select subcategory" : "Select category first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategories.map((subcat) => (
                          <SelectItem key={subcat.id} value={subcat.id}>
                            {subcat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        data-testid="product-price-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="product-stock-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="product-status-select">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} data-testid="product-image-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                      data-testid="product-description-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="mb-4 text-sm font-semibold">Specifications</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="spec-dimensions" className="mb-2 block text-sm">Dimensions</Label>
                  <Input
                    id="spec-dimensions"
                    placeholder="e.g., 10 x 5 x 3 cm"
                    value={(form.watch("specifications") as any)?.Dimensions || ""}
                    onChange={(e) => {
                      const currentSpecs = form.getValues("specifications") as any || {};
                      form.setValue("specifications", { ...currentSpecs, Dimensions: e.target.value });
                    }}
                    data-testid="spec-dimensions-input"
                  />
                </div>

                <div>
                  <Label htmlFor="spec-capacity" className="mb-2 block text-sm">Capacity</Label>
                  <Input
                    id="spec-capacity"
                    placeholder="e.g., 500ml, 2L"
                    value={(form.watch("specifications") as any)?.Capacity || ""}
                    onChange={(e) => {
                      const currentSpecs = form.getValues("specifications") as any || {};
                      form.setValue("specifications", { ...currentSpecs, Capacity: e.target.value });
                    }}
                    data-testid="spec-capacity-input"
                  />
                </div>

                <div>
                  <Label htmlFor="spec-power" className="mb-2 block text-sm">Power Consumption</Label>
                  <Input
                    id="spec-power"
                    placeholder="e.g., 100W, 2.5kW"
                    value={(form.watch("specifications") as any)?.["Power Consumption"] || ""}
                    onChange={(e) => {
                      const currentSpecs = form.getValues("specifications") as any || {};
                      form.setValue("specifications", { ...currentSpecs, "Power Consumption": e.target.value });
                    }}
                    data-testid="spec-power-input"
                  />
                </div>

                <div>
                  <Label htmlFor="spec-weight" className="mb-2 block text-sm">Weight</Label>
                  <Input
                    id="spec-weight"
                    placeholder="e.g., 2.5kg, 500g"
                    value={(form.watch("specifications") as any)?.Weight || ""}
                    onChange={(e) => {
                      const currentSpecs = form.getValues("specifications") as any || {};
                      form.setValue("specifications", { ...currentSpecs, Weight: e.target.value });
                    }}
                    data-testid="spec-weight-input"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel} data-testid="product-form-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="product-form-submit">
                {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
