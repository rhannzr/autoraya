import { useState, useEffect } from "react";
import { KeyRound, Loader2, Plus, Pencil } from "lucide-react";
import { rentalService, type RentalWithDetails, type Rental } from "@/lib/rentalService";
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
interface VehicleOption { id: string; name: string; rental_price: number | null; status: string }

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    active: "Aktif",
    completed: "Selesai",
    cancelled: "Dibatalkan",
};

const nextStatusOptions: Record<string, Rental["status"][]> = {
    pending: ["active", "cancelled"],
    active: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

function daysBetween(a: string, b: string): number {
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(Math.ceil(ms / 86_400_000), 1);
}

// ---- Component ----

const AdminRentals = () => {
    const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("semua");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // ---- Create Dialog ----
    const [createOpen, setCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [customers, setCustomers] = useState<CustomerOption[]>([]);
    const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
    const [createForm, setCreateForm] = useState({
        userId: "", vehicleId: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "", totalPrice: "",
    });

    // ---- Edit Dialog ----
    const [editOpen, setEditOpen] = useState(false);
    const [editingRental, setEditingRental] = useState<RentalWithDetails | null>(null);
    const [editForm, setEditForm] = useState({
        startDate: "", endDate: "", totalPrice: "",
    });

    // ---- Data fetching ----

    const fetchRentals = async () => {
        try {
            const data = await rentalService.getAll();
            setRentals(data);
        } catch (err) {
            toast.error("Gagal memuat data sewa.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRentals(); }, []);

    const loadDropdowns = async () => {
        const [custRes, vehRes] = await Promise.all([
            supabase.from("profiles").select("id, full_name, email"),
            supabase.from("vehicles").select("id, name, rental_price, status").eq("status", "tersedia"),
        ]);
        setCustomers((custRes.data || []) as CustomerOption[]);
        setVehicles((vehRes.data || []) as VehicleOption[]);
    };

    const openCreate = () => {
        setCreateForm({ userId: "", vehicleId: "", startDate: new Date().toISOString().split("T")[0], endDate: "", totalPrice: "" });
        setCreateOpen(true);
        loadDropdowns();
    };

    const openEdit = (r: RentalWithDetails) => {
        setEditingRental(r);
        setEditForm({
            startDate: r.start_date,
            endDate: r.end_date,
            totalPrice: String(r.total_price),
        });
        setEditOpen(true);
    };

    // ---- Auto-calc price (create) ----

    const selectedVehicle = vehicles.find((v) => v.id === createForm.vehicleId);

    useEffect(() => {
        if (createForm.startDate && createForm.endDate && selectedVehicle?.rental_price) {
            const days = daysBetween(createForm.startDate, createForm.endDate);
            setCreateForm((f) => ({ ...f, totalPrice: String(days * selectedVehicle.rental_price!) }));
        }
    }, [createForm.startDate, createForm.endDate, createForm.vehicleId]);

    // ---- Submit: Create ----

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.userId || !createForm.vehicleId || !createForm.startDate || !createForm.endDate || !createForm.totalPrice) {
            toast.error("Semua field wajib diisi.");
            return;
        }
        if (createForm.endDate <= createForm.startDate) {
            toast.error("Tanggal selesai harus setelah tanggal mulai.");
            return;
        }

        setSubmitting(true);
        try {
            await rentalService.create({
                user_id: createForm.userId,
                vehicle_id: createForm.vehicleId,
                start_date: createForm.startDate,
                end_date: createForm.endDate,
                total_price: Number(createForm.totalPrice),
            });
            toast.success("Sewa berhasil dicatat!");
            setCreateOpen(false);
            fetchRentals();
        } catch (err: any) {
            toast.error(err?.message || "Gagal mencatat sewa.");
        } finally {
            setSubmitting(false);
        }
    };

    // ---- Submit: Edit ----

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRental) return;

        setSubmitting(true);
        try {
            await rentalService.update(editingRental.id, {
                start_date: editForm.startDate,
                end_date: editForm.endDate,
                total_price: Number(editForm.totalPrice),
            });
            toast.success("Data sewa berhasil diperbarui!");
            setEditOpen(false);
            setEditingRental(null);
            fetchRentals();
        } catch (err: any) {
            toast.error(err?.message || "Gagal memperbarui data sewa.");
        } finally {
            setSubmitting(false);
        }
    };

    // ---- Status change (with $0 price guard) ----

    const handleStatusChange = async (id: string, newStatus: Rental["status"], vehicleId: string) => {
        // If activating a rental, ensure total_price is valid
        if (newStatus === "active") {
            try {
                // Fetch latest rental data to ensure we have current state
                const { data: rental, error: rentalError } = await supabase
                    .from("rentals")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (rentalError) throw new Error("Gagal mengambil data rental terbaru");

                if (rental && (!rental.total_price || Number(rental.total_price) === 0)) {
                    // Try to calculate from vehicle rental_price
                    const { data: veh } = await supabase.from("vehicles").select("rental_price").eq("id", vehicleId).single();

                    if (veh?.rental_price && rental.start_date && rental.end_date) {
                        const days = daysBetween(rental.start_date, rental.end_date);
                        const calcPrice = days * Number(veh.rental_price);

                        // Update price first
                        const { error: updateError } = await supabase
                            .from("rentals")
                            .update({ total_price: calcPrice })
                            .eq("id", id);

                        if (updateError) throw new Error(`Gagal update harga otomatis: ${updateError.message}`);
                    } else {
                        console.warn("Cannot auto-calculate price: missing vehicle price or dates");
                    }
                }
            } catch (err: any) {
                console.error("Auto-calc price error:", err);
                toast.error(`Gagal menghitung harga otomatis: ${err.message || "Unknown error"}`);
                return; // Stop status update if price calculation fails
            }
        }

        setUpdatingId(id);
        try {
            await rentalService.updateStatus(id, newStatus, vehicleId);
            toast.success(`Status berhasil diubah ke "${statusLabels[newStatus]}".`);
            await fetchRentals();
        } catch (err: any) {
            console.error("Failed to update status:", err);
            toast.error(`Gagal mengubah status: ${err.message || "Unknown error"}`);
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = filter === "semua" ? rentals : rentals.filter((r) => r.status === filter);

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Daftar <span className="text-gradient-gold">Sewa</span>
                    </h1>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                        Kelola semua pesanan sewa kendaraan
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Catat Sewa Baru
                </Button>
            </div>

            {/* Filter tabs */}
            <div className="mt-6 flex gap-2 flex-wrap">
                {["semua", "pending", "active", "completed", "cancelled"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`rounded-lg px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider transition-colors ${filter === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {s === "semua" ? "Semua" : statusLabels[s]} ({s === "semua" ? rentals.length : rentals.filter((r) => r.status === s).length})
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="mt-12 flex flex-col items-center gap-3 text-center">
                    <KeyRound className="h-12 w-12 text-muted-foreground/40" />
                    <p className="font-body text-muted-foreground">Tidak ada data sewa.</p>
                </div>
            ) : (
                <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/50">
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Kendaraan</th>
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Penyewa</th>
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Periode</th>
                                <th className="px-4 py-3 text-right font-display text-xs uppercase tracking-wider text-muted-foreground">Total</th>
                                <th className="px-4 py-3 text-center font-display text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-center font-display text-xs uppercase tracking-wider text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {r.vehicles?.image && (
                                                <img src={r.vehicles.image} alt="" className="h-10 w-14 rounded object-cover" />
                                            )}
                                            <span className="font-display text-sm font-semibold text-foreground">
                                                {r.vehicles?.name || "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-body text-sm text-foreground">
                                        {r.profiles?.full_name || "-"}
                                        <br />
                                        <span className="text-xs text-muted-foreground">{r.profiles?.phone || ""}</span>
                                    </td>
                                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                                        {r.start_date} → {r.end_date}
                                    </td>
                                    <td className="px-4 py-3 text-right font-display text-sm font-semibold text-foreground">
                                        Rp {Number(r.total_price).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block rounded-full border px-3 py-1 font-display text-xs font-semibold uppercase ${statusColors[r.status]}`}>
                                            {statusLabels[r.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="inline-flex gap-1 items-center">
                                            {/* Edit button */}
                                            <button
                                                onClick={() => openEdit(r)}
                                                className="rounded-lg bg-secondary px-2.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-foreground transition-all hover:bg-accent"
                                                title="Edit sewa"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>

                                            {nextStatusOptions[r.status].map((ns) => (
                                                <button
                                                    key={ns}
                                                    onClick={() => handleStatusChange(r.id, ns, r.vehicle_id)} // ns is already typed as Rental["status"] which are "active", "completed", "cancelled"
                                                    disabled={updatingId === r.id}
                                                    className={`rounded-lg px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105 disabled:opacity-50 ${ns === "active"
                                                        ? "bg-blue-500 text-white"
                                                        : ns === "completed"
                                                            ? "bg-green-500 text-white"
                                                            : "bg-red-500/10 text-red-500"
                                                        }`}
                                                >
                                                    {updatingId === r.id ? "..." : statusLabels[ns]}
                                                </button>
                                            ))}
                                            {nextStatusOptions[r.status].length === 0 && (
                                                <span className="font-body text-xs text-muted-foreground">—</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ===== Dialog: Catat Sewa Baru ===== */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-display">Catat Sewa Baru</DialogTitle>
                        <DialogDescription>Catat sewa manual setelah deal via WhatsApp.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Penyewa *</Label>
                            <select value={createForm.userId} onChange={(e) => setCreateForm((f) => ({ ...f, userId: e.target.value }))} required className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground">
                                <option value="">— Pilih penyewa —</option>
                                {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kendaraan *</Label>
                            <select value={createForm.vehicleId} onChange={(e) => setCreateForm((f) => ({ ...f, vehicleId: e.target.value }))} required className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground">
                                <option value="">— Pilih kendaraan —</option>
                                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} {v.rental_price ? `(Rp ${Number(v.rental_price).toLocaleString("id-ID")}/hari)` : ""}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Tanggal Mulai *</Label>
                                <Input type="date" value={createForm.startDate} onChange={(e) => setCreateForm((f) => ({ ...f, startDate: e.target.value }))} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal Selesai *</Label>
                                <Input type="date" value={createForm.endDate} min={createForm.startDate} onChange={(e) => setCreateForm((f) => ({ ...f, endDate: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Total Harga (Rp) *</Label>
                            <Input type="number" min={0} placeholder="Otomatis, bisa diedit" value={createForm.totalPrice} onChange={(e) => setCreateForm((f) => ({ ...f, totalPrice: e.target.value }))} required />
                            {selectedVehicle?.rental_price && createForm.startDate && createForm.endDate && createForm.endDate > createForm.startDate && (
                                <p className="text-xs text-muted-foreground">
                                    {daysBetween(createForm.startDate, createForm.endDate)} hari × Rp {Number(selectedVehicle.rental_price).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>Batal</Button>
                            <Button type="submit" disabled={submitting} className="gap-2">
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? "Menyimpan..." : "Simpan Sewa"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ===== Dialog: Edit Sewa ===== */}
            <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditingRental(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-display">Edit Data Sewa</DialogTitle>
                        <DialogDescription>
                            {editingRental?.vehicles?.name} — {editingRental?.profiles?.full_name}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Tanggal Mulai</Label>
                                <Input type="date" value={editForm.startDate} onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal Selesai</Label>
                                <Input type="date" value={editForm.endDate} min={editForm.startDate} onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Total Harga (Rp)</Label>
                            <Input type="number" min={0} value={editForm.totalPrice} onChange={(e) => setEditForm((f) => ({ ...f, totalPrice: e.target.value }))} required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>Batal</Button>
                            <Button type="submit" disabled={submitting} className="gap-2">
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminRentals;
