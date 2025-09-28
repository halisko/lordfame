import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart as ShoppingCartIcon, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  Calendar,
  CreditCard,
  X
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  platform: string;
  platformIcon: string;
  price: number;
  currency: string;
  duration: number; // в часах
  durationType: 'hours' | 'days';
  quantity: number;
  addedAt: Date;
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateDuration: (itemId: string, duration: number, durationType: 'hours' | 'days') => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: (items: CartItem[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onUpdateDuration,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateItemTotal = (item: CartItem) => {
    const durationMultiplier = item.durationType === 'days' ? item.duration * 24 : item.duration;
    return item.price * item.quantity * (durationMultiplier / 24); // Цена за день
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Корзина пуста",
        description: "Добавьте товары в корзину перед оформлением заказа",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await onCheckout(items);
      toast({
        title: "Заказ оформлен",
        description: "Ваш заказ успешно создан и отправлен на обработку"
      });
    } catch (error) {
      toast({
        title: "Ошибка оформления",
        description: "Не удалось оформить заказ. Попробуйте еще раз",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDurationOptions = (durationType: 'hours' | 'days') => {
    if (durationType === 'hours') {
      return Array.from({ length: 24 }, (_, i) => i + 1);
    } else {
      return Array.from({ length: 30 }, (_, i) => i + 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-background border-l border-border shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Корзина</h2>
                  {items.length > 0 && (
                    <Badge variant="secondary">{items.length}</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCartIcon className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Корзина пуста
                    </h3>
                    <p className="text-muted-foreground">
                      Добавьте услуги в корзину для оформления заказа
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Card className="p-4">
                          <div className="space-y-3">
                            {/* Service Info */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={item.platformIcon} 
                                  alt={item.platform} 
                                  className="w-5 h-5 object-contain"
                                />
                                <div>
                                  <h4 className="font-medium text-sm">{item.serviceName}</h4>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {item.platform}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveItem(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Количество:</Label>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Duration Controls */}
                            <div className="space-y-2">
                              <Label className="text-xs">Длительность:</Label>
                              <div className="flex gap-2">
                                <Select
                                  value={item.durationType}
                                  onValueChange={(value: 'hours' | 'days') => 
                                    onUpdateDuration(item.id, item.duration, value)
                                  }
                                >
                                  <SelectTrigger className="w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hours">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Часы
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="days">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Дни
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={item.duration.toString()}
                                  onValueChange={(value) => 
                                    onUpdateDuration(item.id, parseInt(value), item.durationType)
                                  }
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getDurationOptions(item.durationType).map((duration) => (
                                      <SelectItem key={duration} value={duration.toString()}>
                                        {duration} {item.durationType === 'hours' ? 'ч' : 'дн'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-xs text-muted-foreground">Итого:</span>
                              <span className="font-semibold text-primary">
                                {calculateItemTotal(item).toFixed(2)} {item.currency}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Общая сумма:</span>
                    <span className="text-xl font-bold text-primary">
                      {calculateTotal().toFixed(2)} ₽
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={onClearCart}
                      className="flex-1"
                    >
                      Очистить
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                          Оформление...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Оформить
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};