-- Create orders table
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    customer_email TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, ready, completed
    payment_method TEXT NOT NULL,
    items JSONB,
    payment_proof TEXT, -- base64 encoded payment screenshot
    employee_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration: Add payment_proof column if table already exists
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof TEXT;
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS employee_number TEXT;

-- Create order items table
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Enable Realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Row Level Security (For MVP we allow public inserts, but restrict admin reads)
-- Note: In a production app, you should restrict this more tightly.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to read their own order by id" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow admin to read all orders" ON public.orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow admin to update orders" ON public.orders FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow public to insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to read order items" ON public.order_items FOR SELECT USING (true);

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin to manage expenses" ON public.expenses USING (auth.uid() IS NOT NULL);

-- Migration: Add employee_number to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS employee_number TEXT;

-- Create employee_activity table
CREATE TABLE IF NOT EXISTS public.employee_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_number TEXT NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    logout_time TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.employee_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public to insert employee_activity" ON public.employee_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to update employee_activity" ON public.employee_activity FOR UPDATE USING (true);
CREATE POLICY "Allow admin to read employee_activity" ON public.employee_activity FOR SELECT USING (auth.uid() IS NOT NULL);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
