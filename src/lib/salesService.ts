import { supabase } from "@/lib/supabase";

export interface Sale {
    id: string;
    user_id: string;
    vehicle_id: string;
    sale_price: number;
    sale_date: string;
    status: "pending" | "completed" | "cancelled";
    created_at: string;
}

export interface SaleWithDetails extends Sale {
    vehicles: { name: string; image: string } | null;
    profiles: { full_name: string; phone: string } | null;
}

interface CreateSaleInput {
    user_id: string;
    vehicle_id: string;
    sale_price: number;
    notes?: string;
}

async function create(input: CreateSaleInput): Promise<Sale> {
    const { data, error } = await supabase
        .from("sales")
        .insert({
            user_id: input.user_id,
            vehicle_id: input.vehicle_id,
            sale_price: input.sale_price,
            sale_date: new Date().toISOString().split("T")[0],
            status: "pending",
            notes: input.notes,
        })
        .select("*")
        .single();

    if (error) {
        console.error("Sales Insert Error:", error);
        throw new Error(`Gagal membuat penjualan: ${error.message}`);
    }

    // Mark vehicle as sold
    await supabase
        .from("vehicles")
        .update({ status: "terjual" })
        .eq("id", input.vehicle_id);

    return data as Sale;
}

async function getByUser(userId: string): Promise<SaleWithDetails[]> {
    const { data, error } = await supabase
        .from("sales")
        .select("*, vehicles(name, image), profiles(full_name, phone)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Gagal mengambil data penjualan: ${error.message}`);
    return (data || []) as unknown as SaleWithDetails[];
}

async function getAll(): Promise<SaleWithDetails[]> {
    const { data, error } = await supabase
        .from("sales")
        .select("*, vehicles(name, image), profiles(full_name, phone)")
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Gagal mengambil data penjualan: ${error.message}`);
    return (data || []) as unknown as SaleWithDetails[];
}

async function updateStatus(
    id: string,
    status: Sale["status"],
    vehicleId?: string
): Promise<void> {
    const { error } = await supabase
        .from("sales")
        .update({ status })
        .eq("id", id);

    if (error) throw new Error(`Gagal update status: ${error.message}`);

    // If cancelled, set vehicle back to available
    if (vehicleId && status === "cancelled") {
        await supabase
            .from("vehicles")
            .update({ status: "tersedia" })
            .eq("id", vehicleId);
    }
}

export const salesService = { create, getByUser, getAll, updateStatus };
