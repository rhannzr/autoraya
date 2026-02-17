// Seed-specific type — keeps numeric id which will be ignored during Supabase insert
export interface SeedVehicle {
  id: number;
  name: string;
  image: string;
  price: string;
  priceNumeric: number;
  rentalPrice?: string;
  year: number;
  fuel: string;
  mileage: string;
  transmission: "Manual" | "Automatic" | "CVT";
  type: "mobil" | "motor";
  badge?: string;
  gallery: string[];
  description: string;
  specs: { label: string; value: string }[];
  seller: { name: string; phone: string; location: string };
}

export const vehicles: SeedVehicle[] = [

  {
    id: 1, name: "Toyota Avanza 1.5 G", image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&h=400&fit=crop",
    price: "Rp 230 Jt", priceNumeric: 230, rentalPrice: "Rp 450rb", year: 2023, fuel: "Bensin", mileage: "15.000 km", transmission: "Automatic", type: "mobil", badge: "Terlaris",
    gallery: [
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
    ],
    description: "Toyota Avanza 1.5 G dalam kondisi prima. Servis rutin di bengkel resmi, interior bersih dan terawat. Cocok untuk keluarga.",
    specs: [
      { label: "Mesin", value: "1.5L 4 Silinder" },
      { label: "Transmisi", value: "Automatic" },
      { label: "Warna", value: "Putih Metalik" },
      { label: "Kapasitas", value: "7 Penumpang" },
      { label: "Tenaga", value: "104 HP" },
      { label: "Torsi", value: "138 Nm" },
      { label: "Plat Nomor", value: "B (Jakarta)" },
      { label: "Pajak", value: "Hidup s/d Des 2025" },
    ],
    seller: { name: "AutoRaya Jakarta", phone: "6281234567890", location: "Jakarta Selatan" },
  },
  {
    id: 2, name: "Honda CR-V Turbo", image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop",
    price: "Rp 520 Jt", priceNumeric: 520, rentalPrice: "Rp 850rb", year: 2024, fuel: "Bensin", mileage: "5.000 km", transmission: "CVT", type: "mobil", badge: "Baru",
    gallery: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=600&fit=crop",
    ],
    description: "Honda CR-V Turbo terbaru dengan fitur Honda Sensing. Performa dan keamanan terbaik di kelasnya.",
    specs: [
      { label: "Mesin", value: "1.5L Turbo VTEC" },
      { label: "Transmisi", value: "CVT" },
      { label: "Warna", value: "Hitam Crystal" },
      { label: "Kapasitas", value: "5 Penumpang" },
      { label: "Tenaga", value: "190 HP" },
      { label: "Torsi", value: "243 Nm" },
      { label: "Plat Nomor", value: "B (Jakarta)" },
      { label: "Pajak", value: "Hidup s/d Mar 2026" },
    ],
    seller: { name: "AutoRaya Premium", phone: "6281234567891", location: "Jakarta Pusat" },
  },
  {
    id: 3, name: "Mitsubishi Pajero Sport", image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop",
    price: "Rp 580 Jt", priceNumeric: 580, rentalPrice: "Rp 900rb", year: 2023, fuel: "Diesel", mileage: "20.000 km", transmission: "Automatic", type: "mobil",
    gallery: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1546614042-7df3c8e21e39?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
    ],
    description: "Pajero Sport Dakar Ultimate dengan Super Select 4WD. Tangguh di segala medan.",
    specs: [
      { label: "Mesin", value: "2.4L Diesel Turbo" },
      { label: "Transmisi", value: "8-Speed AT" },
      { label: "Warna", value: "Silver Metalik" },
      { label: "Kapasitas", value: "7 Penumpang" },
      { label: "Tenaga", value: "181 HP" },
      { label: "Torsi", value: "430 Nm" },
      { label: "Plat Nomor", value: "D (Bandung)" },
      { label: "Pajak", value: "Hidup s/d Jul 2025" },
    ],
    seller: { name: "AutoRaya Bandung", phone: "6281234567892", location: "Bandung" },
  },
  {
    id: 4, name: "Yamaha NMAX 155", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop",
    price: "Rp 32 Jt", priceNumeric: 32, rentalPrice: "Rp 150rb", year: 2024, fuel: "Bensin", mileage: "2.000 km", transmission: "CVT", type: "motor", badge: "Populer",
    gallery: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop",
    ],
    description: "Yamaha NMAX 155 Connected ABS. Fitur lengkap dengan konektivitas smartphone.",
    specs: [
      { label: "Mesin", value: "155cc Blue Core" },
      { label: "Transmisi", value: "CVT Otomatis" },
      { label: "Warna", value: "Biru Doff" },
      { label: "Kapasitas", value: "2 Penumpang" },
      { label: "Tenaga", value: "15.4 HP" },
      { label: "Torsi", value: "14.4 Nm" },
      { label: "Plat Nomor", value: "B (Jakarta)" },
      { label: "Pajak", value: "Hidup s/d Feb 2026" },
    ],
    seller: { name: "AutoRaya Motor", phone: "6281234567893", location: "Jakarta Timur" },
  },
  {
    id: 5, name: "Honda PCX 160", image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&h=400&fit=crop",
    price: "Rp 34 Jt", priceNumeric: 34, rentalPrice: "Rp 160rb", year: 2024, fuel: "Bensin", mileage: "1.500 km", transmission: "CVT", type: "motor",
    gallery: [
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=600&fit=crop",
    ],
    description: "Honda PCX 160 CBS terbaru. Irit bahan bakar dengan desain premium.",
    specs: [
      { label: "Mesin", value: "160cc eSP+" },
      { label: "Transmisi", value: "CVT Otomatis" },
      { label: "Warna", value: "Merah Marun" },
      { label: "Kapasitas", value: "2 Penumpang" },
      { label: "Tenaga", value: "15.8 HP" },
      { label: "Torsi", value: "14.7 Nm" },
      { label: "Plat Nomor", value: "B (Jakarta)" },
      { label: "Pajak", value: "Hidup s/d Jan 2026" },
    ],
    seller: { name: "AutoRaya Motor", phone: "6281234567893", location: "Jakarta Timur" },
  },
  {
    id: 6, name: "Kawasaki Ninja 250", image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=400&fit=crop",
    price: "Rp 65 Jt", priceNumeric: 65, year: 2023, fuel: "Bensin", mileage: "8.000 km", transmission: "Manual", type: "motor", badge: "Sport",
    gallery: [
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&h=600&fit=crop",
    ],
    description: "Kawasaki Ninja 250 ABS SE. Motor sport bertenaga dengan handling presisi.",
    specs: [
      { label: "Mesin", value: "249cc Twin Cylinder" },
      { label: "Transmisi", value: "6-Speed Manual" },
      { label: "Warna", value: "Hijau KRT" },
      { label: "Kapasitas", value: "2 Penumpang" },
      { label: "Tenaga", value: "39 HP" },
      { label: "Torsi", value: "23.5 Nm" },
      { label: "Plat Nomor", value: "AB (Yogyakarta)" },
      { label: "Pajak", value: "Hidup s/d Sep 2025" },
    ],
    seller: { name: "AutoRaya Jogja", phone: "6281234567894", location: "Yogyakarta" },
  },
  {
    id: 7, name: "Toyota Innova Zenix", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop",
    price: "Rp 420 Jt", priceNumeric: 420, rentalPrice: "Rp 700rb", year: 2024, fuel: "Hybrid", mileage: "3.000 km", transmission: "CVT", type: "mobil", badge: "Hybrid",
    gallery: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
    ],
    description: "Innova Zenix Hybrid Q TSS. Revolusi MPV premium dengan teknologi hybrid Toyota.",
    specs: [
      { label: "Mesin", value: "2.0L Hybrid" },
      { label: "Transmisi", value: "e-CVT" },
      { label: "Warna", value: "Abu-abu Metalik" },
      { label: "Kapasitas", value: "7 Penumpang" },
      { label: "Tenaga", value: "152 HP (Gabungan)" },
      { label: "Torsi", value: "188 Nm" },
      { label: "Plat Nomor", value: "B (Jakarta)" },
      { label: "Pajak", value: "Hidup s/d Apr 2026" },
    ],
    seller: { name: "AutoRaya Jakarta", phone: "6281234567890", location: "Jakarta Selatan" },
  },
  {
    id: 8, name: "Honda Vario 160", image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop",
    price: "Rp 28 Jt", priceNumeric: 28, rentalPrice: "Rp 120rb", year: 2023, fuel: "Bensin", mileage: "5.000 km", transmission: "CVT", type: "motor",
    gallery: [
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop",
    ],
    description: "Honda Vario 160 ABS dengan fitur Smart Key dan USB charging.",
    specs: [
      { label: "Mesin", value: "160cc eSP+" },
      { label: "Transmisi", value: "CVT Otomatis" },
      { label: "Warna", value: "Hitam Doff" },
      { label: "Kapasitas", value: "2 Penumpang" },
      { label: "Tenaga", value: "15.5 HP" },
      { label: "Torsi", value: "14.6 Nm" },
      { label: "Plat Nomor", value: "B (Jakarta)" },
      { label: "Pajak", value: "Hidup s/d Nov 2025" },
    ],
    seller: { name: "AutoRaya Motor", phone: "6281234567893", location: "Jakarta Timur" },
  },
];
