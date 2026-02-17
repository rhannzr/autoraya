import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, HelpCircle, Tag } from "lucide-react";
import { contentService, type FAQ } from "@/lib/contentService";
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
import { Badge } from "@/components/ui/badge";

const AdminFAQ = () => {
    const [data, setData] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FAQ | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        question: "",
        answer: "",
        category: "Umum",
    });

    // Delete State
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await contentService.getFAQs();
            setData(res);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data FAQ.");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingItem(null);
        setForm({ question: "", answer: "", category: "Umum" });
        setDialogOpen(true);
    };

    const openEdit = (item: FAQ) => {
        setEditingItem(item);
        setForm({
            question: item.question,
            answer: item.answer,
            category: item.category || "Umum",
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
                await contentService.updateFAQ(editingItem.id, form);
                toast.success("FAQ diperbarui!");
            } else {
                await contentService.createFAQ(form);
                toast.success("FAQ ditambahkan!");
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
            await contentService.deleteFAQ(itemToDelete);
            toast.success("FAQ dihapus.");
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
                        Kelola <span className="text-gradient-gold">FAQ</span>
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Daftar pertanyaan umum yang tampil di halaman depan.
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> Tambah FAQ
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
                                <TableHead>Pertanyaan</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Jawaban</TableHead>
                                <TableHead className="text-center w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Belum ada FAQ.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium align-top">
                                            <div className="flex gap-2">
                                                <HelpCircle className="h-4 w-4 text-primary mt-1 shrink-0" />
                                                <span>{item.question}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <Badge variant="secondary" className="font-normal">
                                                {item.category || "Umum"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground align-top whitespace-pre-wrap max-w-md">
                                            {item.answer}
                                        </TableCell>
                                        <TableCell className="text-center align-top">
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
                        <DialogTitle>{editingItem ? "Edit FAQ" : "Tambah FAQ"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="Umum">Umum</option>
                                <option value="Syarat">Syarat & Ketentuan</option>
                                <option value="Pembayaran">Pembayaran</option>
                                <option value="Layanan">Layanan</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Pertanyaan</Label>
                            <Input
                                value={form.question}
                                onChange={(e) => setForm({ ...form, question: e.target.value })}
                                required
                                placeholder="Contoh: Bagaimana cara sewa?"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jawaban</Label>
                            <Textarea
                                value={form.answer}
                                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                                required
                                placeholder="Jelaskan jawabannya secara detail..."
                                rows={5}
                            />
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
                        <AlertDialogTitle>Hapus FAQ?</AlertDialogTitle>
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

export default AdminFAQ;
