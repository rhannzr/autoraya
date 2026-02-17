import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Star, User } from "lucide-react";
import { contentService, type Testimonial } from "@/lib/contentService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

const AdminTestimonials = () => {
    const [data, setData] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        name: "",
        role: "",
        content: "",
        rating: 5,
        image: "",
    });

    // Delete State
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await contentService.getTestimonials();
            setData(res);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data testimoni.");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingItem(null);
        setForm({ name: "", role: "", content: "", rating: 5, image: "" });
        setDialogOpen(true);
    };

    const openEdit = (item: Testimonial) => {
        setEditingItem(item);
        setForm({
            name: item.name,
            role: item.role,
            content: item.content,
            rating: item.rating,
            image: item.image,
        });
        setDialogOpen(true);
    };

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setDeleteOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingItem) {
                await contentService.updateTestimonial(editingItem.id, form);
                toast.success("Testimoni diperbarui!");
            } else {
                await contentService.createTestimonial(form);
                toast.success("Testimoni ditambahkan!");
            }
            setDialogOpen(false);
            loadData();
        } catch (error: any) {
            toast.error(error.message || "Gagal menyimpan data.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await contentService.deleteTestimonial(itemToDelete);
            toast.success("Testimoni dihapus.");
            loadData();
        } catch (error: any) {
            toast.error(error.message || "Gagal menghapus.");
        } finally {
            setDeleteOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Kelola <span className="text-gradient-gold">Testimoni</span>
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Daftar ulasan pelanggan yang tampil di halaman depan.
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> Tambah Testimoni
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Ulasan</TableHead>
                                <TableHead className="text-center">Rating</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Belum ada testimoni.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {item.image ? (
                                                    <img src={item.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-foreground">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.role}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate text-muted-foreground" title={item.content}>
                                            "{item.content}"
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{item.rating}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                                                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => confirmDelete(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Testimoni" : "Tambah Testimoni"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nama Lengkap</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    placeholder="Contoh: Budi Santoso"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Peran / Pekerjaan</Label>
                                <Input
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    required
                                    placeholder="Contoh: Pengusaha"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>URL Foto (Opsional)</Label>
                            <Input
                                value={form.image}
                                onChange={(e) => setForm({ ...form, image: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Isi Ulasan</Label>
                            <Textarea
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                required
                                placeholder="Tulis pengalaman pelanggan..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rating (1-5)</Label>
                            <select
                                value={form.rating}
                                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            >
                                <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                                <option value={4}>⭐⭐⭐⭐ (4)</option>
                                <option value={3}>⭐⭐⭐ (3)</option>
                                <option value={2}>⭐⭐ (2)</option>
                                <option value={1}>⭐ (1)</option>
                            </select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={submitting} className="gap-2">
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Testimoni?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data akan hilang permanen dari database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminTestimonials;
