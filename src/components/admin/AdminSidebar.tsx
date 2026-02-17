import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Car,
    LayoutDashboard,
    Package,
    KeyRound,
    ShoppingCart,
    Users,
    LogOut,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    X,
    FileText,
    MessageSquareQuote,
    HelpCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const sidebarLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Kendaraan", href: "/admin/kendaraan", icon: Package },
    { label: "Daftar Sewa", href: "/admin/sewa", icon: KeyRound },
    { label: "Penjualan", href: "/admin/penjualan", icon: ShoppingCart },
    { label: "Laporan", href: "/admin/laporan", icon: FileText },
    { label: "Testimoni", href: "/admin/testimoni", icon: MessageSquareQuote },
    { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
    { label: "Pelanggan", href: "/admin/pelanggan", icon: Users },
];

interface AdminSidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobileOpen: boolean;
    closeMobile: () => void;
}

const AdminSidebar = ({
    isCollapsed,
    toggleSidebar,
    isMobileOpen,
    closeMobile,
}: AdminSidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, profile } = useAuth();

    const handleLogout = async () => {
        await signOut();
        toast.success("Berhasil keluar.");
        navigate("/");
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={closeMobile}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-20" : "w-64",
                    // Mobile: fixed width, slide in/out
                    "md:translate-x-0",
                    isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header / Logo */}
                <div className={cn(
                    "flex items-center border-b border-border py-5",
                    isCollapsed ? "justify-center px-0" : "justify-between px-6"
                )}>
                    <div className="flex items-center gap-2">
                        <Car className="h-6 w-6 text-primary flex-shrink-0" />
                        <div className={cn("overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                            <span className="font-display text-lg font-bold tracking-wider text-foreground whitespace-nowrap">
                                AUTO<span className="text-primary">RAYA</span>
                            </span>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={closeMobile} className="md:hidden text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
                    {sidebarLinks.map(({ label, href, icon: Icon }) => {
                        const isActive =
                            href === "/admin"
                                ? location.pathname === "/admin"
                                : location.pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                to={href}
                                onClick={closeMobile} // Close on nav for mobile
                                className={cn(
                                    "flex items-center rounded-lg py-3 font-body text-sm font-medium transition-all group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    isCollapsed ? "justify-center px-2" : "gap-3 px-4"
                                )}
                                title={isCollapsed ? label : undefined}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span className={cn(
                                    "transition-all duration-300 whitespace-nowrap overflow-hidden",
                                    isCollapsed ? "w-0 opacity-0 absolute" : "w-auto opacity-100"
                                )}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / User Info */}
                <div className="border-t border-border px-3 py-4 space-y-1">
                    {profile && (
                        <div className={cn("py-2 transition-all duration-300", isCollapsed ? "text-center px-0" : "px-4")}>
                            <div className={cn("flex flex-col", isCollapsed ? "items-center" : "")}>
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs mb-1">
                                    {profile.full_name?.charAt(0) || "A"}
                                </div>
                                <div className={cn("overflow-hidden transition-all duration-300", isCollapsed ? "h-0 opacity-0" : "h-auto opacity-100")}>
                                    <p className="font-display text-sm font-semibold text-foreground truncate">
                                        {profile.full_name || "Admin"}
                                    </p>
                                    <p className="font-body text-xs text-muted-foreground truncate">
                                        {profile.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center rounded-lg py-2 font-body text-sm text-muted-foreground transition-colors hover:text-destructive w-full",
                            isCollapsed ? "justify-center px-2" : "gap-2 px-4"
                        )}
                        title={isCollapsed ? "Keluar" : undefined}
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        <span className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                            Keluar
                        </span>
                    </button>

                    <Link
                        to="/"
                        className={cn(
                            "flex items-center rounded-lg py-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary w-full",
                            isCollapsed ? "justify-center px-2" : "gap-2 px-4"
                        )}
                        title={isCollapsed ? "Kembali ke Website" : undefined}
                    >
                        <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                        <span className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                            Kembali ke Website
                        </span>
                    </Link>
                </div>

                {/* Desktop Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex absolute -right-3 top-20 z-50 h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground"
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>
            </aside>
        </>
    );
};

export default AdminSidebar;
