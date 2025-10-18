import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Activity,
  Truck,
  Wrench,
  Settings,
  HelpCircle,
  Menu,
  Search,
  Bell,
  ChevronRight,
  FolderTree,
  LogOut,
  X,
} from "lucide-react";
import type { Order } from "@shared/schema";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logoutMutation } = useAuth();

  // Global redirect for product_id or product parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product_id") || params.get("product");
    
    // Only redirect if we have a product ID and we're NOT already on auth or checkout
    if (productId && location !== "/auth" && location !== "/checkout") {
      const paramName = params.get("product_id") ? "product_id" : "product";
      
      // If user is logged in, go directly to checkout
      if (user) {
        setLocation(`/checkout?${paramName}=${productId}`);
      } else {
        // If not logged in, go to auth with product parameter
        setLocation(`/auth?${paramName}=${productId}`);
      }
    }
  }, [location, user, setLocation]);

  // Fetch orders to get dynamic count
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Fetch products to get dynamic count
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
    enabled: !!user && user.role === "admin",
  });

  // Fetch machines for search
  const { data: machines = [] } = useQuery<any[]>({
    queryKey: ["/api/machines"],
    enabled: !!user,
  });

  // Calculate order count based on user role
  const orderCount = user?.role === "admin" 
    ? orders.length 
    : orders.filter(order => order.user_id === user?.id).length;
  
  // Get product count for admin
  const productCount = products.length;

  // Search functionality
  const searchResults = {
    products: products.filter((p: any) =>
      searchQuery && p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    orders: orders.filter((o: any) =>
      searchQuery && o.order_number.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    machines: machines.filter((m: any) =>
      searchQuery && (m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.location?.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 3),
  };

  const hasResults = searchQuery && (
    searchResults.products.length > 0 ||
    searchResults.orders.length > 0 ||
    searchResults.machines.length > 0
  );

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  const handleSearchResultClick = (path: string) => {
    setLocation(path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const navigationItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "customer"],
    },
    {
      href: "/products",
      label: "Products",
      icon: Package,
      badge: productCount > 0 ? productCount.toString() : undefined,
      roles: ["admin"],
    },
    {
      href: "/categories",
      label: "Categories",
      icon: FolderTree,
      roles: ["admin"],
    },
    {
      href: "/orders",
      label: "Orders",
      icon: ShoppingCart,
      badge: orderCount > 0 ? orderCount.toString() : undefined,
      variant: "outline" as const,
      roles: ["admin", "customer"],
    },
    {
      href: "/order-track",
      label: "Track Order",
      icon: Package,
      roles: ["admin", "customer"],
    },
    {
      href: "/monitoring",
      label: "Monitoring",
      icon: Activity,
      roles: ["admin"],
    },
    { href: "/deliveries", label: "Deliveries", icon: Truck, roles: ["admin"] },
    { href: "/assembly", label: "Assembly", icon: Wrench, roles: ["admin"] },
    {
      href: "/maintenance",
      label: "Maintenance",
      icon: Settings,
      badge: "3",
      variant: "destructive" as const,
      roles: ["admin"],
    },
  ];

  // Don't show layout for auth page
  if (location === "/auth") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo & Brand */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">VendingPro</h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigationItems
          .filter((item) => !user || item.roles.includes(user.role))
          .map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => mobile && setMobileOpen(false)}
              >
                <div
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={item.variant || "secondary"}
                      className="ml-auto text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}

        <div className="mt-4 border-t border-border pt-4">
          {(!user || user.role === "admin") && (
            <Link href="/settings">
              <div
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                data-testid="nav-settings"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </div>
            </Link>
          )}
          <Link href="/help">
            <div
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              data-testid="nav-help"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        {user ? (
          <div>
            <div className="flex items-center gap-3 rounded-lg p-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 font-semibold text-white">
                {getUserInitials(user.username)}
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-semibold text-foreground"
                  data-testid="text-username"
                >
                  {user.username}
                </p>
                <p
                  className="text-xs text-muted-foreground"
                  data-testid="text-user-role"
                >
                  {user.role}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center">
            Not logged in
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 bg-card md:flex">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            {/* Mobile Menu Button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-testid="mobile-menu-button"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Search Bar */}
            <div className="mx-4 hidden max-w-md flex-1 md:block" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products, orders, machines..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  data-testid="search-input"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    data-testid="clear-search-button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <Card className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto shadow-lg z-50">
                    <CardContent className="p-4">
                      {!hasResults && searchQuery && (
                        <p className="text-sm text-muted-foreground">No results found</p>
                      )}

                      {/* Products */}
                      {searchResults.products.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Products</h4>
                          <div className="space-y-1">
                            {searchResults.products.map((product: any) => (
                              <button
                                key={product.id}
                                className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                                onClick={() => handleSearchResultClick("/products")}
                                data-testid={`search-result-product-${product.id}`}
                              >
                                <div className="flex items-center gap-3">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex-1">
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">${product.price} - {product.category}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Orders */}
                      {searchResults.orders.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Orders</h4>
                          <div className="space-y-1">
                            {searchResults.orders.map((order: any) => (
                              <button
                                key={order.id}
                                className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                                onClick={() => handleSearchResultClick("/orders")}
                                data-testid={`search-result-order-${order.id}`}
                              >
                                <div className="flex items-center gap-3">
                                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex-1">
                                    <p className="font-medium">{order.order_number}</p>
                                    <p className="text-xs text-muted-foreground">${order.total} - {order.status}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Machines */}
                      {searchResults.machines.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Machines</h4>
                          <div className="space-y-1">
                            {searchResults.machines.map((machine: any) => (
                              <button
                                key={machine.id}
                                className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                                onClick={() => handleSearchResultClick("/monitoring")}
                                data-testid={`search-result-machine-${machine.id}`}
                              >
                                <div className="flex items-center gap-3">
                                  <Activity className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex-1">
                                    <p className="font-medium">{machine.name}</p>
                                    <p className="text-xs text-muted-foreground">{machine.location}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  data-testid="notifications-button"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"></span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
