import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/authService";

export interface CustomerWithCounts extends Profile {
    rental_count: number;
    sale_count: number;
}

async function getAll(): Promise<CustomerWithCounts[]> {
    // Step 1: Fetch profiles only (simplified to isolate errors)
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false });

    console.log("Raw Customer Data:", profiles);
    if (error) {
        console.error("Customer Fetch Error (full):", JSON.stringify(error, null, 2));
    }

    if (error) {
        throw new Error(`Gagal mengambil data pelanggan: ${error.message}`);
    }
    if (!profiles || profiles.length === 0) return [];

    // Step 2: Try counting rentals & sales (non-blocking — errors won't crash)
    let rentalCounts: Record<string, number> = {};
    let saleCounts: Record<string, number> = {};

    try {
        const [rentalsRes, salesRes] = await Promise.all([
            supabase.from("rentals").select("user_id"),
            supabase.from("sales").select("user_id"),
        ]);

        console.log("Rentals query result:", rentalsRes.data, rentalsRes.error);
        console.log("Sales query result:", salesRes.data, salesRes.error);

        (rentalsRes.data || []).forEach((r) => {
            rentalCounts[r.user_id] = (rentalCounts[r.user_id] || 0) + 1;
        });
        (salesRes.data || []).forEach((s) => {
            saleCounts[s.user_id] = (saleCounts[s.user_id] || 0) + 1;
        });
    } catch (countErr) {
        console.error("Error counting rentals/sales (non-fatal):", countErr);
    }

    return (profiles as Profile[]).map((p) => ({
        ...p,
        rental_count: rentalCounts[p.id] || 0,
        sale_count: saleCounts[p.id] || 0,
    }));
}

async function getById(userId: string): Promise<CustomerWithCounts | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error fetching customer by id:", error);
        return null;
    }

    const [rentalsRes, salesRes] = await Promise.all([
        supabase.from("rentals").select("id").eq("user_id", userId),
        supabase.from("sales").select("id").eq("user_id", userId),
    ]);

    return {
        ...(data as Profile),
        rental_count: rentalsRes.data?.length || 0,
        sale_count: salesRes.data?.length || 0,
    };
}

export const customerService = { getAll, getById };
