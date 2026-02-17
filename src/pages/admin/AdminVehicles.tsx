import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { vehicleService } from "@/lib/vehicleService";
import { type VehicleDetail } from "@/types/vehicle";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const AdminVehicles = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<VehicleDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchVehicles = () => {
        setLoading(true);
        vehicleService
            .getAll()
            .then(setVehicles)
            .catch((err) => {
                console.error("Fetch error:", err);
                toast.error("Gagal memuat data kendaraan.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const filteredVehicles = vehicles.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await vehicleService.delete(deleteId);
            toast.success("Kendaraan berhasil dihapus.");
            fetchVehicles();
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Gagal menghapus kendaraan.");
        } finally {
            setDeleteId(null);
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Kendaraan</h1>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                        Kelola semua data kendaraan
                    </p>
                </div>
                <Link
                    to="/admin/kendaraan/baru"
                    className="flex items-center gap-2 rounded-lg bg-gradient-gold px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-transform hover:scale-105"
                >
                    <Plus className="h-4 w-4" /> Tambah
                </Link>
            </div>

            <div className="relative mt-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama kendaraan..."
                    className="border-border bg-secondary pl-10 text-foreground"
                />
            </div>

            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : (
                <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full min-w-[1200px] text-left text-sm">
                        <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Kendaraan</th>
                                <th className="px-4 py-3">Plat Nomor</th>
                                <th className="px-4 py-3">Warna</th>
                                <th className="px-4 py-3">Specs</th>
                                <th className="px-4 py-3">Pajak</th>
                                <th className="px-4 py-3">Tipe</th>
                                <th className="px-4 py-3">Harga</th>
                                <th className="px-4 py-3">Tahun</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredVehicles.map((v, index) => (
                                <tr key={v.id} className="transition-colors hover:bg-muted/50">
                                    <td className="px-4 py-3 text-muted-foreground font-mono">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={v.image}
                                                alt={v.name}
                                                className="h-10 w-14 rounded-md object-cover"
                                            />
                                            <span className="font-semibold text-foreground">{v.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-foreground">{v.licensePlate || "-"}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{v.color || "-"}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        <div className="flex flex-col text-xs">
                                            <span>{v.engine || "-"}</span>
                                            <span className="opacity-70">{v.capacity ? `${v.capacity} Org` : ""}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {v.taxExpiry ? (
                                            <span className={new Date(v.taxExpiry) < new Date() ? "text-destructive font-bold" : ""}>
                                                {new Date(v.taxExpiry).toLocaleDateString("id-ID")}
                                            </span>
                                        ) : "-"}
                                    </td>
                                    <td className="px-4 py-3 capitalize text-muted-foreground">
                                        {v.type}
                                    </td>
                                    <td className="px-4 py-3 text-foreground">{v.price}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{v.year}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${v.status === "tersedia" ? "bg-green-500/10 text-green-500" :
                                            v.status === "disewa" ? "bg-blue-500/10 text-blue-500" :
                                                "bg-red-500/10 text-red-500"
                                            }`}>
                                            {v.status || "tersedia"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/kendaraan/${v.id}/edit`)}
                                                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(v.id)}
                                                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredVehicles.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                                        Tidak ada kendaraan ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kendaraan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data kendaraan akan dihapus permanen dari database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Menghapus..." : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminVehicles;
