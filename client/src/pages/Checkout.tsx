import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ShoppingCart, CreditCard, Truck, Package, Plus, Minus, AlertCircle } from "lucide-react";
import type { Product } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

const orderFormSchema = z.object({
  // Contact Information
  customer_name: z.string().min(2, "Name is required"),
  customer_email: z.string().email("Valid email required"),
  customer_phone: z.string().min(10, "Valid phone number required"),
  
  // Shipping Address
  shipping_address: z.string().min(5, "Shipping address is required"),
  shipping_city: z.string().min(2, "City is required"),
  shipping_state: z.string().min(2, "State is required"),
  shipping_zip: z.string().min(5, "ZIP code is required"),
  shipping_country: z.string().min(2, "Country is required"),
  
  // Billing Address
  same_as_shipping: z.boolean().default(true),
  billing_address: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_zip: z.string().optional(),
  billing_country: z.string().optional(),
  
  // Payment Information
  payment_method: z.enum(["bank_transfer", "cashapp", "venmo", "western_union"]),
  payment_amount: z.string().optional(),
  payment_transfer_id: z.string().optional(),
  payment_transfer_date: z.string().optional(),
  
  // Additional notes
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [productId, setProductId] = useState<string | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Get product ID from URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("product") || params.get("product_id");
    if (id) {
      setProductId(id);
    } else {
      toast({
        title: "No Product Selected",
        description: "Please select a product to checkout",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [toast, navigate]);

  // Fetch product details
  const { data: product, isLoading: isProductLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    enabled: !!productId,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      toast({
        title: "Authentication Required",
        description: "Please login to place an order",
      });
      const params = new URLSearchParams(window.location.search);
      const paramName = params.get("product_id") ? "product_id" : "product";
      navigate(`/auth?${paramName}=${productId}`);
    }
  }, [user, navigate, productId, toast]);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_name: user?.username || "",
      customer_email: user?.email || "",
      customer_phone: "",
      shipping_address: "",
      shipping_city: "",
      shipping_state: "",
      shipping_zip: "",
      shipping_country: "USA",
      same_as_shipping: true,
      payment_method: "bank_transfer",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const totalAmount = product ? (parseFloat(product.price) * quantity).toFixed(2) : "0";
      const orderData = {
        product_id: productId,
        quantity: quantity,
        total_amount: totalAmount,
        payment_method: data.payment_method,
        payment_amount: data.payment_amount,
        payment_transfer_id: data.payment_transfer_id,
        payment_transfer_date: data.payment_transfer_date,
        customer_info: {
          name: data.customer_name,
          email: data.customer_email,
          phone: data.customer_phone,
          shipping_address: {
            address: data.shipping_address,
            city: data.shipping_city,
            state: data.shipping_state,
            zip: data.shipping_zip,
            country: data.shipping_country,
          },
          billing_address: data.same_as_shipping
            ? {
                address: data.shipping_address,
                city: data.shipping_city,
                state: data.shipping_state,
                zip: data.shipping_zip,
                country: data.shipping_country,
              }
            : {
                address: data.billing_address,
                city: data.billing_city,
                state: data.billing_state,
                zip: data.billing_zip,
                country: data.billing_country,
              },
          notes: data.notes,
        },
      };

      const response = await apiRequest("POST", "/api/checkout", orderData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been placed. You can add payment details later if needed.",
      });
      navigate("/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormData) => {
    createOrderMutation.mutate(data);
  };

  if (isProductLoading || !product) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="mt-4 text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order details below</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>How should we contact you about your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-customer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customer_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} data-testid="input-customer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customer_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1 (555) 123-4567" {...field} data-testid="input-customer-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shipping_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, Apt 4B" {...field} data-testid="input-shipping-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shipping_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} data-testid="input-shipping-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shipping_state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} data-testid="input-shipping-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shipping_zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} data-testid="input-shipping-zip" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shipping_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="USA" {...field} data-testid="input-shipping-country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                  <CardDescription>Where should we send the invoice?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="same_as_shipping"
                      checked={sameAsShipping}
                      onChange={(e) => {
                        setSameAsShipping(e.target.checked);
                        form.setValue("same_as_shipping", e.target.checked);
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                      data-testid="checkbox-same-as-shipping"
                    />
                    <Label htmlFor="same_as_shipping" className="text-sm font-normal cursor-pointer">
                      Same as shipping address
                    </Label>
                  </div>

                  {!sameAsShipping && (
                    <>
                      <FormField
                        control={form.control}
                        name="billing_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St, Apt 4B" {...field} data-testid="input-billing-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="billing_city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} data-testid="input-billing-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} data-testid="input-billing-state" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="billing_zip"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} data-testid="input-billing-zip" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="USA" {...field} data-testid="input-billing-country" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>
                    Select your payment method and provide transfer details (optional - can be added later)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} data-testid="select-payment-method">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cashapp">CashApp</SelectItem>
                            <SelectItem value="venmo">Venmo</SelectItem>
                            <SelectItem value="western_union">Western Union</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder={`${product?.price || "0.00"}`}
                            {...field}
                            data-testid="input-payment-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_transfer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transfer ID / Proof (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Transaction reference number" {...field} data-testid="input-payment-transfer-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_transfer_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transfer Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-payment-transfer-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                  <CardDescription>Any special instructions or comments?</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any special delivery instructions or notes..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="input-order-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/")} data-testid="button-cancel-order">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createOrderMutation.isPending || product.stock === 0}
                  data-testid="button-place-order"
                >
                  {createOrderMutation.isPending ? "Placing Order..." : product.stock === 0 ? "Out of Stock" : "Place Order"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Out of Stock Alert */}
              {product.stock === 0 && (
                <Alert variant="destructive" data-testid="alert-out-of-stock">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This product is currently out of stock and cannot be ordered.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-4">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">Stock: {product.stock}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                {/* Quantity Controls */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || product.stock === 0}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium" data-testid="text-quantity">{quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock || product.stock === 0}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per item</span>
                  <span>${parseFloat(product.price).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span data-testid="text-total-amount">${(parseFloat(product.price) * quantity).toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  💡 You can place the order now and add payment transfer details later from your orders page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
