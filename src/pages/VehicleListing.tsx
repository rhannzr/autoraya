import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VehicleFilterBar from "@/components/VehicleFilterBar";
import VehicleCard from "@/components/VehicleCard";
import { useVehicleFilter } from "@/hooks/useVehicleFilter";
import { Search } from "lucide-react";

const VehicleListing = () => {
    const {
        filters,
        setFilter,
        resetFilters,
        filtered,
        loading,
        priceMin,
        priceMax,
        totalCount,
    } = useVehicleFilter();

    const [displayCount, setDisplayCount] = useState(24);

    // Reset display count when filters change
    useEffect(() => {
        setDisplayCount(24);
    }, [filters]);

    const displayedVehicles = filtered.slice(0, displayCount);
    const hasMore = displayCount < filtered.length;

    const handleLoadMore = () => {
        setDisplayCount((prev) => prev + 12);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 pb-20 pt-24">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-4xl font-bold text-foreground">
                        Daftar <span className="text-gradient-gold">Kendaraan</span>
                    </h1>
                    <p className="mt-2 font-body text-muted-foreground">
                        Temukan kendaraan impian Anda
                    </p>
                </div>

                <VehicleFilterBar
                    filters={filters}
                    setFilter={setFilter}
                    resetFilters={resetFilters}
                    resultCount={filtered.length}
                    totalCount={totalCount}
                    priceMin={priceMin}
                    priceMax={priceMax}
                />

                {loading ? (
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="font-body text-sm text-muted-foreground">Memuat kendaraan...</p>
                        </div>
                    </div>
                ) : displayedVehicles.length > 0 ? (
                    <>
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {displayedVehicles.map((vehicle) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-12 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="rounded-lg border-2 border-primary px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                                >
                                    Muat Lebih Banyak
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-16 flex flex-col items-center gap-4 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">
                            Tidak Ada Hasil
                        </h3>
                        <p className="max-w-md font-body text-sm text-muted-foreground">
                            Coba ubah atau reset filter untuk menemukan kendaraan yang Anda cari.
                        </p>
                        <button
                            onClick={resetFilters}
                            className="mt-2 rounded-lg bg-primary px-6 py-2 font-display text-sm font-bold uppercase text-primary-foreground transition-transform hover:scale-105"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default VehicleListing;
