import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Register = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim()) {
            toast.error("Nama lengkap wajib diisi.");
            return;
        }
        if (!email.trim()) {
            toast.error("Email wajib diisi.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password minimal 6 karakter.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Password dan konfirmasi tidak cocok.");
            return;
        }

        setLoading(true);
        const error = await signUp(email, password, fullName);
        setLoading(false);

        if (error) {
            toast.error(error);
            return;
        }

        toast.success("Akun berhasil dibuat! Selamat datang.");
        navigate("/akun", { replace: true });
    };

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
                    <p className="mt-2 font-body text-muted-foreground">Buat akun baru</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-border bg-card p-8 shadow-lg"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Nama Lengkap
                            </Label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="border-border bg-secondary text-foreground"
                                autoComplete="name"
                                required
                            />
                        </div>

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
                                    placeholder="Minimal 6 karakter"
                                    className="border-border bg-secondary pr-10 text-foreground"
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
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

                        <div>
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Konfirmasi Password
                            </Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ulangi password"
                                className="border-border bg-secondary text-foreground"
                                autoComplete="new-password"
                                required
                            />
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
                                Mendaftar...
                            </>
                        ) : (
                            "Daftar"
                        )}
                    </button>

                    <p className="mt-6 text-center font-body text-sm text-muted-foreground">
                        Sudah punya akun?{" "}
                        <Link to="/login" className="font-semibold text-primary hover:underline">
                            Masuk
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

export default Register;
