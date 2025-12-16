-- Create the Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('MANAGER', 'SUPERVISOR', 'STAFF')),
    job_title VARCHAR(255),
    is_clocked_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    sub_category VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    is_retail BOOLEAN DEFAULT FALSE,
    stock_level INTEGER,
    min_reorder_point INTEGER
);

-- Create the Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('CASH', 'CARD', 'TRANSFER')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the TransactionItems table
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_sale DECIMAL(10, 2) NOT NULL
);

-- Create the Attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    duration_hours DECIMAL(10, 2)
);

-- Enable Row Level Security for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create the qr_tokens table
CREATE TABLE qr_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Enable Row Level Security for the qr_tokens table
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

-- Helper function to get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS table policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all user profiles" ON users FOR SELECT USING (get_my_role() IN ('MANAGER', 'SUPERVISOR'));
CREATE POLICY "Managers can create users" ON users FOR INSERT WITH CHECK (get_my_role() = 'MANAGER');
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Managers can update any profile" ON users FOR UPDATE USING (get_my_role() = 'MANAGER');
CREATE POLICY "Managers can delete users" ON users FOR DELETE USING (get_my_role() = 'MANAGER');

-- PRODUCTS table policies
CREATE POLICY "Authenticated users can view products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can create products" ON products FOR INSERT WITH CHECK (get_my_role() = 'MANAGER');
CREATE POLICY "Managers can update products" ON products FOR UPDATE USING (get_my_role() = 'MANAGER');
CREATE POLICY "Managers can delete products" ON products FOR DELETE USING (get_my_role() = 'MANAGER');

-- TRANSACTIONS table policies
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = staff_id);
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING (get_my_role() IN ('MANAGER', 'SUPERVISOR'));
CREATE POLICY "Authenticated users can create transactions" ON transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- TRANSACTION_ITEMS table policies
CREATE POLICY "Users can manage items for their transactions" ON transaction_items
FOR ALL
USING (
  (
    SELECT TRUE
    FROM transactions
    WHERE transactions.id = transaction_id
  )
);

-- ATTENDANCE table policies
CREATE POLICY "Users can view their own attendance" ON attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all attendance records" ON attendance FOR SELECT USING (get_my_role() IN ('MANAGER', 'SUPERVISOR'));
CREATE POLICY "Users can create their own attendance" ON attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attendance" ON attendance FOR UPDATE USING (auth.uid() = user_id);

-- Function to atomically decrement stock
CREATE OR REPLACE FUNCTION atomic_decrement_stock(product_id_in uuid, quantity_in integer)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_level = stock_level - quantity_in
  WHERE id = product_id_in;
END;
$$ LANGUAGE plpgsql;
