import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { vehicleService } from "@/lib/vehicleService";
import VehicleForm from "@/components/admin/VehicleForm";
import { type VehicleDetail } from "@/types/vehicle";

const AdminVehicleEdit = () => {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        vehicleService
            .getById(id)
            .then(setVehicle)
            .catch((err) => console.error("Fetch error:", err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="font-display text-3xl font-bold text-foreground">Kendaraan Tidak Ditemukan</h1>
                    <Link to="/admin/kendaraan" className="mt-4 inline-block text-primary hover:underline">
                        ← Kembali ke Daftar
                    </Link>
                </div>
            </div>
        );
    }

    return <VehicleForm vehicle={vehicle} />;
};

export default AdminVehicleEdit;
