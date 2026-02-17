import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Fuel, Gauge, MapPin, Phone, Share2, Heart, ChevronLeft, ChevronRight, ShoppingCart, KeyRound, Settings2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingDialog from "@/components/BookingDialog";
import { vehicleService } from "@/lib/vehicleService";
import { type VehicleDetail as VehicleDetailType } from "@/types/vehicle";
import { formatCurrency } from "@/lib/utils";

const VehicleDetail = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<VehicleDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingTab, setBookingTab] = useState<"sewa" | "beli">("sewa");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    vehicleService
      .getById(id)
      .then((data) => {
        if (!cancelled) setVehicle(data);
      })
      .catch((err) => console.error("Failed to load vehicle:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center pt-24">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="font-body text-sm text-muted-foreground">Memuat detail kendaraan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">Kendaraan Tidak Ditemukan</h1>
            <Link to="/kendaraan" className="mt-4 inline-block text-primary hover:underline">← Kembali ke Daftar</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const gallery = vehicle.gallery?.length ? vehicle.gallery : [vehicle.image];

  const prevImage = () => setActiveImage((i) => (i === 0 ? gallery.length - 1 : i - 1));
  const nextImage = () => setActiveImage((i) => (i === gallery.length - 1 ? 0 : i + 1));

  const openBooking = (tab: "sewa" | "beli") => {
    setBookingTab(tab);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pb-20 pt-24">
        <Link to="/kendaraan" className="mb-6 inline-flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kendaraan
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-5">
          {/* Gallery */}
          <div className="lg:col-span-3">
            <div className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-border">
              <img
                src={gallery[activeImage]}
                alt={`${vehicle.name} - Foto ${activeImage + 1}`}
                className="h-full w-full object-cover transition-transform duration-500"
              />
              {vehicle.badge && (
                <span className="bg-gradient-gold absolute left-4 top-4 rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase text-primary-foreground">
                  {vehicle.badge}
                </span>
              )}
              <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur-sm transition hover:bg-background">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur-sm transition hover:bg-background">
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 right-3 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                {activeImage + 1}/{gallery.length}
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === activeImage ? "border-primary" : "border-border opacity-60 hover:opacity-100"
                    }`}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display text-2xl font-bold text-card-foreground lg:text-3xl">{vehicle.name}</h1>
                <div className="flex gap-2">
                  <button onClick={() => setIsFav(!isFav)} className={`rounded-full border p-2 transition-all ${isFav ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                    <Heart className={`h-5 w-5 ${isFav ? "fill-primary" : ""}`} />
                  </button>
                  <button className="rounded-full border border-border p-2 text-muted-foreground transition-all hover:border-primary hover:text-primary">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-muted-foreground">
                <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs">
                  <Calendar className="h-3.5 w-3.5" /> {vehicle.year}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs">
                  <Fuel className="h-3.5 w-3.5" /> {vehicle.fuel}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs">
                  <Gauge className="h-3.5 w-3.5" /> {vehicle.mileage}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs">
                  <Settings2 className="h-3.5 w-3.5" /> {vehicle.transmission}
                </span>
              </div>

              <div className="mt-6 rounded-lg bg-accent/30 p-4">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Harga Jual</p>
                <p className="font-display text-3xl font-bold text-primary">{formatCurrency(vehicle.priceNumeric)}</p>
                {vehicle.rentalPrice && (
                  <div className="mt-2 border-t border-border pt-2">
                    <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Harga Sewa / Hari</p>
                    <p className="font-display text-xl font-semibold text-foreground">{formatCurrency(vehicle.rentalPrice)}</p>
                  </div>
                )}
              </div>

              <p className="mt-5 font-body text-sm leading-relaxed text-muted-foreground">{vehicle.description}</p>

              <div className="mt-5 flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                  {vehicle.seller.name.charAt(0)}
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-card-foreground">{vehicle.seller.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {vehicle.seller.location}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {vehicle.rentalPrice && (
                  <button
                    onClick={() => openBooking("sewa")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-gold py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-transform hover:scale-[1.02]"
                  >
                    <KeyRound className="h-5 w-5" />
                    Sewa Kendaraan
                  </button>
                )}
                <button
                  onClick={() => openBooking("beli")}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[hsl(142,70%,40%)] py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-[hsl(142,70%,35%)]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Beli Kendaraan
                </button>
                <a
                  href={`tel:+${vehicle.seller.phone}`}
                  className="flex items-center justify-center gap-2 rounded-lg border border-primary py-3 font-display text-sm font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <Phone className="h-5 w-5" /> Telepon Penjual
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-bold text-card-foreground">
            Spesifikasi <span className="text-gradient-gold">Lengkap</span>
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vehicle.color && (
              <div className="rounded-lg border border-border bg-accent/20 p-4">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Warna</p>
                <p className="mt-1 font-display text-lg font-semibold text-card-foreground">{vehicle.color}</p>
              </div>
            )}
            {vehicle.engine && (
              <div className="rounded-lg border border-border bg-accent/20 p-4">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Mesin</p>
                <p className="mt-1 font-display text-lg font-semibold text-card-foreground">{vehicle.engine}</p>
              </div>
            )}
            {vehicle.capacity && (
              <div className="rounded-lg border border-border bg-accent/20 p-4">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Kapasitas</p>
                <p className="mt-1 font-display text-lg font-semibold text-card-foreground">{vehicle.capacity} Orang</p>
              </div>
            )}
            {vehicle.horsepower && (
              <div className="rounded-lg border border-border bg-accent/20 p-4">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Tenaga</p>
                <p className="mt-1 font-display text-lg font-semibold text-card-foreground">{vehicle.horsepower} HP</p>
              </div>
            )}
            {vehicle.torque && (
              <div className="rounded-lg border border-border bg-accent/20 p-4">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Torsi</p>
                <p className="mt-1 font-display text-lg font-semibold text-card-foreground">{vehicle.torque} Nm</p>
              </div>
            )}
            {/* Show license plate only if user is logged in (optional) or always if public requirement */}
            {vehicle.licensePlate && (
              <div className="rounded-lg border border-border bg-accent/20 p-4">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Plat Nomor</p>
                <p className="mt-1 font-mono text-lg font-semibold text-card-foreground">{vehicle.licensePlate}</p>
              </div>
            )}


          </div>
        </div>
      </main>

      <Footer />

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        vehicle={vehicle}
        defaultTab={bookingTab}
      />
    </div>
  );
};

export default VehicleDetail;
