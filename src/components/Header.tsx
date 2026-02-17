import { Car, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Mobil", href: "/kendaraan?type=mobil" },
  { label: "Motor", href: "/kendaraan?type=motor" },
  { label: "Rental", href: "/kendaraan" },
  { label: "Kontak", href: "#kontak" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Berhasil keluar.");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Car className="h-7 w-7 text-primary" />
          <span className="font-display text-2xl font-bold tracking-wider text-foreground">
            AUTO<span className="text-primary">RAYA</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-body text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <Link
                to="/akun"
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-body text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <User className="h-4 w-4" />
                {profile?.full_name || "Akun"}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 font-body text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md border border-border px-4 py-2 font-body text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Masuk
              </Link>
              <Link
                to="/daftar"
                className="bg-gradient-gold rounded-md px-4 py-2 font-body text-sm font-bold text-primary-foreground shadow-gold transition-transform hover:scale-105"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 font-body text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-2">
            {user ? (
              <>
                <Link
                  to="/akun"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-4 py-2 font-body text-sm text-foreground"
                >
                  <User className="h-4 w-4" />
                  Akun
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-4 py-2 font-body text-sm text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-md border border-border px-4 py-2 text-center font-body text-sm text-foreground"
                >
                  Masuk
                </Link>
                <Link
                  to="/daftar"
                  onClick={() => setMenuOpen(false)}
                  className="bg-gradient-gold flex-1 rounded-md px-4 py-2 text-center font-body text-sm font-bold text-primary-foreground"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
