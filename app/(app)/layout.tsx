"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3, ShoppingCart, Package, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: session } = useSession();

  const isActive = (route: string) => pathname.includes(route);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
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
            onClick={() => router.push("/orders/new")}
          >
            <ShoppingCart className="h-4 w-4 mr-2 shrink-0" />
            {sidebarOpen && <span>New Order</span>}
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
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
