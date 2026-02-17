import { supabase } from "@/lib/supabase";
import {
    type VehicleDetail,
    type VehicleFormData,
    type VehicleRow,
    mapRowToVehicle,
    mapVehicleToRow,
} from "@/types/vehicle";

// ---- Image Upload ----

async function uploadVehicleImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `vehicles/${fileName}`;

    const { error } = await supabase.storage
        .from("vehicle-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) {
        throw new Error(`Upload gagal: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

async function uploadMultipleImages(files: File[]): Promise<string[]> {
    if (files.length === 0) return [];
    const results = await Promise.all(files.map(uploadVehicleImage));
    return results;
}

// ---- CRUD ----

async function getAll(): Promise<VehicleDetail[]> {
    const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Gagal mengambil data: ${error.message}`);
    return (data as VehicleRow[]).map(mapRowToVehicle);
}

async function getAvailable(): Promise<VehicleDetail[]> {
    const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("status", "tersedia")
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Gagal mengambil data: ${error.message}`);
    return (data as VehicleRow[]).map(mapRowToVehicle);
}

async function getById(id: string): Promise<VehicleDetail | null> {
    const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null; // not found
        throw new Error(`Gagal mengambil detail: ${error.message}`);
    }
    return mapRowToVehicle(data as VehicleRow);
}

async function add(
    data: VehicleFormData,
    imageFile?: File,
    galleryFiles?: File[]
): Promise<VehicleDetail> {
    // Upload main image first if file provided
    let imageUrl = data.image;
    if (imageFile) {
        imageUrl = await uploadVehicleImage(imageFile);
    }

    // Upload gallery images
    const galleryUrls = galleryFiles?.length
        ? await uploadMultipleImages(galleryFiles)
        : [];

    // Merge: main image + uploaded gallery + any existing gallery URLs
    const allGallery = [
        imageUrl,
        ...galleryUrls,
        ...(data.gallery || []).filter((url) => url !== imageUrl),
    ].filter(Boolean);

    const row = mapVehicleToRow({
        ...data,
        image: imageUrl,
        gallery: allGallery,
    });

    const { data: inserted, error } = await supabase
        .from("vehicles")
        .insert(row)
        .select("*")
        .single();

    if (error) throw new Error(`Gagal menambahkan kendaraan: ${error.message}`);
    return mapRowToVehicle(inserted as VehicleRow);
}

async function update(
    id: string,
    data: Partial<VehicleFormData>,
    imageFile?: File,
    galleryFiles?: File[]
): Promise<VehicleDetail> {
    // Upload new main image if provided
    let imageUrl = data.image;
    if (imageFile) {
        imageUrl = await uploadVehicleImage(imageFile);
        data = { ...data, image: imageUrl };
    }

    // Upload new gallery images
    const newGalleryUrls = galleryFiles?.length
        ? await uploadMultipleImages(galleryFiles)
        : [];

    // Merge: existing gallery + new uploads
    if (newGalleryUrls.length > 0 || data.gallery !== undefined) {
        const existingGallery = data.gallery || [];
        data = {
            ...data,
            gallery: [...existingGallery, ...newGalleryUrls],
        };
    }

    // Build partial row (only changed fields)
    const partialRow: Record<string, unknown> = {};
    if (data.name !== undefined) partialRow.name = data.name;
    if (data.image !== undefined) partialRow.image = data.image;
    if (data.price !== undefined) partialRow.price = data.price;
    if (data.priceNumeric !== undefined) partialRow.price_numeric = data.priceNumeric;
    if (data.rentalPrice !== undefined) partialRow.rental_price = data.rentalPrice || null;
    if (data.year !== undefined) partialRow.year = data.year;
    if (data.fuel !== undefined) partialRow.fuel = data.fuel;
    if (data.mileage !== undefined) partialRow.mileage = data.mileage;
    if (data.transmission !== undefined) partialRow.transmission = data.transmission;
    if (data.type !== undefined) partialRow.type = data.type;
    if (data.badge !== undefined) partialRow.badge = data.badge || null;
    if (data.status !== undefined) partialRow.status = data.status;
    if (data.gallery !== undefined) partialRow.gallery = data.gallery;
    if (data.description !== undefined) partialRow.description = data.description;
    if (data.specs !== undefined) partialRow.specs = data.specs;
    if (data.seller !== undefined) {
        partialRow.seller_name = data.seller.name;
        partialRow.seller_phone = data.seller.phone;
        partialRow.seller_location = data.seller.location;
    }
    // New fields
    if (data.color !== undefined) partialRow.color = data.color || null;
    if (data.capacity !== undefined) partialRow.capacity = data.capacity || null;
    if (data.engine !== undefined) partialRow.engine = data.engine || null;
    if (data.horsepower !== undefined) partialRow.horsepower = data.horsepower || null;
    if (data.torque !== undefined) partialRow.torque = data.torque || null;
    if (data.licensePlate !== undefined) partialRow.license_plate = data.licensePlate || null;
    if (data.taxExpiry !== undefined) partialRow.tax_expiry = data.taxExpiry || null;

    const { data: updated, error } = await supabase
        .from("vehicles")
        .update(partialRow)
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw new Error(`Gagal memperbarui kendaraan: ${error.message}`);
    return mapRowToVehicle(updated as VehicleRow);
}

async function deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus kendaraan: ${error.message}`);
}

async function updateStatus(
    id: string,
    status: "tersedia" | "disewa" | "terjual"
): Promise<void> {
    const { error } = await supabase
        .from("vehicles")
        .update({ status })
        .eq("id", id);

    if (error) throw new Error(`Gagal update status: ${error.message}`);
}

// ---- Public API ----

export const vehicleService = {
    getAll,
    getAvailable,
    getById,
    add,
    update,
    delete: deleteVehicle,
    updateStatus,
    uploadImage: uploadVehicleImage,
    uploadMultipleImages,
};
