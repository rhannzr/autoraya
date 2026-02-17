import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileText, Download, TrendingUp, ShoppingCart, Key, Calendar } from "lucide-react";
import { salesService, type SaleWithDetails } from "@/lib/salesService";
import { rentalService, type RentalWithDetails } from "@/lib/rentalService";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Transaction {
    id: string;
    type: "sale" | "rental";
    date: string;
    customer: string;
    item: string;
    image?: string;
    total: number;
    status: string;
    rawDate: Date;
}

const AdminReports = () => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

    // Filter state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [startDate, endDate, transactions]);

    const fetchData = async () => {
        try {
            const [salesData, rentalsData] = await Promise.all([
                salesService.getAll(),
                rentalService.getAll(),
            ]);

            const sales: Transaction[] = salesData.map((s) => ({
                id: s.id,
                type: "sale",
                date: s.sale_date,
                customer: s.profiles?.full_name || "Unknown",
                item: s.vehicles?.name || "Unknown",
                image: s.vehicles?.image,
                total: Number(s.sale_price),
                status: s.status,
                rawDate: new Date(s.sale_date),
            }));

            const rentals: Transaction[] = rentalsData.map((r) => ({
                id: r.id,
                type: "rental",
                date: r.start_date, // Using start_date as transaction date
                customer: r.profiles?.full_name || "Unknown",
                item: r.vehicles?.name || "Unknown",
                image: r.vehicles?.image,
                total: Number(r.total_price),
                status: r.status,
                rawDate: new Date(r.start_date),
            }));

            const all = [...sales, ...rentals].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
            setTransactions(all);
        } catch (error) {
            console.error("Failed to fetch report data:", error);
            toast.error("Gagal memuat data laporan.");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let res = [...transactions];

        if (startDate) {
            res = res.filter((t) => t.date >= startDate);
        }
        if (endDate) {
            res = res.filter((t) => t.date <= endDate);
        }

        setFilteredTransactions(res);
    };

    // Stats Calculation
    const completedTransactions = filteredTransactions.filter((t) => t.status === "completed" || t.status === "active"); // Active rentals also count as revenue potentially, but strictly 'completed' usually means paid. Let's stick to 'completed' for Revenue to be safe, or maybe 'active' rentals are effectively revenue generating? 
    // Usually 'completed' sales and 'completed' rentals are finalized revenue. 'active' rentals are ongoing. 
    // Let's assume 'completed' for Sales and 'completed' for Rentals are the realized revenue.
    // However, for Rentals, if they pay upfront, 'active' might be considered. 
    // Let's stick to strict 'completed' for revenue calculation to avoid confusion, or include 'active' if that's the business logic. 
    // The prompt says "Total Pendapatan (Sewa + Jual)". Usually implies realized income.

    // Prompt: "Tabel Gabungan: Tampilkan list transaksi rentals (yang statusnya 'completed') dan sales (yang statusnya 'completed') dalam satu tabel rapi."
    // Ah, the prompt specifically says "transactions rentals (yang statusnya 'completed') dan sales (yang statusnya 'completed')".
    // So the TABLE should only show completed? Or maybe the stats?
    // "Tabel Gabungan: Tampilkan list transaksi rentals (yang statusnya 'completed') dan sales (yang statusnya 'completed')"
    // Okay, I will filter the table to ONLY show completed if that's what is requested.
    // But "Filter Tanggal" implies we might want to see others? 
    // Actually, normally reports show everything, but the revenue aggregation uses completed.
    // The prompt says "Tabel Gabungan: Tampilkan list transaksi rentals (yang statusnya 'completed') dan sales (yang statusnya 'completed')".
    // I will filter the LIST to only show Completed as per instruction for the "Table".
    // Wait, if I only show completed, then the stats should basically mirror the table.

    const completedOnly = filteredTransactions.filter(t => t.status === 'completed');

    const totalRevenue = completedOnly.reduce((acc, t) => acc + t.total, 0);
    const totalTx = completedOnly.length;

    // Best Selling Vehicle
    const vehicleCounts: Record<string, number> = {};
    completedOnly.forEach(t => {
        vehicleCounts[t.item] = (vehicleCounts[t.item] || 0) + 1;
    });
    let bestSeller = "-";
    let maxCount = 0;
    Object.entries(vehicleCounts).forEach(([name, count]) => {
        if (count > maxCount) {
            maxCount = count;
            bestSeller = name;
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Laporan <span className="text-gradient-gold">Keuangan</span>
                    </h1>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                        Ringkasan pendapatan dari Penjualan dan Penyewaan (Completed)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Export PDF
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Export Excel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filter Laporan</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start">Tanggal Mulai</Label>
                        <Input
                            id="start"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-[200px]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="end">Tanggal Akhir</Label>
                        <Input
                            id="end"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-[200px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {formatCurrency(totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Dari {totalTx} transaksi selesai
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jumlah Transaksi</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTx}</div>
                        <p className="text-xs text-muted-foreground">
                            Sales & Rentals (Completed)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mobil Terlaris</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={bestSeller}>
                            {bestSeller}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {maxCount} transaksi
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Transaksi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Kendaraan</TableHead>
                                    <TableHead>Pelanggan</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {completedOnly.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Tidak ada data transaksi selesai pada periode ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    completedOnly.map((t) => (
                                        <TableRow key={`${t.type}-${t.id}`}>
                                            <TableCell>
                                                {format(t.rawDate, "dd MMM yyyy", { locale: id })}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${t.type === 'sale'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                    }`}>
                                                    {t.type === 'sale' ? <ShoppingCart className="mr-1 h-3 w-3" /> : <Key className="mr-1 h-3 w-3" />}
                                                    {t.type === 'sale' ? 'Penjualan' : 'Sewa'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {t.image && (
                                                        <img src={t.image} alt="" className="h-8 w-12 rounded object-cover" />
                                                    )}
                                                    {t.item}
                                                </div>
                                            </TableCell>
                                            <TableCell>{t.customer}</TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(t.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminReports;
