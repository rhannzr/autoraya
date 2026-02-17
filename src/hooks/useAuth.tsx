import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
    type Profile,
    signIn as authSignIn,
    signUp as authSignUp,
    signOut as authSignOut,
    getProfile,
} from "@/lib/authService";

// ---- Context shape ----

interface SignInResult {
    error: string | null;
    profile: Profile | null;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isAdmin: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<SignInResult>;
    signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- Provider ----

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId: string) => {
        const p = await getProfile(userId);
        setProfile(p);
        return p;
    }, []);

    // Bootstrap: check existing session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) {
                fetchProfile(u.id).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) {
                fetchProfile(u.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    // Returns { error, profile } so callers can check role immediately
    const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
        const { user: u, error } = await authSignIn(email, password);
        if (error) return { error, profile: null };
        if (u) {
            setUser(u);
            const p = await fetchProfile(u.id);
            return { error: null, profile: p };
        }
        return { error: null, profile: null };
    }, [fetchProfile]);

    const signUp = useCallback(async (email: string, password: string, fullName: string) => {
        const { user: u, error } = await authSignUp(email, password, fullName);
        if (error) return error;
        if (u) {
            setUser(u);
            // Profile created by DB trigger; fetch it after a small delay
            setTimeout(() => fetchProfile(u.id), 500);
        }
        return null;
    }, [fetchProfile]);

    const handleSignOut = useCallback(async () => {
        await authSignOut();
        setUser(null);
        setProfile(null);
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) await fetchProfile(user.id);
    }, [user, fetchProfile]);

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                isAdmin: profile?.role === "admin",
                loading,
                signIn,
                signUp,
                signOut: handleSignOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ---- Hook ----

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
