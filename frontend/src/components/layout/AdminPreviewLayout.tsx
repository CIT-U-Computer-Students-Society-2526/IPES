import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
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
    Bell,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/preview/admin/dashboard", icon: LayoutDashboard },
    { name: "Organization", href: "/preview/admin/organization", icon: Building2 },
    { name: "Form Builder", href: "/preview/admin/forms", icon: FileEdit },
    { name: "Assignments", href: "/preview/admin/assignments", icon: ClipboardList },
    { name: "Analytics", href: "/preview/admin/analytics", icon: BarChart3 },
    { name: "Accomplishments", href: "/preview/admin/accomplishments", icon: Trophy },
    { name: "Users", href: "/preview/admin/users", icon: Users },
    { name: "Audit Log", href: "/preview/admin/audit-log", icon: Shield },
    { name: "Settings", href: "/preview/admin/settings", icon: Settings },
];

const AdminPreviewLayout = () => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Static user data for preview
    const user = {
        first_name: "Admin",
        last_name: "User",
        role: "Admin",
        email: "admin@cit.edu"
    };

    const fullName = `${user.first_name} ${user.last_name}`;

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
                        <Link to="/preview/admin/dashboard" className="flex items-center gap-2.5">
                            <img src="/ipes-logo-colored.svg" alt="IPES Logo" className="w-7 h-7 object-contain" />
                            <div className="flex items-center gap-2">
                                <span className="text-[#293F55] font-bold text-2xl tracking-tight">IPES</span>
                                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Admin</span>
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
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{fullName}</p>
                                <p className="text-xs text-muted-foreground truncate">System Administrator</p>
                            </div>
                        </div>
                        <Link to="/login">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                                <LogOut className="w-4 h-4 mr-2" />
                                Exit Preview
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
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                        </Button>
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

export default AdminPreviewLayout;
