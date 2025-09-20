-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'worker');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create bots table
CREATE TABLE public.bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL,
  proxy TEXT,
  country TEXT,
  connected BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'offline',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL,
  service_name TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create payment methods table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  commission_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert default payment methods
INSERT INTO public.payment_methods (name, description, commission_percent) VALUES
('Банковские карты (Россия)', 'Банковские карты (Россия)', 0.00),
('СБП (Система быстрых платежей)', 'СБП (Система быстрых платежей)', 0.00),
('USDT, BTC, ETH, TON и другие', 'USDT, BTC, ETH, TON и другие', 0.00),
('Tinkoff Pay', 'Tinkoff Pay', 0.00),
('SberPay', 'SberPay', 0.00),
('YooMoney', 'YooMoney', 0.00),
('Международные карты', 'Международные карты', 10.00),
('WebMoney, BitCoin, Скины Steam', 'WebMoney, BitCoin, Скины Steam, PIX, LiteCoin, USDT и Ethereum', 10.00);

-- Create balance transactions table
CREATE TABLE public.balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'payment'
  description TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number(platform_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  -- Get next number for this platform
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders
  WHERE order_number LIKE platform_name || '_%';
  
  -- Format order number
  order_number := platform_name || '_' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN order_number;
END;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Workers can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'worker'));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Workers can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'worker'));

-- RLS Policies for bots
CREATE POLICY "Users can view their own bots"
ON public.bots FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Workers can view all bots"
ON public.bots FOR SELECT
USING (public.has_role(auth.uid(), 'worker'));

CREATE POLICY "Users can manage their own bots"
ON public.bots FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Workers can manage all bots"
ON public.bots FOR ALL
USING (public.has_role(auth.uid(), 'worker'));

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Workers can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'worker'));

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Workers can manage all orders"
ON public.orders FOR ALL
USING (public.has_role(auth.uid(), 'worker'));

-- RLS Policies for payment methods
CREATE POLICY "Everyone can view payment methods"
ON public.payment_methods FOR SELECT
USING (true);

-- RLS Policies for balance transactions
CREATE POLICY "Users can view their own transactions"
ON public.balance_transactions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Workers can view all transactions"
ON public.balance_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'worker'));

CREATE POLICY "Users can create their own transactions"
ON public.balance_transactions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'mrasul200912@gmail.com' THEN 'worker'::user_role
      ELSE 'user'::user_role
    END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bots_updated_at
  BEFORE UPDATE ON public.bots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();