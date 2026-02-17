// ... existing imports
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, X, Loader2, ImagePlus, Images } from "lucide-react";
import { vehicleService } from "@/lib/vehicleService";
import { type VehicleDetail, type VehicleFormData } from "@/types/vehicle";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface VehicleFormProps {
    vehicle?: VehicleDetail;
}

interface GalleryItem {
    id: string;
    file?: File;
    url: string; // blob URL for new files, actual URL for existing
    isExisting: boolean;
}

const VehicleForm = ({ vehicle }: VehicleFormProps) => {
    const navigate = useNavigate();
    const isEditing = !!vehicle;
    const mainFileRef = useRef<HTMLInputElement>(null);
    const galleryFileRef = useRef<HTMLInputElement>(null);

    // Form state
    const [name, setName] = useState(vehicle?.name || "");
    const [type, setType] = useState<"mobil" | "motor">(vehicle?.type || "mobil");
    const [priceNumeric, setPriceNumeric] = useState(vehicle?.priceNumeric || 0);
    const [rentalPrice, setRentalPrice] = useState(vehicle?.rentalPrice || 0);
    const [year, setYear] = useState(vehicle?.year || new Date().getFullYear());
    const [fuel, setFuel] = useState(vehicle?.fuel || "Bensin");
    const [mileage, setMileage] = useState(vehicle?.mileage || "");
    const [transmission, setTransmission] = useState<"Manual" | "Automatic" | "CVT">(
        vehicle?.transmission || "Automatic"
    );
    const [description, setDescription] = useState(vehicle?.description || "");
    const [badge, setBadge] = useState(vehicle?.badge || "");
    const [sellerName, setSellerName] = useState(vehicle?.seller?.name || "AutoRaya Jakarta");
    const [sellerPhone, setSellerPhone] = useState(vehicle?.seller?.phone || "6281234567890");
    const [sellerLocation, setSellerLocation] = useState(vehicle?.seller?.location || "Jakarta");

    // New fields state
    const [color, setColor] = useState(vehicle?.color || "");
    const [capacity, setCapacity] = useState(vehicle?.capacity || 0);
    const [engine, setEngine] = useState(vehicle?.engine || "");
    const [horsepower, setHorsepower] = useState(vehicle?.horsepower || 0);
    const [torque, setTorque] = useState(vehicle?.torque || 0);
    const [licensePlate, setLicensePlate] = useState(vehicle?.licensePlate || "");
    const [taxExpiry, setTaxExpiry] = useState(vehicle?.taxExpiry || "");

    // Main image state
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>(vehicle?.image || "");
    const [mainDragActive, setMainDragActive] = useState(false);

    // Gallery state
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(
        () => (vehicle?.gallery || []).map((url, i) => ({
            id: `existing-${i}`,
            url,
            isExisting: true,
        }))
    );
    const [galleryDragActive, setGalleryDragActive] = useState(false);

    // Submit state
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ---- Validation helper ----
    const validateImageFile = (file: File): boolean => {
        if (!file.type.startsWith("image/")) {
            toast.error(`"${file.name}" bukan file gambar.`);
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error(`"${file.name}" melebihi 5 MB.`);
            return false;
        }
        return true;
    };

    // ---- Main image handling ----
    const handleMainFileSelect = (file: File) => {
        if (!validateImageFile(file)) return;
        setMainImageFile(file);
        setMainImagePreview(URL.createObjectURL(file));
        setErrors((prev) => { const n = { ...prev }; delete n.image; return n; });
    };

    const handleMainDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setMainDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleMainFileSelect(file);
    };

    const removeMainImage = () => {
        setMainImageFile(null);
        setMainImagePreview("");
        if (mainFileRef.current) mainFileRef.current.value = "";
    };

    // ---- Gallery handling ----
    const addGalleryFiles = (files: FileList | File[]) => {
        const newItems: GalleryItem[] = [];
        Array.from(files).forEach((file) => {
            if (!validateImageFile(file)) return;
            newItems.push({
                id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                file,
                url: URL.createObjectURL(file),
                isExisting: false,
            });
        });
        if (newItems.length > 0) {
            setGalleryItems((prev) => [...prev, ...newItems]);
        }
    };

    const handleGalleryDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setGalleryDragActive(false);
        addGalleryFiles(e.dataTransfer.files);
    };

    const removeGalleryItem = (id: string) => {
        setGalleryItems((prev) => prev.filter((item) => item.id !== id));
    };

    // ---- Validation ----
    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Nama kendaraan wajib diisi";
        if (priceNumeric <= 0) e.priceNumeric = "Harga numerik harus lebih dari 0";
        if (year < 2000 || year > 2030) e.year = "Tahun tidak valid";
        if (!mileage.trim()) e.mileage = "Jarak tempuh wajib diisi";
        if (!mainImagePreview && !mainImageFile) e.image = "Gambar utama wajib diupload";
        if (!description.trim()) e.description = "Deskripsi wajib diisi";
        if (!sellerName.trim()) e.sellerName = "Nama penjual wajib diisi";
        if (!sellerPhone.trim()) e.sellerPhone = "Nomor telepon wajib diisi";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ---- Submit ----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Mohon lengkapi semua field yang wajib diisi.");
            return;
        }

        setSubmitting(true);

        try {
            // Separate gallery items into existing URLs and new files
            const existingGalleryUrls = galleryItems
                .filter((item) => item.isExisting)
                .map((item) => item.url);
            const newGalleryFiles = galleryItems
                .filter((item) => !item.isExisting && item.file)
                .map((item) => item.file!);

            const data: VehicleFormData = {
                name,
                type,
                price: new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(priceNumeric),
                priceNumeric,
                rentalPrice: rentalPrice || undefined,
                year,
                fuel,
                mileage,
                transmission,
                image: mainImagePreview,
                badge: badge || undefined,
                description,
                gallery: existingGalleryUrls,
                // New fields
                color: color || undefined,
                capacity: capacity || undefined,
                engine: engine || undefined,
                horsepower: horsepower || undefined,
                torque: torque || undefined,
                licensePlate: licensePlate || undefined,
                taxExpiry: taxExpiry || undefined,

                specs: vehicle?.specs || [
                    { label: "Transmisi", value: transmission },
                    { label: "Bahan Bakar", value: fuel },
                    { label: "Tahun", value: String(year) },
                    ...(color ? [{ label: "Warna", value: color }] : []),
                    ...(engine ? [{ label: "Mesin", value: engine }] : []),
                ],
                seller: {
                    name: sellerName,
                    phone: sellerPhone,
                    location: sellerLocation,
                },
            };

            if (isEditing && vehicle) {
                await vehicleService.update(
                    vehicle.id,
                    data,
                    mainImageFile ?? undefined,
                    newGalleryFiles.length > 0 ? newGalleryFiles : undefined
                );
                toast.success("Kendaraan berhasil diperbarui!");
            } else {
                await vehicleService.add(
                    data,
                    mainImageFile ?? undefined,
                    newGalleryFiles.length > 0 ? newGalleryFiles : undefined
                );
                toast.success("Kendaraan baru berhasil ditambahkan!");
            }
            navigate("/admin/kendaraan");
        } catch (err) {
            console.error("Error submitting form:", err);
            const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const fieldClass = (field: string) =>
        `w-full border ${errors[field] ? "border-destructive" : "border-border"} bg-secondary text-foreground`;

    return (
        <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            {isEditing ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
                        </h1>
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                            {isEditing ? `Mengedit: ${vehicle.name}` : "Isi data kendaraan yang akan ditambahkan"}
                        </p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-lg bg-gradient-gold px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Simpan
                        </>
                    )}
                </button>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-3">
                {/* Left column - Main info */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="font-display text-lg font-bold text-foreground">Informasi Utama</h2>

                        <div className="mt-4 space-y-4">
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Nama Kendaraan *
                                </Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Toyota Avanza 1.5 G"
                                    className={fieldClass("name")}
                                />
                                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                        Kategori
                                    </Label>
                                    <Select value={type} onValueChange={(v) => setType(v as "mobil" | "motor")}>
                                        <SelectTrigger className="border-border bg-secondary text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mobil">Mobil</SelectItem>
                                            <SelectItem value="motor">Motor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                        Transmisi
                                    </Label>
                                    <Select
                                        value={transmission}
                                        onValueChange={(v) => setTransmission(v as "Manual" | "Automatic" | "CVT")}
                                    >
                                        <SelectTrigger className="border-border bg-secondary text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Automatic">Automatic</SelectItem>
                                            <SelectItem value="Manual">Manual</SelectItem>
                                            <SelectItem value="CVT">CVT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                        Tahun
                                    </Label>
                                    <Input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
                                        className={fieldClass("year")}
                                    />
                                    {errors.year && <p className="mt-1 text-xs text-destructive">{errors.year}</p>}
                                </div>
                                <div>
                                    <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                        Bahan Bakar
                                    </Label>
                                    <Select value={fuel} onValueChange={setFuel}>
                                        <SelectTrigger className="border-border bg-secondary text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Bensin">Bensin</SelectItem>
                                            <SelectItem value="Diesel">Diesel</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                            <SelectItem value="Listrik">Listrik</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                        Jarak Tempuh *
                                    </Label>
                                    <Input
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        placeholder="Contoh: 15.000 km"
                                        className={fieldClass("mileage")}
                                    />
                                    {errors.mileage && <p className="mt-1 text-xs text-destructive">{errors.mileage}</p>}
                                </div>
                            </div>

                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Deskripsi *
                                </Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Deskripsi kondisi dan keunggulan kendaraan..."
                                    rows={3}
                                    className={fieldClass("description")}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-destructive">{errors.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== SPESIFIKASI TAMBAHAN ===== */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="font-display text-lg font-bold text-foreground">Spesifikasi Tambahan</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Warna
                                </Label>
                                <Input
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="Putih Mutiara"
                                    className="border-border bg-secondary text-foreground"
                                />
                            </div>
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Kapasitas Penumpang (Orang)
                                </Label>
                                <Input
                                    type="number"
                                    value={capacity || ""}
                                    onChange={(e) => setCapacity(Number(e.target.value))}
                                    placeholder="7"
                                    className="border-border bg-secondary text-foreground"
                                />
                            </div>
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Mesin
                                </Label>
                                <Input
                                    value={engine}
                                    onChange={(e) => setEngine(e.target.value)}
                                    placeholder="1500cc Dual MIVEC"
                                    className="border-border bg-secondary text-foreground"
                                />
                            </div>
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Tenaga (HP)
                                </Label>
                                <Input
                                    type="number"
                                    value={horsepower || ""}
                                    onChange={(e) => setHorsepower(Number(e.target.value))}
                                    placeholder="104"
                                    className="border-border bg-secondary text-foreground"
                                />
                            </div>
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Torsi (Nm)
                                </Label>
                                <Input
                                    type="number"
                                    value={torque || ""}
                                    onChange={(e) => setTorque(Number(e.target.value))}
                                    placeholder="141"
                                    className="border-border bg-secondary text-foreground"
                                />
                            </div>
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Plat Nomor
                                </Label>
                                <Input
                                    value={licensePlate}
                                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                    placeholder="B 1234 ABC"
                                    className="border-border bg-secondary text-foreground"
                                />
                            </div>
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Pajak Berlaku Hingga
                                </Label>
                                <Input
                                    type="date"
                                    value={taxExpiry}
                                    onChange={(e) => setTaxExpiry(e.target.value)}
                                    className="border-border bg-secondary text-foreground"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ===== MAIN IMAGE ===== */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                            <ImagePlus className="h-5 w-5 text-primary" /> Gambar Utama
                        </h2>
                        <p className="mt-1 font-body text-xs text-muted-foreground">
                            Gambar ini akan dijadikan thumbnail di daftar kendaraan
                        </p>
                        <div className="mt-4">
                            {mainImagePreview ? (
                                <div className="relative">
                                    <img
                                        src={mainImagePreview}
                                        alt="Preview"
                                        className="h-56 w-full rounded-lg border border-border object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeMainImage}
                                        className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-white shadow-md transition-transform hover:scale-110"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    {mainImageFile && (
                                        <div className="absolute bottom-2 left-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                                            {mainImageFile.name} ({(mainImageFile.size / 1024 / 1024).toFixed(1)} MB)
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    onDrop={handleMainDrop}
                                    onDragOver={(e) => { e.preventDefault(); setMainDragActive(true); }}
                                    onDragLeave={() => setMainDragActive(false)}
                                    onClick={() => mainFileRef.current?.click()}
                                    className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors ${mainDragActive
                                        ? "border-primary bg-primary/5"
                                        : errors.image
                                            ? "border-destructive bg-destructive/5"
                                            : "border-border hover:border-primary/50 hover:bg-accent/30"
                                        }`}
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                        <ImagePlus className="h-7 w-7 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-display text-sm font-semibold text-foreground">
                                            {mainDragActive ? "Lepas file di sini..." : "Klik atau seret gambar utama"}
                                        </p>
                                        <p className="mt-1 font-body text-xs text-muted-foreground">
                                            JPG, PNG, atau WebP • Maks 5 MB
                                        </p>
                                    </div>
                                </div>
                            )}
                            <input
                                ref={mainFileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleMainFileSelect(file);
                                }}
                            />
                            {errors.image && <p className="mt-2 text-xs text-destructive">{errors.image}</p>}
                        </div>
                    </div>

                    {/* ===== GALLERY ===== */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                            <Images className="h-5 w-5 text-primary" /> Galeri Foto
                        </h2>
                        <p className="mt-1 font-body text-xs text-muted-foreground">
                            Upload foto tambahan untuk ditampilkan di halaman detail ({galleryItems.length} foto)
                        </p>

                        {/* Gallery grid */}
                        {galleryItems.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {galleryItems.map((item) => (
                                    <div key={item.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                                        <img
                                            src={item.url}
                                            alt="Gallery"
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryItem(item.id)}
                                            className="absolute right-1.5 top-1.5 rounded-full bg-destructive p-1 text-white opacity-0 shadow-md transition-all group-hover:opacity-100 hover:scale-110"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        {!item.isExisting && (
                                            <div className="absolute bottom-1 left-1 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                                Baru
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Drop zone for adding more */}
                        <div
                            onDrop={handleGalleryDrop}
                            onDragOver={(e) => { e.preventDefault(); setGalleryDragActive(true); }}
                            onDragLeave={() => setGalleryDragActive(false)}
                            onClick={() => galleryFileRef.current?.click()}
                            className={`mt-4 flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors ${galleryDragActive
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-accent/30"
                                }`}
                        >
                            <Images className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-display text-sm font-semibold text-foreground">
                                    {galleryDragActive ? "Lepas file di sini..." : "Tambah foto galeri"}
                                </p>
                                <p className="font-body text-xs text-muted-foreground">
                                    Pilih beberapa file sekaligus • Maks 5 MB per file
                                </p>
                            </div>
                        </div>
                        <input
                            ref={galleryFileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) addGalleryFiles(e.target.files);
                                e.target.value = "";
                            }}
                        />
                    </div>
                </div>

                {/* Right column - Price & Seller */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="font-display text-lg font-bold text-foreground">Harga</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Harga Jual (Angka Penuh) *
                                </Label>
                                <Input
                                    type="number"
                                    value={priceNumeric || ""}
                                    onChange={(e) => setPriceNumeric(Number(e.target.value))}
                                    placeholder="Contoh: 500000000"
                                    className={fieldClass("priceNumeric")}
                                />
                                <p className="mt-1 text-xs font-semibold text-primary">
                                    {priceNumeric > 0 ? formatCurrency(priceNumeric) : "Rp 0"}
                                </p>
                                {errors.priceNumeric && (
                                    <p className="mt-1 text-xs text-destructive">{errors.priceNumeric}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Harga Sewa / Hari (opsional)
                            </Label>
                            <Input
                                type="number"
                                value={rentalPrice || ""}
                                onChange={(e) => setRentalPrice(Number(e.target.value))}
                                placeholder="Contoh: 450000"
                                className="w-full border border-border bg-secondary text-foreground"
                            />
                            <p className="mt-1 text-xs font-semibold text-primary">
                                {rentalPrice > 0 ? formatCurrency(rentalPrice) : "Rp 0"}
                            </p>
                        </div>
                        <div>
                            <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                Badge (opsional)
                            </Label>
                            <Input
                                value={badge}
                                onChange={(e) => setBadge(e.target.value)}
                                placeholder="Contoh: Terlaris, Baru, Sport"
                                className="w-full border border-border bg-secondary text-foreground"
                            />
                        </div>
                    </div>


                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="font-display text-lg font-bold text-foreground">Penjual</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Nama Penjual *
                                </Label>
                                <Input
                                    value={sellerName}
                                    onChange={(e) => setSellerName(e.target.value)}
                                    className={fieldClass("sellerName")}
                                />
                                {errors.sellerName && (
                                    <p className="mt-1 text-xs text-destructive">{errors.sellerName}</p>
                                )}
                            </div>
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Nomor Telepon *
                                </Label>
                                <Input
                                    value={sellerPhone}
                                    onChange={(e) => setSellerPhone(e.target.value)}
                                    placeholder="6281234567890"
                                    className={fieldClass("sellerPhone")}
                                />
                                {errors.sellerPhone && (
                                    <p className="mt-1 text-xs text-destructive">{errors.sellerPhone}</p>
                                )}
                            </div>
                            <div>
                                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                                    Lokasi
                                </Label>
                                <Input
                                    value={sellerLocation}
                                    onChange={(e) => setSellerLocation(e.target.value)}
                                    placeholder="Jakarta Selatan"
                                    className="w-full border border-border bg-secondary text-foreground"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-screen overlay during submit */}
            {
                submitting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 shadow-xl">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <div className="text-center">
                                <p className="font-display text-lg font-bold text-foreground">
                                    {(mainImageFile || galleryItems.some((g) => !g.isExisting))
                                        ? "Mengupload gambar & menyimpan..."
                                        : "Menyimpan data..."}
                                </p>
                                <p className="mt-1 font-body text-sm text-muted-foreground">Mohon tunggu sebentar</p>
                            </div>
                        </div>
                    </div>
                )
            }
        </form >
    );
};

export default VehicleForm;
