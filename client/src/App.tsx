import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Layout from "@/pages/Layout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import Orders from "@/pages/Orders";
import OrderTrack from "@/pages/OrderTrack";
import Checkout from "@/pages/Checkout";
import Notifications from "@/pages/Notifications";
import Monitoring from "@/pages/Monitoring";
import Deliveries from "@/pages/Deliveries";
import Assembly from "@/pages/Assembly";
import Maintenance from "@/pages/Maintenance";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute
        path="/"
        component={Dashboard}
        allowedRoles={["admin", "customer"]}
      />
      <ProtectedRoute
        path="/products"
        component={Products}
        allowedRoles={["admin"]}
      />
      <ProtectedRoute
        path="/categories"
        component={Categories}
        allowedRoles={["admin"]}
      />
      <ProtectedRoute
        path="/orders"
        component={Orders}
        allowedRoles={["admin", "customer"]}
      />
      <ProtectedRoute
        path="/order-track"
        component={OrderTrack}
        allowedRoles={["admin", "customer"]}
      />
      <ProtectedRoute
        path="/checkout"
        component={Checkout}
        allowedRoles={["admin", "customer"]}
      />
      <ProtectedRoute
        path="/notifications"
        component={Notifications}
        allowedRoles={["admin", "customer"]}
      />
      <ProtectedRoute
        path="/monitoring"
        component={Monitoring}
        allowedRoles={["admin"]}
      />
      <ProtectedRoute
        path="/deliveries"
        component={Deliveries}
        allowedRoles={["admin"]}
      />
      <ProtectedRoute
        path="/assembly"
        component={Assembly}
        allowedRoles={["admin"]}
      />
      <ProtectedRoute
        path="/maintenance"
        component={Maintenance}
        allowedRoles={["admin"]}
      />
      <ProtectedRoute
        path="/settings"
        component={Settings}
        allowedRoles={["admin"]}
      />
      <ProtectedRoute
        path="/help"
        component={Help}
        allowedRoles={["admin", "customer"]}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
