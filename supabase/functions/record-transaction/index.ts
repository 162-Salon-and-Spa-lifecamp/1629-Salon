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
  const { transaction } = await req.json();

  // 1. Create the transaction record
  const { data: transactionData, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      staff_id: transaction.staffId,
      total_amount: transaction.totalAmount,
      payment_method: transaction.paymentMethod,
    })
    .select()
    .single();

  if (transactionError) {
    return new Response(JSON.stringify({ error: transactionError.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  // 2. Create the transaction items records
  const transactionItems = transaction.items.map((item) => ({
    transaction_id: transactionData.id,
    product_id: item.id,
    quantity: item.quantity,
    price_at_sale: item.price,
  }));

  const { error: transactionItemsError } = await supabase
    .from('transaction_items')
    .insert(transactionItems);

  if (transactionItemsError) {
    // If this fails, we should roll back the transaction
    await supabase.from('transactions').delete().eq('id', transactionData.id);
    return new Response(JSON.stringify({ error: transactionItemsError.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  // 3. Decrement the stock level of retail items atomically
  for (const item of transaction.items) {
    if (item.isRetail) {
      await supabase.rpc('atomic_decrement_stock', {
        product_id_in: item.id,
        quantity_in: item.quantity,
      });
    }
  }

  return new Response(JSON.stringify(transactionData), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
