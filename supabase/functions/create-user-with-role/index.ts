// Deno Edge Function: create-user-with-role
// Creates a Supabase auth user (admin API) and assigns a role in user_profiles.
// Ensure you set environment variables in Supabase:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.5';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const adminClient = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { email, password, full_name, phone, role } = body ?? {};

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: 'email, password, and role are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1) Create auth user and mark email confirmed
    const { data: userData, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone },
    });
    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User not returned from auth' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2) Lookup role id
    const { data: roleRow, error: roleErr } = await adminClient
      .from('roles')
      .select('id')
      .eq('name', role)
      .maybeSingle();
    if (roleErr || !roleRow?.id) {
      return new Response(JSON.stringify({ error: roleErr?.message || 'Role not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3) Assign role to user_profile (profile is auto-created by trigger)
    const { error: updateErr } = await adminClient
      .from('user_profiles')
      .update({
        role_id: roleRow.id,
        full_name: full_name ?? null,
        phone: phone ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateErr) {
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ user_id: userId, role }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

