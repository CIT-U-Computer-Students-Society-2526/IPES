import { useState } from "react";
import { Link, useLocation, Outlet, Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useUsers";
import { useOrganizationState } from "@/contexts/OrganizationContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileEdit,
  ClipboardList,
  BarChart3,
  Trophy,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

import { ProfileEditorDialog } from "@/components/ProfileEditorDialog";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Organization", href: "/admin/organization", icon: Building2 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Accomplishments", href: "/admin/accomplishments", icon: Trophy },
  { name: "Form Builder", href: "/admin/forms", icon: FileEdit },
  { name: "Assignments", href: "/admin/assignments", icon: ClipboardList },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Audit Log", href: "/admin/audit-log", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];


const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user, isLoading, isError } = useCurrentUser();
  const { activeOrganizationId } = useOrganizationState();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Validate User Context
  if (isError || !user || !activeOrganizationId) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Find their membership in the currently active organization
  const activeMembership = user.memberships?.find(
    (m) => m.organization_id === activeOrganizationId
  );

  // Deny access if they don't have Admin permissions within THIS specific org
  if (!activeMembership || activeMembership.role !== 'Admin') {
    return <Navigate to="/select-organization" replace />;
  }

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <img src="/ipes-logo-colored.svg" alt="IPES Logo" className="w-7 h-7 object-contain shrink-0" />
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-[#293F55] dark:text-white font-bold text-xl tracking-tight">IPES</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">Admin</span>
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]" title={activeMembership?.organization_name}>
                  {activeMembership?.organization_name}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                My Space
              </p>
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <ProfileEditorDialog>
              <div className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">System Administrator</p>
                </div>
              </div>
            </ProfileEditorDialog>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground mt-2">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
