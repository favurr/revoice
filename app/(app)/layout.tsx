"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import {
  BarChart3,
  Loader2,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { headers } from "next/headers";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      // Use the server-side sign-out action
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: await headers(),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Signed out. Redirecting");
        router.push("/sign-in");
      } else {
        toast.error(data?.message || "Sign out failed");
      }
    } catch (error) {
      toast.error("An error occurred during sign-out");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage("Syncing to Supabase...");

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      const body = await response.json();
      if (body.success) {
        setSyncMessage("Sync complete");
      } else {
        setSyncMessage("Sync failed");
      }
    } catch (error) {
      console.error(error);
      setSyncMessage("Sync failed");
    } finally {
      setIsSyncing(false);
      window.setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } border-r bg-card transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Revoice</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={isActive("dashboard") ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => router.push("/dashboard")}
          >
            <BarChart3 className="h-4 w-4 mr-2 shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </Button>

          <Button
            variant={isActive("orders") ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => router.push("/orders")}
          >
            <ShoppingCart className="h-4 w-4 mr-2 shrink-0" />
            {sidebarOpen && <span>Orders</span>}
          </Button>

          <Button
            variant={isActive("customers") ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => router.push("/customers")}
          >
            <User className="h-4 w-4 mr-2 shrink-0" />
            {sidebarOpen && <span>Customers</span>}
          </Button>

          <Button
            variant={isActive("products") ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => router.push("/products")}
          >
            <Package className="h-4 w-4 mr-2 shrink-0" />
            {sidebarOpen && <span>Products</span>}
          </Button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          {sidebarOpen && (
            <div className="text-xs text-muted-foreground">
              <p>Offline-First</p>
              <p>SQLite Database</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Bar */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 h-14 flex items-center px-6 justify-between">
          <h1 className="text-lg font-semibold">Revoice POS</h1>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? "Syncing…" : "Sync to Supabase"}
            </Button>
            {syncMessage && (
              <span className="text-sm text-muted-foreground">
                {syncMessage}
              </span>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  {session?.user?.name || session?.user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Signing Out…" : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
