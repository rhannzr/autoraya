
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { contentService, type Testimonial } from "@/lib/contentService";

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        contentService.getTestimonials().then(setTestimonials).catch(console.error);
    }, []);

    if (testimonials.length === 0) return null;

    return (
        <section className="bg-secondary/30 py-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                        Kata <span className="text-gradient-gold">Mereka</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Pengalaman terbaik dari pelanggan setia kami
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="font-body text-muted-foreground leading-relaxed mb-6">
                                "{t.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                {t.image ? (
                                    <img
                                        src={t.image}
                                        alt={t.name}
                                        className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                        {t.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-display text-sm font-bold text-foreground">{t.name}</h4>
                                    <p className="text-xs text-muted-foreground">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
