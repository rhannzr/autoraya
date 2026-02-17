import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
            console.error("Missing one or more SUPABASE env vars");
            return jsonResponse({ error: "Server misconfiguration" }, 500);
        }

        // Verify caller is admin
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return jsonResponse({ error: "Missing authorization header" }, 401);
        }

        const supabaseCaller = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const {
            data: { user: caller },
            error: callerError,
        } = await supabaseCaller.auth.getUser();

        if (callerError || !caller) {
            return jsonResponse(
                { error: callerError?.message || "Invalid or expired token" },
                401,
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: callerProfile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", caller.id)
            .single();

        if (profileError || callerProfile?.role !== "admin") {
            return jsonResponse({ error: "Forbidden - admin access required" }, 403);
        }

        // Parse body
        let body: Record<string, string>;
        try {
            body = await req.json();
        } catch {
            return jsonResponse({ error: "Invalid JSON body" }, 400);
        }

        const { email, password, fullName, phone, address } = body;

        if (!email || !password || !fullName) {
            return jsonResponse(
                { error: "email, password, dan fullName wajib diisi" },
                400,
            );
        }

        if (password.length < 6) {
            return jsonResponse({ error: "Password minimal 6 karakter" }, 400);
        }

        // Create user with Service Role Key (no session switch)
        const { data: newUser, error: createError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName },
            });

        if (createError) {
            console.error("createUser failed:", createError.message);
            return jsonResponse({ error: createError.message }, 400);
        }

        // Insert profile row WITH email
        const { error: insertError } = await supabaseAdmin
            .from("profiles")
            .upsert({
                id: newUser.user.id,
                email: email,
                full_name: fullName,
                phone: phone || "",
                address: address || "",
                role: "member",
            });

        if (insertError) {
            console.error("Profile insert failed:", insertError.message);
            return jsonResponse(
                {
                    error:
                        "User created but profile insert failed: " + insertError.message,
                },
                500,
            );
        }

        return jsonResponse(
            { message: "Member berhasil dibuat!", userId: newUser.user.id },
            201,
        );
    } catch (err) {
        console.error("Unhandled error:", err);
        return jsonResponse(
            { error: (err as Error).message || "Internal server error" },
            500,
        );
    }
});
