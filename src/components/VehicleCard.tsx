import { Fuel, Gauge, Calendar, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { type Vehicle } from "@/types/vehicle";
import { formatCurrency } from "@/lib/utils";

export type { Vehicle };

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  return (
    <Link
      to={`/kendaraan/${vehicle.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-gold"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {vehicle.badge && (
          <span className="bg-gradient-gold absolute left-3 top-3 rounded-full px-3 py-1 font-display text-xs font-bold uppercase text-primary-foreground">
            {vehicle.badge}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-card-foreground group-hover:text-primary">
          {vehicle.name}
        </h3>

        <div className="mt-2 flex flex-wrap gap-2 text-muted-foreground">
          <span className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" /> {vehicle.year}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Fuel className="h-3 w-3" /> {vehicle.fuel}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Gauge className="h-3 w-3" /> {vehicle.mileage}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Settings2 className="h-3 w-3" /> {vehicle.transmission}
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="font-display text-xl font-bold text-primary">{formatCurrency(vehicle.priceNumeric)}</p>
          </div>
          {vehicle.rentalPrice && (
            <p className="font-body text-xs text-muted-foreground">
              Sewa: <span className="font-semibold text-foreground">{formatCurrency(vehicle.rentalPrice)}</span>/hari
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;
