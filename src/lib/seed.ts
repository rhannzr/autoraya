import { supabase } from "@/lib/supabase";
import { vehicles } from "@/data/vehicles";

interface SeedRow {
    name: string;
    image: string;
    price: string;
    price_numeric: number;
    rental_price: string | null;
    year: number;
    fuel: string;
    mileage: string;
    transmission: string;
    type: string;
    badge: string | null;
    gallery: string[];
    description: string;
    specs: { label: string; value: string }[];
    seller_name: string;
    seller_phone: string;
    seller_location: string;
}

/**
 * Seed the Supabase `vehicles` table with data from src/data/vehicles.ts.
 *
 * ⚠️ Run this ONCE, then remove the caller to avoid duplicate data.
 */
export async function seedDatabase(): Promise<void> {
    console.log("🌱 [Seed] Mulai proses seeding...");
    console.log(`🌱 [Seed] Jumlah data sumber: ${vehicles.length}`);

    try {
        // Map static data → DB rows (snake_case, no `id` so Supabase generates UUIDs)
        const rows: SeedRow[] = vehicles.map((v) => ({
            name: v.name,
            image: v.image,
            price: v.price,
            price_numeric: v.priceNumeric,
            rental_price: v.rentalPrice ?? null,
            year: v.year,
            fuel: v.fuel,
            mileage: v.mileage,
            transmission: v.transmission,
            type: v.type,
            badge: v.badge ?? null,
            gallery: v.gallery ?? [],
            description: v.description,
            specs: v.specs ?? [],
            seller_name: v.seller.name,
            seller_phone: v.seller.phone,
            seller_location: v.seller.location,
        }));

        // Debug: log kolom dan sample data pertama
        console.log("🌱 [Seed] Kolom yang dikirim:", Object.keys(rows[0]));
        console.log("🌱 [Seed] Sample row pertama:", JSON.stringify(rows[0], null, 2));
        console.log(`🌱 [Seed] Menyisipkan ${rows.length} kendaraan...`);

        const { data, error } = await supabase
            .from("vehicles")
            .insert(rows)
            .select("id, name");

        if (error) {
            // Log semua detail error dari Supabase
            console.error("❌ [Seed] Error message:", error.message);
            console.error("❌ [Seed] Error details:", error.details);
            console.error("❌ [Seed] Error hint:", error.hint);
            console.error("❌ [Seed] Error code:", error.code);
            console.error("❌ [Seed] Full error object:", JSON.stringify(error, null, 2));
            throw error;
        }

        console.log(`✅ [Seed] Berhasil! ${data.length} kendaraan ditambahkan:`);
        data.forEach((v) => console.log(`   → ${v.name} (${v.id})`));
    } catch (err: unknown) {
        if (err && typeof err === "object" && "message" in err) {
            const e = err as { message: string; details?: string; hint?: string; code?: string };
            console.error("❌ [Seed] Gagal — message:", e.message);
            console.error("❌ [Seed] Gagal — details:", e.details);
            console.error("❌ [Seed] Gagal — hint:", e.hint);
            console.error("❌ [Seed] Gagal — code:", e.code);
        } else {
            console.error("❌ [Seed] Gagal (unknown):", err);
        }
        throw err;
    }
}

