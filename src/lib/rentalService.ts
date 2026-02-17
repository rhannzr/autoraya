import { supabase } from "@/lib/supabase";

export interface Rental {
    id: string;
    user_id: string;
    vehicle_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: "pending" | "active" | "completed" | "cancelled";
    created_at: string;
}

export interface RentalWithDetails extends Rental {
    vehicles: { name: string; image: string } | null;
    profiles: { full_name: string; phone: string } | null;
}

interface CreateRentalInput {
    user_id: string;
    vehicle_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
}

async function create(input: CreateRentalInput): Promise<Rental> {
    const { data, error } = await supabase
        .from("rentals")
        .insert({
            user_id: input.user_id,
            vehicle_id: input.vehicle_id,
            start_date: input.start_date,
            end_date: input.end_date,
            total_price: input.total_price,
            status: "pending",
        })
        .select("*")
        .single();

    if (error) throw new Error(`Gagal membuat sewa: ${error.message}`);

    // Update vehicle status
    await supabase
        .from("vehicles")
        .update({ status: "disewa" })
        .eq("id", input.vehicle_id);

    return data as Rental;
}

async function getByUser(userId: string): Promise<RentalWithDetails[]> {
    const { data, error } = await supabase
        .from("rentals")
        .select("*, vehicles(name, image), profiles(full_name, phone)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Gagal mengambil data sewa: ${error.message}`);
    return (data || []) as unknown as RentalWithDetails[];
}

async function getAll(): Promise<RentalWithDetails[]> {
    const { data, error } = await supabase
        .from("rentals")
        .select("*, vehicles(name, image), profiles(full_name, phone)")
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Gagal mengambil data sewa: ${error.message}`);
    return (data || []) as unknown as RentalWithDetails[];
}

async function updateStatus(
    id: string,
    status: Rental["status"],
    vehicleId?: string
): Promise<void> {
    const validStatuses: Rental["status"][] = ["pending", "active", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
        throw new Error(`Status tidak valid: ${status}`);
    }

    const { error } = await supabase
        .from("rentals")
        .update({ status })
        .eq("id", id);

    if (error) throw new Error(`Gagal update status: ${error.message}`);

    // If completed or cancelled, set vehicle back to available
    if (vehicleId && (status === "completed" || status === "cancelled")) {
        await supabase
            .from("vehicles")
            .update({ status: "tersedia" })
            .eq("id", vehicleId);
    }
}

interface UpdateRentalInput {
    start_date?: string;
    end_date?: string;
    total_price?: number;
    status?: Rental["status"];
}

async function update(id: string, input: UpdateRentalInput): Promise<void> {
    const { error } = await supabase
        .from("rentals")
        .update(input)
        .eq("id", id);

    if (error) throw new Error(`Gagal update sewa: ${error.message}`);
}

export const rentalService = { create, getByUser, getAll, updateStatus, update };
