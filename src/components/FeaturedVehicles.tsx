import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import VehicleCard from "./VehicleCard";
import { vehicleService } from "@/lib/vehicleService";
import { type VehicleDetail } from "@/types/vehicle";

const FeaturedVehicles = () => {
  const [vehicles, setVehicles] = useState<VehicleDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"semua" | "mobil" | "motor">("semua");

  useEffect(() => {
    vehicleService
      .getAll()
      .then((data) => {
        // Filter only available vehicles and take top 6
        const available = data
          .filter((v) => v.status === "tersedia")
          .slice(0, 8);
        setVehicles(available);
      })
      .catch((err) => console.error("Failed to fetch featured vehicles:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "semua" ? vehicles : vehicles.filter((v) => v.type === filter);

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold uppercase tracking-wide text-foreground">
            Kendaraan <span className="text-gradient-gold">Unggulan</span>
          </h2>
          <p className="mt-2 font-body text-muted-foreground">
            Pilihan terbaik untuk Anda, siap beli atau sewa
          </p>
        </div>

        {/* Filter */}
        <div className="mt-8 flex justify-center gap-2">
          {(["semua", "mobil", "motor"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-6 py-2 font-display text-sm font-semibold uppercase tracking-wider transition-all ${filter === f
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
            >
              {f === "semua" ? "Semua" : f === "mobil" ? "Mobil" : "Motor"}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-body text-sm text-muted-foreground">Memuat kendaraan...</p>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/kendaraan"
            className="inline-block rounded-lg border border-primary px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Lihat Semua Kendaraan
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVehicles;
