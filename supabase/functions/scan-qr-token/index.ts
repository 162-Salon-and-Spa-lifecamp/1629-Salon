import { createClient } from '@supabase/supabase-js';

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
  const { userId, token } = await req.json();

  // 1. Verify the token
  const { data: tokenData, error: tokenError } = await supabase
    .from('qr_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (tokenError || !tokenData) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  // 2. Check if the token has expired
  const now = new Date();
  const expiresAt = new Date(tokenData.expires_at);

  if (now > expiresAt) {
    return new Response(JSON.stringify({ error: 'Token expired' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  // 3. Toggle the user's attendance
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('is_clocked_in')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
  }

  const nowTimestamp = now.toISOString();

  if (user.is_clocked_in) {
    // Clock Out
    const { data: openRecord, error: openRecordError } = await supabase
      .from('attendance')
      .select('id, clock_in')
      .eq('user_id', userId)
      .is('clock_out', null)
      .single();

    if (openRecordError) {
      return new Response(JSON.stringify({ error: 'Could not find open attendance record' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const startTime = new Date(openRecord.clock_in);
    const totalMs = now.getTime() - startTime.getTime();
    const totalHours = parseFloat((totalMs / (1000 * 60 * 60)).toFixed(2));

    await supabase
      .from('attendance')
      .update({ clock_out: nowTimestamp, duration_hours: totalHours })
      .eq('id', openRecord.id);

    await supabase.from('users').update({ is_clocked_in: false }).eq('id', userId);
  } else {
    // Clock In
    await supabase.from('attendance').insert({ user_id: userId, clock_in: nowTimestamp });
    await supabase.from('users').update({ is_clocked_in: true, lastClockIn: nowTimestamp }).eq('id', userId);
  }

  // 4. Invalidate the token
  await supabase.from('qr_tokens').delete().eq('id', tokenData.id);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
