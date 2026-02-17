import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Car, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingRole, setCheckingRole] = useState(false);

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/akun";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast.error("Email dan password wajib diisi.");
            return;
        }

        setLoading(true);
        const { error, profile } = await signIn(email, password);
        console.log("Data Profil dari Supabase:", profile);
        setLoading(false);

        if (error) {
            toast.error(error);
            return;
        }

        // Show a brief loading while we determine the destination
        setCheckingRole(true);
        toast.success("Berhasil masuk!");

        // Use the profile returned directly — no stale state
        const isAdminUser = profile?.role === "admin";
        navigate(isAdminUser ? "/admin" : from, { replace: true });
    };

    if (checkingRole) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="font-body text-sm text-muted-foreground">Mengecek role akun...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <Car className="h-8 w-8 text-primary" />
                        <span className="font-display text-3xl font-bold tracking-wider text-foreground">
                            AUTO<span className="text-primary">RAYA</span>
                        </span>
                    </Link>
                    <p className="mt-2 font-body text-muted-foreground">Masuk ke akun Anda</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-border bg-card p-8 shadow-lg"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Email
                            </Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="border-border bg-secondary text-foreground"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div>
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="border-border bg-secondary pr-10 text-foreground"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-gold py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-transform hover:scale-[1.02] disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Masuk...
                            </>
                        ) : (
                            "Masuk"
                        )}
                    </button>

                    <p className="mt-6 text-center font-body text-sm text-muted-foreground">
                        Belum punya akun?{" "}
                        <Link to="/daftar" className="font-semibold text-primary hover:underline">
                            Daftar sekarang
                        </Link>
                    </p>
                </form>

                <p className="mt-6 text-center">
                    <Link
                        to="/"
                        className="font-body text-sm text-muted-foreground hover:text-primary"
                    >
                        ← Kembali ke Beranda
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
