import { useState, useEffect } from "react";
import { Users, Loader2, KeyRound, ShoppingCart, UserPlus, RefreshCw, Eye, EyeOff, Pencil, ImageIcon } from "lucide-react";
import { customerService, type CustomerWithCounts } from "@/lib/customerService";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function generatePassword(length = 12): string {
    const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map((b) => chars[b % chars.length])
        .join("");
}

const AdminCustomers = () => {
    const [customers, setCustomers] = useState<CustomerWithCounts[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // ---- Create Dialog ----
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        fullName: "", email: "", password: "", phone: "", address: "",
    });

    // ---- Edit Dialog ----
    const [editOpen, setEditOpen] = useState(false);
    const [editCustomer, setEditCustomer] = useState<CustomerWithCounts | null>(null);
    const [editForm, setEditForm] = useState({
        fullName: "", phone: "", address: "",
    });
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [uploadingCard, setUploadingCard] = useState(false);

    // ---- KTP Preview Dialog ----
    const [ktpPreviewUrl, setKtpPreviewUrl] = useState<string | null>(null);

    const loadCustomers = () => {
        setLoading(true);
        customerService
            .getAll()
            .then(setCustomers)
            .catch(() => toast.error("Gagal memuat data pelanggan."))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadCustomers(); }, []);

    const resetForm = () => {
        setForm({ fullName: "", email: "", password: "", phone: "", address: "" });
        setShowPassword(false);
    };

    // ---- Create Member ----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.fullName || !form.email || !form.password) {
            toast.error("Nama, Email, dan Password wajib diisi.");
            return;
        }
        if (form.password.length < 6) {
            toast.error("Password minimal 6 karakter.");
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke("create-user", {
                body: {
                    email: form.email,
                    password: form.password,
                    fullName: form.fullName,
                    phone: form.phone,
                    address: form.address,
                },
            });

            if (error) {
                let serverMessage = "Gagal membuat member.";
                try {
                    if (error.context && typeof error.context.json === "function") {
                        const errorBody = await error.context.json();
                        serverMessage = errorBody?.error || serverMessage;
                    } else if (error.message) {
                        serverMessage = error.message;
                    }
                } catch {
                    serverMessage = error.message || serverMessage;
                }
                toast.error(serverMessage);
                return;
            }

            if (data?.error) {
                toast.error(data.error);
                return;
            }

            toast.success("Member berhasil dibuat!");
            setDialogOpen(false);
            resetForm();
            loadCustomers();
        } catch (err: any) {
            toast.error(err?.message || "Terjadi kesalahan.");
        } finally {
            setSubmitting(false);
        }
    };

    // ---- Open Edit ----
    const openEdit = (c: CustomerWithCounts) => {
        setEditCustomer(c);
        setEditForm({
            fullName: c.full_name || "",
            phone: c.phone || "",
            address: c.address || "",
        });
        setIdCardFile(null);
        setEditOpen(true);
    };

    // ---- Submit Edit ----
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCustomer) return;

        setSubmitting(true);
        try {
            let idCardUrl = editCustomer.id_card_url || undefined;

            // Upload ID card if file selected
            if (idCardFile) {
                setUploadingCard(true);
                const ext = idCardFile.name.split(".").pop();
                const filePath = `${editCustomer.id}/ktp_${Date.now()}.${ext}`;

                const { error: uploadErr } = await supabase.storage
                    .from("id-cards")
                    .upload(filePath, idCardFile, { upsert: true });

                if (uploadErr) {
                    toast.error("Gagal upload KTP: " + uploadErr.message);
                    setSubmitting(false);
                    setUploadingCard(false);
                    return;
                }

                const { data: urlData } = supabase.storage
                    .from("id-cards")
                    .getPublicUrl(filePath);

                idCardUrl = urlData.publicUrl;
                setUploadingCard(false);
            }

            // Update profile
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: editForm.fullName,
                    phone: editForm.phone,
                    address: editForm.address,
                    ...(idCardUrl ? { id_card_url: idCardUrl } : {}),
                })
                .eq("id", editCustomer.id);

            if (error) throw new Error(error.message);

            toast.success("Data pelanggan berhasil diperbarui!");
            setEditOpen(false);
            setEditCustomer(null);
            loadCustomers();
        } catch (err: any) {
            toast.error(err?.message || "Gagal memperbarui data.");
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = customers.filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (c.full_name || "").toLowerCase().includes(q) ||
            (c.phone || "").toLowerCase().includes(q) ||
            (c.address || "").toLowerCase().includes(q) ||
            (c.email || "").toLowerCase().includes(q)
        );
    });

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Data <span className="text-gradient-gold">Pelanggan</span>
                    </h1>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                        {customers.length} pelanggan terdaftar
                    </p>
                </div>

                {/* Add Member Dialog */}
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Tambah Member Baru
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-display">Tambah Member Baru</DialogTitle>
                            <DialogDescription>Buat akun member baru. Member langsung bisa login.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nama Lengkap *</Label>
                                <Input id="fullName" placeholder="Nama lengkap" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" type="email" placeholder="email@contoh.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="Minimal 6 karakter" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={6} />
                                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <Button type="button" variant="outline" size="icon" title="Generate password" onClick={() => { setForm((f) => ({ ...f, password: generatePassword() })); setShowPassword(true); }}>
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">No. HP</Label>
                                <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Input id="address" placeholder="Alamat lengkap" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Batal</Button>
                                <Button type="submit" disabled={submitting} className="gap-2">
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {submitting ? "Menyimpan..." : "Simpan Member"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="mt-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, email, HP, atau alamat..."
                    className="w-full max-w-md rounded-lg border border-border bg-secondary px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="mt-12 flex flex-col items-center gap-3 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/40" />
                    <p className="font-body text-muted-foreground">Tidak ada data pelanggan.</p>
                </div>
            ) : (
                <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/50">
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Nama</th>
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Telepon</th>
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Alamat</th>
                                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-muted-foreground">Role</th>
                                <th className="px-4 py-3 text-center font-display text-xs uppercase tracking-wider text-muted-foreground">KTP</th>
                                <th className="px-4 py-3 text-center font-display text-xs uppercase tracking-wider text-muted-foreground">Sewa</th>
                                <th className="px-4 py-3 text-center font-display text-xs uppercase tracking-wider text-muted-foreground">Beli</th>
                                <th className="px-4 py-3 text-center font-display text-xs uppercase tracking-wider text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                                <Users className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <span className="font-display text-sm font-semibold text-foreground">{c.full_name || "—"}</span>
                                                <p className="text-xs text-muted-foreground">{c.email || ""}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">{c.phone || "—"}</td>
                                    <td className="px-4 py-3 font-body text-sm text-muted-foreground max-w-[200px] truncate">{c.address || "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 font-display text-xs font-semibold uppercase ${c.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                                            {c.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {c.id_card_url ? (
                                            <button onClick={() => setKtpPreviewUrl(c.id_card_url!)} className="mx-auto block">
                                                <img src={c.id_card_url} alt="KTP" className="h-8 w-12 rounded border border-border object-cover hover:scale-110 transition-transform" />
                                            </button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 font-display text-sm font-semibold text-foreground">
                                            <KeyRound className="h-3.5 w-3.5 text-blue-500" />
                                            {c.rental_count}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 font-display text-sm font-semibold text-foreground">
                                            <ShoppingCart className="h-3.5 w-3.5 text-green-500" />
                                            {c.sale_count}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => openEdit(c)}
                                            className="rounded-lg bg-secondary px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-foreground transition-all hover:bg-accent"
                                        >
                                            <Pencil className="inline h-3.5 w-3.5 mr-1" />
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ===== Dialog: Edit Pelanggan ===== */}
            <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditCustomer(null); setIdCardFile(null); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-display">Edit Pelanggan</DialogTitle>
                        <DialogDescription>{editCustomer?.email}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nama Lengkap</Label>
                            <Input value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <Label>No. HP</Label>
                            <Input type="tel" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Alamat</Label>
                            <Input value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
                        </div>

                        {/* KTP Upload */}
                        <div className="space-y-2">
                            <Label>Foto KTP / SIM</Label>
                            {editCustomer?.id_card_url && (
                                <div className="mb-2">
                                    <img src={editCustomer.id_card_url} alt="KTP saat ini" className="h-20 rounded-lg border border-border object-cover" />
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                                    className="flex-1"
                                />
                                {idCardFile && (
                                    <span className="text-xs text-muted-foreground">{(idCardFile.size / 1024).toFixed(0)} KB</span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Upload foto KTP/SIM untuk verifikasi identitas</p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>Batal</Button>
                            <Button type="submit" disabled={submitting || uploadingCard} className="gap-2">
                                {(submitting || uploadingCard) && <Loader2 className="h-4 w-4 animate-spin" />}
                                {uploadingCard ? "Mengupload..." : submitting ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ===== Dialog: KTP Preview ===== */}
            <Dialog open={!!ktpPreviewUrl} onOpenChange={() => setKtpPreviewUrl(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="font-display">Foto KTP / SIM</DialogTitle>
                    </DialogHeader>
                    {ktpPreviewUrl && (
                        <img src={ktpPreviewUrl} alt="KTP" className="w-full rounded-lg border border-border" />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCustomers;
