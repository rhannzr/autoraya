import { Car, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">
                AUTO<span className="text-primary">RAYA</span>
              </span>
            </div>
            <p className="mt-3 font-body text-sm text-muted-foreground">
              Platform jual beli dan rental mobil & motor terpercaya di Indonesia.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Layanan</h4>
            <ul className="mt-3 space-y-2 font-body text-sm text-muted-foreground">
              <li><a href="#" className="transition-colors hover:text-primary">Beli Mobil</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Beli Motor</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Rental Mobil</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Rental Motor</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Perusahaan</h4>
            <ul className="mt-3 space-y-2 font-body text-sm text-muted-foreground">
              <li><a href="#" className="transition-colors hover:text-primary">Tentang Kami</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Karir</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Blog</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Kontak</h4>
            <ul className="mt-3 space-y-2 font-body text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Jakarta, Indonesia</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +62 812-3456-7890</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@autoraya.id</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center font-body text-xs text-muted-foreground">
          © 2026 AutoRaya. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
