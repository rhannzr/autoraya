import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Package, ShoppingCart, KeyRound, LogOut, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface RentalItem {
    id: string;
    vehicle_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: string;
    vehicles: { name: string; image: string } | null;
}

interface SaleItem {
    id: string;
    vehicle_id: string;
    sale_price: number;
    sale_date: string;
    status: string;
    vehicles: { name: string; image: string } | null;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    active: "bg-blue-500/10 text-blue-500",
    completed: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500",
};

const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    active: "Aktif",
    completed: "Selesai",
    cancelled: "Dibatalkan",
};

const MyAccount = () => {
    const { user, profile, signOut } = useAuth();
    const [rentals, setRentals] = useState<RentalItem[]>([]);
    const [sales, setSales] = useState<SaleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const [rentalsRes, salesRes] = await Promise.all([
                supabase
                    .from("rentals")
                    .select("id, vehicle_id, start_date, end_date, total_price, status, vehicles(name, image)")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false }),
                supabase
                    .from("sales")
                    .select("id, vehicle_id, sale_price, sale_date, status, vehicles(name, image)")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false }),
            ]);

            if (rentalsRes.data) setRentals(rentalsRes.data as unknown as RentalItem[]);
            if (salesRes.data) setSales(salesRes.data as unknown as SaleItem[]);
            setLoading(false);
        };

        fetchData();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        toast.success("Berhasil keluar.");
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 pb-20 pt-24">
                <div className="mb-8">
                    <h1 className="font-display text-4xl font-bold text-foreground">
                        Akun <span className="text-gradient-gold">Saya</span>
                    </h1>
                    <p className="mt-2 font-body text-muted-foreground">
                        Kelola profil dan lihat riwayat transaksi Anda
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Profile card */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                    <User className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-display text-lg font-bold text-foreground">
                                        {profile?.full_name || "Member"}
                                    </h2>
                                    <p className="font-body text-sm text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 font-body text-sm text-muted-foreground">
                                <p>📱 {profile?.phone || "Belum diisi"}</p>
                                <p>📍 {profile?.address || "Belum diisi"}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 font-display text-sm font-semibold text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                            >
                                <LogOut className="h-4 w-4" />
                                Keluar
                            </button>
                        </div>
                    </div>

                    {/* Transaction history */}
                    <div className="space-y-6 lg:col-span-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                {/* Rentals */}
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                                        <KeyRound className="h-5 w-5 text-primary" />
                                        Riwayat Sewa
                                    </h2>
                                    {rentals.length === 0 ? (
                                        <p className="mt-4 font-body text-sm text-muted-foreground">
                                            Belum ada riwayat sewa.
                                        </p>
                                    ) : (
                                        <div className="mt-4 space-y-3">
                                            {rentals.map((r) => (
                                                <div
                                                    key={r.id}
                                                    className="flex items-center justify-between rounded-lg border border-border p-4"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {r.vehicles?.image && (
                                                            <img
                                                                src={r.vehicles.image}
                                                                alt={r.vehicles.name || ""}
                                                                className="h-12 w-16 rounded object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-display text-sm font-bold text-foreground">
                                                                {r.vehicles?.name || "Kendaraan"}
                                                            </p>
                                                            <p className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                {r.start_date} → {r.end_date}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-3 py-1 font-display text-xs font-semibold uppercase ${statusColors[r.status] || ""}`}
                                                    >
                                                        {statusLabels[r.status] || r.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Sales */}
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                                        <ShoppingCart className="h-5 w-5 text-primary" />
                                        Riwayat Pembelian
                                    </h2>
                                    {sales.length === 0 ? (
                                        <p className="mt-4 font-body text-sm text-muted-foreground">
                                            Belum ada riwayat pembelian.
                                        </p>
                                    ) : (
                                        <div className="mt-4 space-y-3">
                                            {sales.map((s) => (
                                                <div
                                                    key={s.id}
                                                    className="flex items-center justify-between rounded-lg border border-border p-4"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {s.vehicles?.image && (
                                                            <img
                                                                src={s.vehicles.image}
                                                                alt={s.vehicles.name || ""}
                                                                className="h-12 w-16 rounded object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-display text-sm font-bold text-foreground">
                                                                {s.vehicles?.name || "Kendaraan"}
                                                            </p>
                                                            <p className="font-body text-xs text-muted-foreground">
                                                                Rp {Number(s.sale_price).toLocaleString("id-ID")} • {s.sale_date}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-3 py-1 font-display text-xs font-semibold uppercase ${statusColors[s.status] || ""}`}
                                                    >
                                                        {statusLabels[s.status] || s.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MyAccount;
