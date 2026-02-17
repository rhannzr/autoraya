import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Car, Bike, DollarSign, BarChart3, Plus, List } from "lucide-react";
import { vehicleService } from "@/lib/vehicleService";
import { type VehicleDetail } from "@/types/vehicle";

const AdminDashboard = () => {
    const [vehicles, setVehicles] = useState<VehicleDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        vehicleService
            .getAll()
            .then(setVehicles)
            .catch((err) => console.error("Dashboard fetch error:", err))
            .finally(() => setLoading(false));
    }, []);

    const mobil = vehicles.filter((v) => v.type === "mobil").length;
    const motor = vehicles.filter((v) => v.type === "motor").length;
    const rental = vehicles.filter((v) => v.rentalPrice).length;

    const stats = [
        { label: "Total Kendaraan", value: vehicles.length, icon: BarChart3, color: "text-blue-400" },
        { label: "Mobil", value: mobil, icon: Car, color: "text-emerald-400" },
        { label: "Motor", value: motor, icon: Bike, color: "text-amber-400" },
        { label: "Tersedia Sewa", value: rental, icon: DollarSign, color: "text-purple-400" },
    ];

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">Ringkasan data Auto Hub</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                            <s.icon className={`h-5 w-5 ${s.color}`} />
                        </div>
                        <p className="mt-3 font-display text-4xl font-bold text-card-foreground">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-10">
                <h2 className="font-display text-xl font-bold text-foreground">Aksi Cepat</h2>
                <div className="mt-4 flex flex-wrap gap-4">
                    <Link
                        to="/admin/kendaraan/baru"
                        className="flex items-center gap-2 rounded-lg bg-gradient-gold px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-transform hover:scale-105"
                    >
                        <Plus className="h-4 w-4" /> Tambah Kendaraan
                    </Link>
                    <Link
                        to="/admin/kendaraan"
                        className="flex items-center gap-2 rounded-lg border border-border px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-accent"
                    >
                        <List className="h-4 w-4" /> Kelola Kendaraan
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
