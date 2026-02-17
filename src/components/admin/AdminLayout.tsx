import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <AdminSidebar
                isCollapsed={isCollapsed}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                closeMobile={() => setIsMobileOpen(false)}
            />

            {/* Mobile Header for Hamburger */}
            <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
                <span className="font-display text-lg font-bold tracking-wider text-foreground">
                    AUTO<span className="text-primary">RAYA</span> Admin
                </span>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Main content */}
            <main
                className={cn(
                    "flex-1 p-4 pt-20 md:p-8 md:pt-8 transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:ml-20" : "md:ml-64"
                )}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
