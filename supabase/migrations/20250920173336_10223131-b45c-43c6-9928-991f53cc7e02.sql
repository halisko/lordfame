-- Fix the last security warning by updating generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number(platform_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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