import { useEffect, useState } from "react";
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
import { Plus, Minus, X } from "lucide-react";
import { insertAssemblySchema, type Assembly, type InsertAssembly } from "@shared/schema";

interface ComponentItem {
  name: string;
  quantity: number;
}

interface AssemblyFormProps {
  assembly?: Assembly | null;
  onSubmit: (data: InsertAssembly) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function AssemblyForm({ assembly, onSubmit, onCancel, isLoading }: AssemblyFormProps) {
  const [components, setComponents] = useState<ComponentItem[]>([]);

  const form = useForm<InsertAssembly>({
    resolver: zodResolver(insertAssemblySchema),
    defaultValues: {
      name: "",
      type: "component",
      components: {},
      status: "pending",
      priority: "normal",
      assigned_to: "",
      estimated_time: 60,
      notes: "",
    },
  });

  useEffect(() => {
    if (assembly) {
      form.reset({
        name: assembly.name,
        type: assembly.type,
        components: assembly.components as any,
        status: assembly.status,
        priority: assembly.priority,
        assigned_to: assembly.assigned_to || "",
        estimated_time: assembly.estimated_time || 60,
        notes: assembly.notes || "",
      });
      
      // Convert JSON components to array format
      if (assembly.components && typeof assembly.components === 'object') {
        const componentsArray = Object.entries(assembly.components as Record<string, any>).map(([name, quantity]) => ({
          name,
          quantity: Number(quantity) || 0,
        }));
        setComponents(componentsArray);
      }
    }
  }, [assembly, form]);

  const handleSubmit = (data: InsertAssembly) => {
    // Convert components array to JSON object
    const componentsObj: Record<string, number> = {};
    components.forEach((comp) => {
      if (comp.name.trim()) {
        componentsObj[comp.name] = comp.quantity;
      }
    });
    
    const parsedData = {
      ...data,
      components: componentsObj,
    };
    onSubmit(parsedData);
  };

  const addComponent = () => {
    setComponents([...components, { name: "", quantity: 1 }]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponentName = (index: number, name: string) => {
    const updated = [...components];
    updated[index].name = name;
    setComponents(updated);
  };

  const updateComponentQuantity = (index: number, quantity: number) => {
    const updated = [...components];
    updated[index].quantity = Math.max(1, quantity);
    setComponents(updated);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" data-testid="assembly-form-dialog">
        <DialogHeader>
          <DialogTitle>{assembly ? "Edit Assembly Task" : "Create Assembly Task"}</DialogTitle>
          <DialogDescription>
            {assembly ? "Update the assembly task information below." : "Fill in the details for the new assembly task."}
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
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task name" {...field} data-testid="assembly-name-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="assembly-type-select">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="component">Component</SelectItem>
                        <SelectItem value="kit">Kit</SelectItem>
                        <SelectItem value="full_machine">Full Machine</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="assembly-priority-select">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value} data-testid="assembly-status-select">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                      <Input placeholder="Technician name" {...field} value={field.value || ""} data-testid="assembly-assigned-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Time (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="60"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="assembly-time-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Components Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Components</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addComponent}
                  data-testid="add-component-button"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>

              {components.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No components added. Click "Add" to add a component.
                </div>
              ) : (
                <div className="space-y-2">
                  {components.map((component, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border p-3"
                      data-testid={`component-item-${index}`}
                    >
                      <Input
                        placeholder="Component name"
                        value={component.name}
                        onChange={(e) => updateComponentName(index, e.target.value)}
                        className="flex-1"
                        data-testid={`component-name-${index}`}
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateComponentQuantity(index, component.quantity - 1)}
                          disabled={component.quantity <= 1}
                          data-testid={`component-decrease-${index}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={component.quantity}
                          onChange={(e) =>
                            updateComponentQuantity(index, parseInt(e.target.value) || 1)
                          }
                          className="w-16 text-center"
                          data-testid={`component-quantity-${index}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateComponentQuantity(index, component.quantity + 1)}
                          data-testid={`component-increase-${index}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeComponent(index)}
                        data-testid={`component-remove-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes..."
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ""}
                      data-testid="assembly-notes-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel} data-testid="assembly-form-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="assembly-form-submit">
                {isLoading ? "Saving..." : assembly ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
