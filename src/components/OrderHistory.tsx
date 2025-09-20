import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';

export interface Order {
  id: string;
  order_number: string;
  platform: string;
  service_name: string;
  duration_hours: number;
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderHistoryProps {
  className?: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ className }) => {
  const { user, isWorker } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Если не модератор, показываем только свои заказы
      if (!isWorker) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading orders:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить историю заказов",
          variant: "destructive"
        });
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'active':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'active':
        return 'Активен';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.platform.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || order.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Истек';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}д ${hours % 24}ч`;
    }
    
    return `${hours}ч ${minutes}м`;
  };

  const platforms = [...new Set(orders.map(order => order.platform))];

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">История заказов</h2>
          </div>
          <Button variant="outline" onClick={loadOrders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, номеру заказа или платформе..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="completed">Завершен</SelectItem>
                <SelectItem value="cancelled">Отменен</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Платформа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все платформы</SelectItem>
                {platforms.map(platform => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {orders.length === 0 ? 'Нет заказов' : 'Заказы не найдены'}
              </h3>
              <p className="text-muted-foreground">
                {orders.length === 0 
                  ? 'Вы еще не делали заказов' 
                  : 'Попробуйте изменить фильтры поиска'
                }
              </p>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4 hover-lift cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {order.service_name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>#{order.order_number}</span>
                          <span>•</span>
                          <span className="capitalize">{order.platform}</span>
                          <span>•</span>
                          <span>{order.duration_hours}ч</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {order.price.toFixed(2)} ₽
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </div>
                      {order.status === 'active' && order.expires_at && (
                        <div className="text-xs text-orange-400">
                          Осталось: {getTimeRemaining(order.expires_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Детали заказа</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Номер заказа:</span>
                  <span className="font-medium">#{selectedOrder.order_number}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Услуга:</span>
                  <span className="font-medium">{selectedOrder.service_name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Платформа:</span>
                  <span className="font-medium capitalize">{selectedOrder.platform}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Длительность:</span>
                  <span className="font-medium">{selectedOrder.duration_hours} часов</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Стоимость:</span>
                  <span className="font-medium text-primary">{selectedOrder.price.toFixed(2)} ₽</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Статус:</span>
                  <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Создан:</span>
                  <span className="font-medium">
                    {new Date(selectedOrder.created_at).toLocaleString('ru-RU')}
                  </span>
                </div>
                
                {selectedOrder.expires_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Истекает:</span>
                    <span className="font-medium">
                      {new Date(selectedOrder.expires_at).toLocaleString('ru-RU')}
                    </span>
                  </div>
                )}
                
                {selectedOrder.status === 'active' && selectedOrder.expires_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Осталось:</span>
                    <span className="font-medium text-orange-400">
                      {getTimeRemaining(selectedOrder.expires_at)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedOrder(null)}>
                  Закрыть
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};