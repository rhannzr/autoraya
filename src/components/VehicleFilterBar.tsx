import { Search, Car, Bike, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { useState } from "react";
import {
    type CategoryFilter,
    type TransmissionFilter,
    type VehicleFilters,
} from "@/hooks/useVehicleFilter";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface VehicleFilterBarProps {
    filters: VehicleFilters;
    setFilter: <K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) => void;
    resetFilters: () => void;
    resultCount: number;
    totalCount: number;
    priceMin: number;
    priceMax: number;
}

const VehicleFilterBar = ({
    filters,
    setFilter,
    resetFilters,
    resultCount,
    totalCount,
    priceMin,
    priceMax,
}: VehicleFilterBarProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const hasActiveFilters =
        filters.search !== "" ||
        filters.category !== "semua" ||
        filters.transmission !== "semua" ||
        filters.priceRange[0] > priceMin ||
        filters.priceRange[1] < priceMax;

    const formatPrice = (val: number) => {
        if (val >= 1000) return `Rp ${(val / 1000).toFixed(1)} M`;
        return `Rp ${val} Jt`;
    };

    return (
        <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
            {/* Top row: search + mobile toggle */}
            <div className="flex gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-secondary px-4">
                    <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilter("search", e.target.value)}
                        placeholder="Cari kendaraan..."
                        className="flex-1 bg-transparent py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {filters.search && (
                        <button
                            onClick={() => setFilter("search", "")}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                </button>
            </div>

            {/* Filter body — always visible on desktop, toggleable on mobile */}
            <div className={`mt-4 space-y-4 lg:mt-4 lg:block ${mobileOpen ? "block" : "hidden lg:block"}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                    {/* Category toggle */}
                    <div className="flex-shrink-0">
                        <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Kategori
                        </p>
                        <div className="flex gap-2">
                            {([
                                { key: "semua" as CategoryFilter, label: "Semua", icon: null },
                                { key: "mobil" as CategoryFilter, label: "Mobil", icon: Car },
                                { key: "motor" as CategoryFilter, label: "Motor", icon: Bike },
                            ]).map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter("category", key)}
                                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${filters.category === key
                                            ? "bg-primary text-primary-foreground"
                                            : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                                        }`}
                                >
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transmission */}
                    <div className="w-full lg:w-48">
                        <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Transmisi
                        </p>
                        <Select
                            value={filters.transmission}
                            onValueChange={(v) => setFilter("transmission", v as TransmissionFilter)}
                        >
                            <SelectTrigger className="w-full border-border bg-secondary text-foreground">
                                <SelectValue placeholder="Semua Transmisi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Transmisi</SelectItem>
                                <SelectItem value="Automatic">Automatic</SelectItem>
                                <SelectItem value="Manual">Manual</SelectItem>
                                <SelectItem value="CVT">CVT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Price range */}
                    <div className="flex-1">
                        <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Rentang Harga:{" "}
                            <span className="font-semibold text-primary">
                                {formatPrice(filters.priceRange[0])} — {formatPrice(filters.priceRange[1])}
                            </span>
                        </p>
                        <Slider
                            min={priceMin}
                            max={priceMax}
                            step={10}
                            value={filters.priceRange}
                            onValueChange={(v) => setFilter("priceRange", v as [number, number])}
                            className="py-2"
                        />
                    </div>

                    {/* Reset */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1.5 self-end rounded-lg border border-destructive/50 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </button>
                    )}
                </div>

                {/* Result count */}
                <p className="font-body text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-semibold text-foreground">{resultCount}</span> dari{" "}
                    <span className="font-semibold text-foreground">{totalCount}</span> kendaraan
                </p>
            </div>
        </div>
    );
};

export default VehicleFilterBar;
