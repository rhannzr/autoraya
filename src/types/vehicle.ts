// ---- Frontend types (camelCase) ----

export interface Vehicle {
    id: string;
    name: string;
    image: string;
    price: string;
    priceNumeric: number;
    rentalPrice?: number;
    year: number;
    fuel: string;
    mileage: string;
    transmission: "Manual" | "Automatic" | "CVT";
    type: "mobil" | "motor";
    badge?: string;
    status?: "tersedia" | "disewa" | "terjual";
    // New fields
    color?: string;
    capacity?: number;
    engine?: string;
    horsepower?: number;
    torque?: number;
    licensePlate?: string;
    taxExpiry?: string;
}

export interface VehicleDetail extends Vehicle {
    gallery: string[];
    description: string;
    specs: { label: string; value: string }[];
    seller: {
        name: string;
        phone: string;
        location: string;
    };
    createdAt?: string;
}

export type VehicleFormData = Omit<VehicleDetail, "id">;

// ---- Database row type (snake_case) ----

export interface VehicleRow {
    id: string;
    name: string;
    image: string;
    price: string;
    price_numeric: number;
    rental_price: number | null;
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
    status: string;
    created_at: string;
    // New fields
    color: string | null;
    capacity: number | null;
    engine: string | null;
    horsepower: number | null;
    torque: number | null;
    license_plate: string | null;
    tax_expiry: string | null;
}

// ---- Mapper: DB row → frontend object ----

export function mapRowToVehicle(row: VehicleRow): VehicleDetail {
    return {
        id: row.id,
        name: row.name,
        image: row.image,
        price: row.price,
        priceNumeric: row.price_numeric,
        rentalPrice: row.rental_price ?? undefined,
        year: row.year,
        fuel: row.fuel,
        mileage: row.mileage,
        transmission: row.transmission as Vehicle["transmission"],
        type: row.type as Vehicle["type"],
        badge: row.badge ?? undefined,
        status: (row.status as Vehicle["status"]) ?? "tersedia",
        gallery: row.gallery ?? [],
        description: row.description,
        specs: row.specs ?? [],
        seller: {
            name: row.seller_name,
            phone: row.seller_phone,
            location: row.seller_location,
        },
        createdAt: row.created_at,
        // New fields
        color: row.color ?? undefined,
        capacity: row.capacity ?? undefined,
        engine: row.engine ?? undefined,
        horsepower: row.horsepower ?? undefined,
        torque: row.torque ?? undefined,
        licensePlate: row.license_plate ?? undefined,
        taxExpiry: row.tax_expiry ?? undefined,
    };
}

// ---- Mapper: frontend object → DB row (for insert/update) ----

export function mapVehicleToRow(
    data: VehicleFormData
): Omit<VehicleRow, "id" | "created_at"> {
    return {
        name: data.name,
        image: data.image,
        price: data.price,
        price_numeric: data.priceNumeric,
        rental_price: data.rentalPrice ?? null,
        year: data.year,
        fuel: data.fuel,
        mileage: data.mileage,
        transmission: data.transmission,
        type: data.type,
        badge: data.badge ?? null,
        status: data.status ?? "tersedia",
        gallery: data.gallery ?? [],
        description: data.description,
        specs: data.specs ?? [],
        seller_name: data.seller.name,
        seller_phone: data.seller.phone,
        seller_location: data.seller.location,
        // New fields
        color: data.color ?? null,
        capacity: data.capacity ?? null,
        engine: data.engine ?? null,
        horsepower: data.horsepower ?? null,
        torque: data.torque ?? null,
        license_plate: data.licensePlate ?? null,
        tax_expiry: data.taxExpiry ?? null,
    };
}
