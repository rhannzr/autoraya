import { supabase } from "@/lib/supabase";

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    image: string;
    rating: number;
    created_at?: string;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    created_at?: string;
}

// ---- Testimonials ----

export const getTestimonials = async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
};

export const createTestimonial = async (
    input: Omit<Testimonial, "id" | "created_at">
): Promise<Testimonial> => {
    const { data, error } = await supabase
        .from("testimonials")
        .insert(input)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const updateTestimonial = async (
    id: string,
    input: Partial<Omit<Testimonial, "id" | "created_at">>
): Promise<void> => {
    const { error } = await supabase
        .from("testimonials")
        .update(input)
        .eq("id", id);

    if (error) throw new Error(error.message);
};

export const deleteTestimonial = async (id: string): Promise<void> => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) throw new Error(error.message);
};

// ---- FAQs ----

export const getFAQs = async (): Promise<FAQ[]> => {
    const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("created_at", { ascending: true }); // Usually FAQs are ordered logically, possibly by creation or a 'sort_order' field if exists. Defaulting to created_at asc.

    if (error) throw new Error(error.message);
    return data || [];
};

export const createFAQ = async (
    input: Omit<FAQ, "id" | "created_at">
): Promise<FAQ> => {
    const { data, error } = await supabase
        .from("faqs")
        .insert(input)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const updateFAQ = async (
    id: string,
    input: Partial<Omit<FAQ, "id" | "created_at">>
): Promise<void> => {
    const { error } = await supabase
        .from("faqs")
        .update(input)
        .eq("id", id);

    if (error) throw new Error(error.message);
};

export const deleteFAQ = async (id: string): Promise<void> => {
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) throw new Error(error.message);
};

export const contentService = {
    getTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
};
