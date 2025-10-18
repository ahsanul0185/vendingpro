import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentOrders from "@/components/dashboard/RecentOrders";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap, PlusCircle, Activity, Wrench, AlertTriangle, Package, Clock, CheckCircle2, ShoppingCart, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Order } from "@shared/schema";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const isCustomer = user?.role === "customer";

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !isCustomer, // Only fetch admin stats for non-customers
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Customer-specific stats
  const customerOrders = user ? orders.filter(order => order.user_id === user.id) : [];
  const pendingOrders = customerOrders.filter(order => order.status === "pending").length;
  const completedOrders = customerOrders.filter(order => order.status === "completed").length;
  const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  // Reset password state and mutation
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) =>
      apiRequest("POST", "/api/reset-password", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your password has been reset successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  if (isCustomer) {
    return (
      <div className="space-y-8">
        {/* Customer Welcome Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-foreground">Welcome back, {user?.username}!</h2>
            <p className="text-muted-foreground">
              Here's an overview of your orders and activity.
            </p>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="customer-total-orders">{customerOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="customer-pending-orders">{pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="customer-completed-orders">{completedOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="customer-total-spent">${totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>My Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={customerOrders} isLoading={ordersLoading} />
          </CardContent>
        </Card>

        {/* Reset Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Reset Password
            </CardTitle>
            <CardDescription>Change your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  data-testid="input-confirm-password"
                />
              </div>
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                data-testid="button-reset-password"
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-foreground">Welcome back, {user?.username || "Admin"}!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your vending machine network today.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2">
          <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-green-800">All Systems Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} isLoading={statsLoading} />

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Charts and Analytics */}
        <div className="space-y-8 lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Right Column - Recent Activities */}
        <div className="space-y-8">
          <RecentOrders orders={orders} isLoading={ordersLoading} />

          {/* Quick Actions */}
          <Card className="glass-effect border-0 shadow-xl" data-testid="quick-actions-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="h-12 w-full justify-start gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" data-testid="add-product-button">
                <PlusCircle className="h-4 w-4" />
                Add New Product
              </Button>
              <Button variant="outline" className="h-12 w-full justify-start gap-3" data-testid="health-check-button">
                <Activity className="h-4 w-4" />
                System Health Check
              </Button>
              <Button variant="outline" className="h-12 w-full justify-start gap-3" data-testid="schedule-maintenance-button">
                <Wrench className="h-4 w-4" />
                Schedule Maintenance
              </Button>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="glass-effect border-0 border-l-4 border-l-orange-500 shadow-xl" data-testid="alerts-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-orange-50 p-3" data-testid="alert-low-stock">
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500"></div>
                <div>
                  <p className="text-sm font-medium text-orange-900">Low Stock Alert</p>
                  <p className="text-xs text-orange-700">
                    Some products need restocking (12 items remaining)
                  </p>
                  <p className="mt-1 text-xs text-orange-600">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3" data-testid="alert-maintenance">
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-sm font-medium text-red-900">Maintenance Due</p>
                  <p className="text-xs text-red-700">
                    Equipment requires immediate service
                  </p>
                  <p className="mt-1 text-xs text-red-600">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-3" data-testid="alert-payment">
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Payment Gateway Issue</p>
                  <p className="text-xs text-yellow-700">
                    Payment processing delayed
                  </p>
                  <p className="mt-1 text-xs text-yellow-600">2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
