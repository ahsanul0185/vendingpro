import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { insertSubcategorySchema, type Subcategory, type InsertSubcategory, type Category } from "@shared/schema";

interface SubcategoryFormProps {
  subcategory?: Subcategory | null;
  categories: Category[];
  initialCategoryId?: string | null;
  onSubmit: (data: InsertSubcategory) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function SubcategoryForm({ 
  subcategory, 
  categories, 
  initialCategoryId,
  onSubmit, 
  onCancel, 
  isLoading 
}: SubcategoryFormProps) {
  const form = useForm<InsertSubcategory>({
    resolver: zodResolver(insertSubcategorySchema),
    defaultValues: {
      category_id: initialCategoryId || "",
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (subcategory) {
      form.reset({
        category_id: subcategory.category_id,
        name: subcategory.name,
        description: subcategory.description || "",
      });
    } else if (initialCategoryId) {
      form.setValue("category_id", initialCategoryId);
    }
  }, [subcategory, initialCategoryId, form]);

  const handleSubmit = (data: InsertSubcategory) => {
    onSubmit(data);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md" data-testid="subcategory-form-dialog">
        <DialogHeader>
          <DialogTitle>{subcategory ? "Edit Subcategory" : "Add New Subcategory"}</DialogTitle>
          <DialogDescription>
            {subcategory ? "Update the subcategory information below." : "Fill in the details for the new subcategory."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} data-testid="subcategory-category-select">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category" />
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subcategory name" {...field} data-testid="subcategory-name-input" />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter subcategory description..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                      data-testid="subcategory-description-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel} data-testid="subcategory-form-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="subcategory-form-submit">
                {isLoading ? "Saving..." : subcategory ? "Update Subcategory" : "Create Subcategory"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
