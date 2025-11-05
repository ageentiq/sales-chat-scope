// Deno Edge Function: update-email
// Updates the authenticated user's email immediately without confirmation
// Security: Requires a valid user JWT in the Authorization header

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { newEmail } = await req.json().catch(() => ({}));
    if (
      !newEmail ||
      typeof newEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
    ) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify the token belongs to a user
    const { data: userData, error: getUserError } = await adminClient.auth.getUser(
      token
    );
    if (getUserError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = userData.user.id;

    // Update the user's email immediately and mark it confirmed
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        email: newEmail,
        email_confirm: true,
      }
    );

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error)?.message ?? "Unexpected error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
