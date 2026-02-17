import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// ---- Types ----

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    address: string;
    role: "admin" | "member";
    id_card_url?: string;
    updated_at: string;
}

// ---- Auth functions ----

export async function signUp(
    email: string,
    password: string,
    fullName: string
): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
        },
    });

    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
}

export async function signIn(
    email: string,
    password: string
): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
}

export async function signOut(): Promise<void> {
    await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Failed to fetch profile:", error.message);
        return null;
    }
    return data as Profile;
}

export async function updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, "full_name" | "phone" | "address">>
): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select("*")
        .single();

    if (error) {
        console.error("Failed to update profile:", error.message);
        return null;
    }
    return data as Profile;
}

export async function isAdmin(userId: string): Promise<boolean> {
    const profile = await getProfile(userId);
    return profile?.role === "admin";
}
