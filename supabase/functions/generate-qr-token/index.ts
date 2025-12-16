import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase URL and service role key are required.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

Deno.serve(async (req) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

  const { error } = await supabase
    .from('qr_tokens')
    .insert({ token, expires_at: expiresAt.toISOString() });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  return new Response(JSON.stringify({ token }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
