import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { vehicleService } from "@/lib/vehicleService";
import { type VehicleDetail } from "@/types/vehicle";

export type CategoryFilter = "semua" | "mobil" | "motor";
export type TransmissionFilter = "semua" | "Manual" | "Automatic" | "CVT";

export interface VehicleFilters {
    search: string;
    category: CategoryFilter;
    transmission: TransmissionFilter;
    priceRange: [number, number];
}

const PRICE_MIN = 0;
const DEFAULT_PRICE_MAX = 1000; // fallback when no data

export const useVehicleFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [allVehicles, setAllVehicles] = useState<VehicleDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        vehicleService
            .getAvailable()
            .then((data) => {
                if (!cancelled) setAllVehicles(data);
            })
            .catch((err) => console.error("Failed to fetch vehicles:", err))
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Compute the actual price ceiling from fetched data
    const dynamicPriceMax = useMemo(() => {
        if (allVehicles.length === 0) return DEFAULT_PRICE_MAX;
        const maxFromData = Math.max(...allVehicles.map((v) => v.priceNumeric));
        // Round up to the nearest 100 for a clean slider max
        return Math.ceil(maxFromData / 100) * 100;
    }, [allVehicles]);

    const filters: VehicleFilters = {
        search: searchParams.get("search") || "",
        category: (searchParams.get("type") as CategoryFilter) || "semua",
        transmission: (searchParams.get("transmisi") as TransmissionFilter) || "semua",
        priceRange: [
            Number(searchParams.get("min")) || PRICE_MIN,
            Number(searchParams.get("max")) || dynamicPriceMax,
        ],
    };

    const setFilter = <K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);

            if (key === "search") {
                const v = value as string;
                if (v) next.set("search", v);
                else next.delete("search");
            } else if (key === "category") {
                const v = value as CategoryFilter;
                if (v !== "semua") next.set("type", v);
                else next.delete("type");
            } else if (key === "transmission") {
                const v = value as TransmissionFilter;
                if (v !== "semua") next.set("transmisi", v);
                else next.delete("transmisi");
            } else if (key === "priceRange") {
                const [min, max] = value as [number, number];
                if (min > PRICE_MIN) next.set("min", String(min));
                else next.delete("min");
                if (max < dynamicPriceMax) next.set("max", String(max));
                else next.delete("max");
            }

            return next;
        }, { replace: true });
    };

    const resetFilters = () => {
        setSearchParams({}, { replace: true });
    };

    const filtered = useMemo(() => {
        return allVehicles.filter((v) => {
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const match =
                    v.name.toLowerCase().includes(q) ||
                    v.fuel.toLowerCase().includes(q) ||
                    v.mileage.toLowerCase().includes(q);
                if (!match) return false;
            }
            if (filters.category !== "semua" && v.type !== filters.category) return false;
            if (filters.transmission !== "semua" && v.transmission !== filters.transmission) return false;
            if (v.priceNumeric < filters.priceRange[0] || v.priceNumeric > filters.priceRange[1]) return false;
            return true;
        });
    }, [filters.search, filters.category, filters.transmission, filters.priceRange[0], filters.priceRange[1], allVehicles]);

    return {
        filters,
        setFilter,
        resetFilters,
        filtered,
        loading,
        priceMin: PRICE_MIN,
        priceMax: dynamicPriceMax,
        totalCount: allVehicles.length,
    };
};

