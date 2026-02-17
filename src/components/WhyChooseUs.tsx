import { ShieldCheck, Clock, Wallet, Headphones } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Terpercaya & Aman",
    desc: "Semua kendaraan melalui inspeksi ketat 150 titik pengecekan.",
  },
  {
    icon: Clock,
    title: "Proses Cepat",
    desc: "Proses jual beli & rental yang mudah dan cepat, tanpa ribet.",
  },
  {
    icon: Wallet,
    title: "Harga Terbaik",
    desc: "Garansi harga kompetitif dengan opsi cicilan fleksibel.",
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    desc: "Tim customer service siap membantu Anda kapan saja.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="border-t border-border bg-card py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-display text-4xl font-bold uppercase tracking-wide text-foreground">
          Kenapa <span className="text-gradient-gold">AutoRaya?</span>
        </h2>
        <p className="mt-2 text-center font-body text-muted-foreground">
          Kami memberikan pengalaman terbaik dalam jual beli & rental kendaraan
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-background p-6 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-gold"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 font-body text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
