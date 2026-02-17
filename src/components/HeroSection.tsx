import { Search, Car, Bike } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-automotive.jpg";

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState<"beli" | "sewa">("beli");
  const [vehicleType, setVehicleType] = useState<"mobil" | "motor">("mobil");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (vehicleType) params.set("type", vehicleType);
    navigate(`/kendaraan?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

      <div className="relative z-10 container mx-auto px-4 pt-20 text-center">
        <h1 className="animate-fade-in-up font-display text-5xl font-bold uppercase tracking-wide text-foreground md:text-7xl">
          Temukan Kendaraan
          <br />
          <span className="text-gradient-gold">Impian Anda</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-body text-lg text-muted-foreground" style={{ animationDelay: "0.2s" }}>
          Jual beli & rental mobil dan motor terpercaya. Ribuan pilihan kendaraan berkualitas dengan harga terbaik.
        </p>

        <div className="mx-auto mt-10 max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {/* Tabs */}
          <div className="mb-4 flex justify-center gap-2">
            {(["beli", "sewa"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-6 py-2 font-display text-sm font-semibold uppercase tracking-wider transition-all ${activeTab === tab
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
              >
                {tab === "beli" ? "Beli" : "Sewa / Rental"}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="rounded-xl border border-border bg-card/80 p-4 backdrop-blur-md">
            <div className="flex flex-col gap-3 md:flex-row">
              {/* Vehicle Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setVehicleType("mobil")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${vehicleType === "mobil"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                >
                  <Car className="h-4 w-4" />
                  Mobil
                </button>
                <button
                  onClick={() => setVehicleType("motor")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${vehicleType === "motor"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                >
                  <Bike className="h-4 w-4" />
                  Motor
                </button>
              </div>

              {/* Search Input */}
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-secondary px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Cari ${vehicleType === "mobil" ? "mobil" : "motor"} yang Anda inginkan...`}
                  className="flex-1 bg-transparent py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <button
                onClick={handleSearch}
                className="bg-gradient-gold rounded-lg px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-gold transition-transform hover:scale-105"
              >
                Cari
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 flex justify-center gap-8 md:gap-16">
            {[
              { label: "Kendaraan", value: "5,000+" },
              { label: "Pelanggan", value: "12,000+" },
              { label: "Kota", value: "50+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-primary md:text-3xl">{stat.value}</p>
                <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
