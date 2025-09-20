import { useState, useCallback } from 'react';
import { CartItem } from '@/components/ShoppingCart';
import { PlatformService, Platform } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useShoppingCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const addToCart = useCallback((
    service: PlatformService, 
    platform: Platform, 
    platformIcon: string,
    duration: number = 24,
    durationType: 'hours' | 'days' = 'hours'
  ) => {
    const existingItem = cartItems.find(item => 
      item.serviceId === service.id && 
      item.platform === platform &&
      item.duration === duration &&
      item.durationType === durationType
    );

    if (existingItem) {
      setCartItems(prev => prev.map(item =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      
      toast({
        title: "Количество увеличено",
        description: `${service.name} - количество: ${existingItem.quantity + 1}`
      });
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(36).substring(2, 15),
        serviceId: service.id,
        serviceName: service.name,
        platform,
        platformIcon,
        price: service.price,
        currency: service.currency,
        duration,
        durationType,
        quantity: 1,
        addedAt: new Date()
      };

      setCartItems(prev => [...prev, newItem]);
      
      toast({
        title: "Добавлено в корзину",
        description: service.name
      });
    }
  }, [cartItems, toast]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, []);

  const updateDuration = useCallback((itemId: string, duration: number, durationType: 'hours' | 'days') => {
    setCartItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, duration, durationType } : item
    ));
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    
    toast({
      title: "Удалено из корзины",
      description: "Товар удален из корзины"
    });
  }, [toast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    
    toast({
      title: "Корзина очищена",
      description: "Все товары удалены из корзины"
    });
  }, [toast]);

  const checkout = useCallback(async (items: CartItem[]) => {
    if (!user || !profile) {
      throw new Error('Пользователь не авторизован');
    }

    // Рассчитываем общую стоимость
    const totalCost = items.reduce((total, item) => {
      const durationMultiplier = item.durationType === 'days' ? item.duration * 24 : item.duration;
      return total + (item.price * item.quantity * (durationMultiplier / 24));
    }, 0);

    // Проверяем баланс
    if (profile.balance < totalCost) {
      throw new Error('Недостаточно средств на балансе');
    }

    try {
      // Создаем заказы для каждого товара
      const orders = await Promise.all(
        items.map(async (item) => {
          const durationHours = item.durationType === 'days' ? item.duration * 24 : item.duration;
          const itemCost = item.price * item.quantity * (durationHours / 24);
          
          // Генерируем номер заказа
          const { data: orderNumber } = await supabase.rpc('generate_order_number', {
            platform_name: item.platform
          });

          // Создаем заказ
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: user.id,
              order_number: orderNumber,
              platform: item.platform,
              service_name: item.serviceName,
              duration_hours: durationHours,
              price: itemCost,
              status: 'pending',
              expires_at: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();

          if (orderError) throw orderError;

          return order;
        })
      );

      // Списываем средства с баланса
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: profile.balance - totalCost })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Создаем транзакцию
      const { error: transactionError } = await supabase
        .from('balance_transactions')
        .insert({
          user_id: user.id,
          amount: -totalCost,
          type: 'payment',
          description: `Оплата заказов: ${orders.map(o => o.order_number).join(', ')}`
        });

      if (transactionError) throw transactionError;

      // Очищаем корзину
      clearCart();
      setIsCartOpen(false);

      return orders;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }, [user, profile, clearCart]);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  return {
    cartItems,
    isCartOpen,
    addToCart,
    updateQuantity,
    updateDuration,
    removeFromCart,
    clearCart,
    checkout,
    openCart,
    closeCart
  };
};