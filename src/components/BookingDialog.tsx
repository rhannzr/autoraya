import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInCalendarDays } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, MessageCircle, Send, User, Phone, FileText, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { rentalService } from "@/lib/rentalService";
import { salesService } from "@/lib/salesService";

interface BookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle: {
        id: string;
        name: string;
        year: number;
        price: string;
        priceNumeric: number;
        rentalPrice?: string;
        seller: {
            phone: string;
            name: string;
        };
    };
    defaultTab?: "sewa" | "beli";
}

const BookingDialog = ({
    open,
    onOpenChange,
    vehicle,
    defaultTab = "sewa",
}: BookingDialogProps) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Rental form state
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [rentalName, setRentalName] = useState("");
    const [rentalPhone, setRentalPhone] = useState("");
    const [rentalNote, setRentalNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submittingPurchase, setSubmittingPurchase] = useState(false);

    // Purchase form state
    const [buyName, setBuyName] = useState("");
    const [buyPhone, setBuyPhone] = useState("");
    const [buyMessage, setBuyMessage] = useState("");

    // Computed rental price
    const rentalPriceNum = Number(vehicle.rentalPrice) || 0;
    const rentalDays =
        startDate && endDate
            ? Math.max(differenceInCalendarDays(endDate, startDate), 1)
            : 0;
    const totalRentalPrice = rentalDays * rentalPriceNum;

    // ---- Rental: Instant Booking ----
    const handleInstantBooking = async () => {
        if (!user) {
            toast.error("Anda harus login terlebih dahulu.");
            onOpenChange(false);
            navigate("/login");
            return;
        }
        if (!startDate || !endDate) {
            toast.error("Mohon pilih tanggal sewa.");
            return;
        }
        if (endDate <= startDate) {
            toast.error("Tanggal selesai harus setelah tanggal mulai.");
            return;
        }

        setSubmitting(true);
        try {
            await rentalService.create({
                user_id: user.id,
                vehicle_id: vehicle.id,
                start_date: format(startDate, "yyyy-MM-dd"),
                end_date: format(endDate, "yyyy-MM-dd"),
                total_price: totalRentalPrice,
            });
            toast.success("Pengajuan berhasil! Admin akan menghubungi via WhatsApp.");
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err?.message || "Gagal mengajukan sewa.");
        } finally {
            setSubmitting(false);
        }
    };

    // ---- WhatsApp Links ----
    const generateRentalWhatsAppLink = () => {
        if (!rentalName || !rentalPhone) {
            toast.error("Mohon lengkapi nama dan nomor HP Anda.");
            return null;
        }
        if (!startDate || !endDate) {
            toast.error("Mohon pilih tanggal sewa.");
            return null;
        }

        const dateStr = `${format(startDate, "dd MMM yyyy", { locale: id })} - ${format(endDate, "dd MMM yyyy", { locale: id })}`;
        const text = [
            `Halo ${vehicle.seller.name},`,
            ``,
            `Saya ingin menyewa kendaraan berikut:`,
            `🚗 *${vehicle.name}* (${vehicle.year})`,
            `💰 Harga sewa: ${formatCurrency(rentalPriceNum)}/hari`,
            `📅 Tanggal: ${dateStr}`,
            `💵 Estimasi total: ${formatCurrency(totalRentalPrice)}`,
            ``,
            `Data Pemesan:`,
            `👤 Nama: ${rentalName}`,
            `📱 HP: ${rentalPhone}`,
            rentalNote ? `📝 Catatan: ${rentalNote}` : "",
            ``,
            `Mohon konfirmasi ketersediaannya. Terima kasih!`,
        ]
            .filter(Boolean)
            .join("\n");

        return `https://wa.me/${vehicle.seller.phone}?text=${encodeURIComponent(text)}`;
    };

    const generatePurchaseWhatsAppLink = () => {
        if (!buyName || !buyPhone) {
            toast.error("Mohon lengkapi nama dan nomor HP Anda.");
            return null;
        }

        const text = [
            `Halo ${vehicle.seller.name},`,
            ``,
            `Saya tertarik untuk membeli kendaraan berikut:`,
            `🚗 *${vehicle.name}* (${vehicle.year})`,
            `💰 Harga: ${formatCurrency(vehicle.priceNumeric)}`,
            ``,
            `Data Calon Pembeli:`,
            `👤 Nama: ${buyName}`,
            `📱 HP: ${buyPhone}`,
            buyMessage ? `💬 Pesan: ${buyMessage}` : "",
            ``,
            `Apakah kendaraan masih tersedia? Terima kasih!`,
        ]
            .filter(Boolean)
            .join("\n");

        return `https://wa.me/${vehicle.seller.phone}?text=${encodeURIComponent(text)}`;
    };

    const handleRentalSubmit = () => {
        const link = generateRentalWhatsAppLink();
        if (link) {
            window.open(link, "_blank");
            toast.success("Mengarahkan ke WhatsApp...");
            onOpenChange(false);
        }
    };

    const handlePurchaseSubmit = () => {
        const link = generatePurchaseWhatsAppLink();
        if (link) {
            window.open(link, "_blank");
            toast.success("Mengarahkan ke WhatsApp...");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-card-foreground">
                        {vehicle.name}
                    </DialogTitle>
                    <DialogDescription className="font-body text-muted-foreground">
                        Tahun {vehicle.year} • {formatCurrency(vehicle.priceNumeric)}
                        {vehicle.rentalPrice && ` • Sewa ${formatCurrency(rentalPriceNum)}/hari`}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="mt-2">
                    <TabsList className="grid w-full grid-cols-2 bg-secondary">
                        <TabsTrigger
                            value="sewa"
                            className="font-display text-sm uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            disabled={!vehicle.rentalPrice}
                        >
                            Sewa / Rental
                        </TabsTrigger>
                        <TabsTrigger
                            value="beli"
                            className="font-display text-sm uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            Beli
                        </TabsTrigger>
                    </TabsList>

                    {/* Rental Tab */}
                    <TabsContent value="sewa" className="mt-4 space-y-4">
                        {/* Date pickers */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Tanggal Mulai
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className={cn(
                                                "flex w-full items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-primary",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="h-4 w-4" />
                                            {startDate ? format(startDate, "dd MMM yyyy", { locale: id }) : "Pilih tanggal"}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto border-border bg-card p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Tanggal Selesai
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className={cn(
                                                "flex w-full items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-primary",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="h-4 w-4" />
                                            {endDate ? format(endDate, "dd MMM yyyy", { locale: id }) : "Pilih tanggal"}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto border-border bg-card p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            disabled={(date) => date < (startDate || new Date())}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Price estimate */}
                        {rentalDays > 0 && rentalPriceNum > 0 && (
                            <div className="rounded-lg bg-accent/30 p-3">
                                <p className="font-body text-xs text-muted-foreground">
                                    {rentalDays} hari × {formatCurrency(rentalPriceNum)} ={" "}
                                    <span className="font-display font-bold text-primary">{formatCurrency(totalRentalPrice)}</span>
                                </p>
                            </div>
                        )}

                        {/* Personal info */}
                        <div className="space-y-2">
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Nama Lengkap
                            </Label>
                            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={rentalName}
                                    onChange={(e) => setRentalName(e.target.value)}
                                    placeholder="Masukkan nama Anda"
                                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Nomor HP / WhatsApp
                            </Label>
                            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={rentalPhone}
                                    onChange={(e) => setRentalPhone(e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Catatan (Opsional)
                            </Label>
                            <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary px-3 pt-2">
                                <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <Textarea
                                    value={rentalNote}
                                    onChange={(e) => setRentalNote(e.target.value)}
                                    placeholder="Permintaan khusus, lokasi antar jemput, dll."
                                    className="min-h-[60px] border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Submit buttons */}
                        <div className="flex flex-col gap-2 pt-2">
                            {/* Instant Booking – creates a pending rental */}
                            <button
                                onClick={handleInstantBooking}
                                disabled={submitting}
                                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-gold py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                                {submitting ? "Memproses..." : "Ajukan Sewa Sekarang"}
                            </button>
                            <button
                                onClick={handleRentalSubmit}
                                className="flex items-center justify-center gap-2 rounded-lg bg-[hsl(142,70%,40%)] py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[hsl(142,70%,35%)]"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Kirim via WhatsApp
                            </button>
                        </div>
                    </TabsContent>

                    {/* Purchase Tab */}
                    <TabsContent value="beli" className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Nama Lengkap
                            </Label>
                            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={buyName}
                                    onChange={(e) => setBuyName(e.target.value)}
                                    placeholder="Masukkan nama Anda"
                                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Nomor HP / WhatsApp
                            </Label>
                            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={buyPhone}
                                    onChange={(e) => setBuyPhone(e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Pesan untuk Penjual
                            </Label>
                            <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary px-3 pt-2">
                                <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <Textarea
                                    value={buyMessage}
                                    onChange={(e) => setBuyMessage(e.target.value)}
                                    placeholder="Pertanyaan atau negosiasi harga..."
                                    className="min-h-[80px] border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Submit buttons */}
                        <div className="flex flex-col gap-2 pt-2">
                            {/* Instant Purchase – creates a pending sale */}
                            <button
                                onClick={async () => {
                                    if (!user) {
                                        toast.error("Anda harus login terlebih dahulu.");
                                        onOpenChange(false);
                                        navigate("/login");
                                        return;
                                    }
                                    setSubmittingPurchase(true);
                                    try {
                                        const noteContent = `Nama: ${buyName}\nNo HP: ${buyPhone}\nPesan: ${buyMessage}`;
                                        await salesService.create({
                                            user_id: user.id,
                                            vehicle_id: vehicle.id,
                                            sale_price: vehicle.priceNumeric,
                                            notes: noteContent,
                                        });
                                        toast.success("Pengajuan pembelian berhasil! Admin akan menghubungi Anda.");
                                        onOpenChange(false);
                                    } catch (err: any) {
                                        toast.error(err?.message || "Gagal mengajukan pembelian.");
                                    } finally {
                                        setSubmittingPurchase(false);
                                    }
                                }}
                                disabled={submittingPurchase}
                                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-gold py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                {submittingPurchase ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                                {submittingPurchase ? "Memproses..." : "Ajukan Pembelian Sekarang"}
                            </button>
                            <button
                                onClick={handlePurchaseSubmit}
                                className="flex items-center justify-center gap-2 rounded-lg bg-[hsl(142,70%,40%)] py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[hsl(142,70%,35%)]"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Hubungi via WhatsApp
                            </button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default BookingDialog;
