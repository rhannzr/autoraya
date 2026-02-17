import { useState, useEffect } from "react";
import { ShoppingCart, Loader2, Plus } from "lucide-react";
import { salesService, type SaleWithDetails, type Sale } from "@/lib/salesService";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---- Helpers ----

interface CustomerOption { id: string; full_name: string; email: string }
interface VehicleOption { id: string; name: string; price_numeric: number; status: string }

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    completed: "Selesai",
    cancelled: "Dibatalkan",
};

const nextStatusOptions: Record<string, Sale["status"][]> = {
    pending: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

// ---- Component ----

const AdminSales = () => {
    const [sales, setSales] = useState<SaleWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [customers, setCustomers] = useState<CustomerOption[]>([]);
    const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

    const [form, setForm] = useState({
        userId: "",
        vehicleId: "",
        saleDate: new Date().toISOString().split("T")[0],
        salePrice: "",
    });

    // ---- Data fetching ----

    const fetchSales = async () => {
        try {
            const data = await salesService.getAll();
            setSales(data);
        } catch {
            toast.error("Gagal memuat data penjualan.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSales(); }, []);

    const loadDropdowns = async () => {
        const [custRes, vehRes] = await Promise.all([
            supabase.from("profiles").select("id, full_name, email"),
            supabase.from("vehicles").select("id, name, price_numeric, status").eq("status", "tersedia"),
        ]);
        setCustomers((custRes.data || []) as CustomerOption[]);
        setVehicles((vehRes.data || []) as VehicleOption[]);
    };

    const openDialog = () => {
        setForm({ userId: "", vehicleId: "", saleDate: new Date().toISOString().split("T")[0], salePrice: "" });
        setDialogOpen(true);
        loadDropdowns();
    };

    // Auto-fill price when vehicle selected
    const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

    useEffect(() => {
        if (selectedVehicle?.price_numeric) {
            setForm((f) => ({ ...f, salePrice: String(selectedVehicle.price_numeric) }));
        }
    }, [form.vehicleId]);

    // ---- Submit ----

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.userId || !form.vehicleId || !form.salePrice || !form.saleDate) {
            toast.error("Semua field wajib diisi.");
            return;
        }

        setSubmitting(true);
        try {
            // salesService.create uses today's date internally, but we modify it via direct insert for custom date
            const { error } = await supabase
                .from("sales")
                .insert({
                    user_id: form.userId,
                    vehicle_id: form.vehicleId,
                    sale_price: Number(form.salePrice),
                    sale_date: form.saleDate,
                    status: "completed",
                });

            if (error) throw new Error(error.message);

            // Mark vehicle as sold
            await supabase
                .from("vehicles")
                .update({ status: "terjual" })
                .eq("id", form.vehicleId);

            toast.success("Penjualan berhasil dicatat!");
            setDialogOpen(false);
            fetchSales();
        } catch (err: any) {
            toast.error(err?.message || "Gagal mencatat penjualan.");
        } finally {
            setSubmitting(false);
        }
    };

    // ---- Status change ----

    const handleStatusChange = async (id: string, newStatus: Sale["status"], vehicleId: string) => {
        setUpdatingId(id);
        try {
            await salesService.updateStatus(id, newStatus, vehicleId);
            toast.success(`Status berhasil diubah ke "${statusLabels[newStatus]}".`);
            await fetchSales();
        } catch {
            toast.error("Gagal mengubah status.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Riwayat <span className="text-gradient-gold">Penjualan</span>
                    </h1>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                        Semua transaksi pembelian kendaraan
                    </p>
                </div>
                <Button onClick={openDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Catat Penjualan Baru
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : sales.length === 0 ? (
                <div className="mt-12 flex flex-col items-center gap-3 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
                    <p className="font-body text-muted-foreground">Belum ada data penjualan.</p>
                </div>
            ) : (
                <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/50">
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Kendaraan</th>
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Pembeli</th>
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Tanggal</th>
                                <th className="px-4 py-3 text-right font-display text-xs uppercase tracking-wider text-muted-foreground">Harga</th>
                                <th className="px-4 py-3 text-center font-display text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-center font-display text-xs uppercase tracking-wider text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((s) => (
                                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {s.vehicles?.image && (
                                                <img src={s.vehicles.image} alt="" className="h-10 w-14 rounded object-cover" />
                                            )}
                                            <span className="font-display text-sm font-semibold text-foreground">
                                                {s.vehicles?.name || "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-body text-sm text-foreground">
                                        {s.profiles?.full_name || "-"}
                                        <br />
                                        <span className="text-xs text-muted-foreground">{s.profiles?.phone || ""}</span>
                                    </td>
                                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                                        {s.sale_date}
                                    </td>
                                    <td className="px-4 py-3 text-right font-display text-sm font-semibold text-foreground">
                                        Rp {Number(s.sale_price).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block rounded-full border px-3 py-1 font-display text-xs font-semibold uppercase ${statusColors[s.status]}`}>
                                            {statusLabels[s.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {nextStatusOptions[s.status].length > 0 ? (
                                            <div className="inline-flex gap-1">
                                                {nextStatusOptions[s.status].map((ns) => (
                                                    <button
                                                        key={ns}
                                                        onClick={() => handleStatusChange(s.id, ns, s.vehicle_id)}
                                                        disabled={updatingId === s.id}
                                                        className={`rounded-lg px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105 disabled:opacity-50 ${ns === "completed"
                                                            ? "bg-green-500 text-white"
                                                            : "bg-red-500/10 text-red-500"
                                                            }`}
                                                    >
                                                        {updatingId === s.id ? "..." : statusLabels[ns]}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="font-body text-xs text-muted-foreground">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ===== Dialog: Catat Penjualan Baru ===== */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-display">Catat Penjualan Baru</DialogTitle>
                        <DialogDescription>
                            Catat pembelian kendaraan secara manual setelah deal via WhatsApp.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        {/* Pembeli */}
                        <div className="space-y-2">
                            <Label>Pembeli *</Label>
                            <select
                                value={form.userId}
                                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                                required
                                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                            >
                                <option value="">— Pilih pembeli —</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.full_name} ({c.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Kendaraan */}
                        <div className="space-y-2">
                            <Label>Kendaraan *</Label>
                            <select
                                value={form.vehicleId}
                                onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
                                required
                                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                            >
                                <option value="">— Pilih kendaraan —</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.name} (Rp {Number(v.price_numeric).toLocaleString("id-ID")})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tanggal Transaksi */}
                        <div className="space-y-2">
                            <Label>Tanggal Transaksi *</Label>
                            <Input
                                type="date"
                                value={form.saleDate}
                                onChange={(e) => setForm((f) => ({ ...f, saleDate: e.target.value }))}
                                required
                            />
                        </div>

                        {/* Harga Deal */}
                        <div className="space-y-2">
                            <Label>Harga Deal (Rp) *</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="Harga jual final"
                                value={form.salePrice}
                                onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                                required
                            />
                            {selectedVehicle && (
                                <p className="text-xs text-muted-foreground">
                                    Harga listing: Rp {Number(selectedVehicle.price_numeric).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={submitting} className="gap-2">
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? "Menyimpan..." : "Simpan Penjualan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSales;
