import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Timer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { Order } from './OrderHistory';

interface ActiveOrdersProps {
  className?: string;
}

interface OrderTimer {
  orderId: string;
  timeRemaining: number;
  totalDuration: number;
  isRunning: boolean;
}

export const ActiveOrders: React.FC<ActiveOrdersProps> = ({ className }) => {
  const { user, isWorker } = useAuth();
  const { toast } = useToast();
  
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [timers, setTimers] = useState<Map<string, OrderTimer>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveOrders();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = new Map(prev);
        let hasChanges = false;

        newTimers.forEach((timer, orderId) => {
          if (timer.isRunning && timer.timeRemaining > 0) {
            const newTimeRemaining = timer.timeRemaining - 1;
            newTimers.set(orderId, { ...timer, timeRemaining: newTimeRemaining });
            hasChanges = true;

            // Если время истекло, обновляем статус заказа
            if (newTimeRemaining <= 0) {
              completeOrder(orderId);
            }
          }
        });

        return hasChanges ? newTimers : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadActiveOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!isWorker) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading active orders:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить активные заказы",
          variant: "destructive"
        });
      } else {
        setActiveOrders(data || []);
        
        // Инициализируем таймеры
        const newTimers = new Map<string, OrderTimer>();
        data?.forEach(order => {
          if (order.expires_at) {
            const expiresAt = new Date(order.expires_at);
            const now = new Date();
            const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
            const totalDuration = order.duration_hours * 3600; // в секундах
            
            newTimers.set(order.id, {
              orderId: order.id,
              timeRemaining,
              totalDuration,
              isRunning: timeRemaining > 0
            });
          }
        });
        setTimers(newTimers);
      }
    } catch (error) {
      console.error('Error loading active orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (error) {
        console.error('Error completing order:', error);
      } else {
        // Удаляем заказ из активных
        setActiveOrders(prev => prev.filter(order => order.id !== orderId));
        setTimers(prev => {
          const newTimers = new Map(prev);
          newTimers.delete(orderId);
          return newTimers;
        });

        toast({
          title: "Заказ завершен",
          description: "Заказ автоматически завершен по истечении времени"
        });
      }
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const pauseOrder = async (orderId: string) => {
    const timer = timers.get(orderId);
    if (!timer) return;

    setTimers(prev => {
      const newTimers = new Map(prev);
      newTimers.set(orderId, { ...timer, isRunning: false });
      return newTimers;
    });

    toast({
      title: "Заказ приостановлен",
      description: "Выполнение заказа приостановлено"
    });
  };

  const resumeOrder = async (orderId: string) => {
    const timer = timers.get(orderId);
    if (!timer) return;

    setTimers(prev => {
      const newTimers = new Map(prev);
      newTimers.set(orderId, { ...timer, isRunning: true });
      return newTimers;
    });

    toast({
      title: "Заказ возобновлен",
      description: "Выполнение заказа возобновлено"
    });
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) {
        console.error('Error cancelling order:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось отменить заказ",
          variant: "destructive"
        });
      } else {
        setActiveOrders(prev => prev.filter(order => order.id !== orderId));
        setTimers(prev => {
          const newTimers = new Map(prev);
          newTimers.delete(orderId);
          return newTimers;
        });

        toast({
          title: "Заказ отменен",
          description: "Заказ успешно отменен"
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (timer: OrderTimer) => {
    if (timer.totalDuration === 0) return 0;
    return ((timer.totalDuration - timer.timeRemaining) / timer.totalDuration) * 100;
  };

  const getTimeStatus = (timer: OrderTimer) => {
    const percentage = getProgressPercentage(timer);
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'warning';
    return 'normal';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Активные заказы</h2>
            {activeOrders.length > 0 && (
              <Badge variant="secondary">{activeOrders.length}</Badge>
            )}
          </div>
          <Button variant="outline" onClick={loadActiveOrders}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
        </div>

        <div className="grid gap-4">
          {activeOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Timer className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Нет активных заказов
              </h3>
              <p className="text-muted-foreground">
                Активные заказы будут отображаться здесь
              </p>
            </Card>
          ) : (
            activeOrders.map((order) => {
              const timer = timers.get(order.id);
              const timeStatus = timer ? getTimeStatus(timer) : 'normal';
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground text-lg">
                            {order.service_name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>#{order.order_number}</span>
                            <span>•</span>
                            <span className="capitalize">{order.platform}</span>
                            <span>•</span>
                            <span>{order.price.toFixed(2)} ₽</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={
                              timeStatus === 'critical' 
                                ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                : timeStatus === 'warning'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                            }
                          >
                            {timer?.isRunning ? 'Выполняется' : 'Приостановлен'}
                          </Badge>
                        </div>
                      </div>

                      {/* Timer and Progress */}
                      {timer && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Осталось времени:
                              </span>
                            </div>
                            <div className={`font-mono text-lg font-semibold ${
                              timeStatus === 'critical' 
                                ? 'text-red-400'
                                : timeStatus === 'warning'
                                ? 'text-yellow-400'
                                : 'text-primary'
                            }`}>
                              {formatTime(timer.timeRemaining)}
                            </div>
                          </div>
                          
                          <Progress 
                            value={getProgressPercentage(timer)} 
                            className="h-2"
                          />
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Начало</span>
                            <span>{Math.round(getProgressPercentage(timer))}% выполнено</span>
                            <span>Конец</span>
                          </div>
                        </div>
                      )}

                      {/* Controls */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          {timer && (
                            <>
                              {timer.isRunning ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => pauseOrder(order.id)}
                                >
                                  <Pause className="w-4 h-4 mr-2" />
                                  Пауза
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => resumeOrder(order.id)}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Продолжить
                                </Button>
                              )}
                            </>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => completeOrder(order.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Завершить
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelOrder(order.id)}
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Отменить
                        </Button>
                      </div>

                      {/* Warning for critical time */}
                      {timer && timeStatus === 'critical' && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">
                            Внимание! Заказ скоро завершится автоматически
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};