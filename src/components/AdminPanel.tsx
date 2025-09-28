import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Filter, 
  Crown,
  User,
  Wallet,
  Settings,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { Order } from './OrderHistory';

interface UserProfile {
  id: string;
  username: string;
  role: 'user' | 'worker';
  balance: number;
  created_at: string;
  updated_at: string;
  email?: string;
  orders_count?: number;
  total_spent?: number;
}

interface AdminPanelProps {
  className?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ className }) => {
  const { user, isModerator } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    role: 'user' as 'user' | 'worker',
    balance: 0
  });

  useEffect(() => {
    if (isModerator) {
      loadUsers();
      loadOrders();
    }
  }, [isModerator]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Загружаем пользователей с дополнительной информацией
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error loading users:', profilesError);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список пользователей",
          variant: "destructive"
        });
        return;
      }

      // Загружаем статистику заказов для каждого пользователя
      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const { data: orderStats } = await supabase
            .from('orders')
            .select('id, price')
            .eq('user_id', profile.id);

          return {
            ...profile,
            orders_count: orderStats?.length || 0,
            total_spent: orderStats?.reduce((sum, order) => sum + order.price, 0) || 0
          };
        })
      );

      setUsers(usersWithStats as UserProfile[]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'worker') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось изменить роль пользователя",
          variant: "destructive"
        });
      } else {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        
        toast({
          title: "Роль изменена",
          description: `Роль пользователя изменена на ${newRole === 'worker' ? 'модератор' : 'пользователь'}`
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const updateUserBalance = async (userId: string, newBalance: number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user balance:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось изменить баланс пользователя",
          variant: "destructive"
        });
      } else {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, balance: newBalance } : user
        ));
        
        toast({
          title: "Баланс изменен",
          description: `Баланс пользователя изменен на ${newBalance.toFixed(2)} ₽`
        });
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      role: user.role,
      balance: user.balance
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          role: editForm.role,
          balance: editForm.balance
        })
        .eq('id', selectedUser.id);

      if (error) {
        console.error('Error updating user:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить изменения",
          variant: "destructive"
        });
      } else {
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...editForm }
            : user
        ));
        
        setIsEditModalOpen(false);
        setSelectedUser(null);
        
        toast({
          title: "Изменения сохранены",
          description: "Данные пользователя успешно обновлены"
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getOrderStatusStats = () => {
    const stats = {
      pending: orders.filter(o => o.status === 'pending').length,
      active: orders.filter(o => o.status === 'active').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    return stats;
  };

  const getTotalRevenue = () => {
    return orders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + order.price, 0);
  };

  if (!isModerator) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="p-6 text-center">
          <Ban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Доступ запрещен
          </h3>
          <p className="text-muted-foreground">
            Эта страница доступна только модераторам
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const orderStats = getOrderStatusStats();

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Панель модератора</h2>
          </div>
          <Button variant="outline" onClick={() => { loadUsers(); loadOrders(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего пользователей</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активные заказы</p>
                <p className="text-2xl font-bold text-foreground">{orderStats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Завершенные заказы</p>
                <p className="text-2xl font-bold text-foreground">{orderStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Общая выручка</p>
                <p className="text-2xl font-bold text-foreground">{getTotalRevenue().toFixed(2)} ₽</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-4">
              {/* Filters */}
              <Card className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск по имени или ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все роли</SelectItem>
                      <SelectItem value="user">Пользователи</SelectItem>
                      <SelectItem value="worker">Модераторы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Users List */}
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            {user.role === 'worker' ? (
                              <Crown className="w-5 h-5 text-primary" />
                            ) : (
                              <User className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">
                                {user.username}
                              </h4>
                              <Badge variant={user.role === 'worker' ? 'default' : 'secondary'}>
                                {user.role === 'worker' ? 'Модератор' : 'Пользователь'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>ID: {user.id.slice(0, 8)}...</span>
                              <span>•</span>
                              <span>Баланс: {user.balance.toFixed(2)} ₽</span>
                              <span>•</span>
                              <span>Заказов: {user.orders_count}</span>
                              <span>•</span>
                              <span>Потрачено: {user.total_spent?.toFixed(2)} ₽</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </Button>
                          
                          <Button
                            size="sm"
                            variant={user.role === 'worker' ? 'destructive' : 'default'}
                            onClick={() => updateUserRole(
                              user.id, 
                              user.role === 'worker' ? 'user' : 'worker'
                            )}
                          >
                            {user.role === 'worker' ? (
                              <>
                                <User className="w-4 h-4 mr-2" />
                                Снять права
                              </>
                            ) : (
                              <>
                                <Crown className="w-4 h-4 mr-2" />
                                Дать права
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.slice(0, 20).map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {order.service_name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>#{order.order_number}</span>
                        <span>•</span>
                        <span className="capitalize">{order.platform}</span>
                        <span>•</span>
                        <span>{order.price.toFixed(2)} ₽</span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline"
                      className={
                        order.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : order.status === 'active'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : order.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400 border-red-500/50'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                      }
                    >
                      {order.status === 'pending' && 'Ожидает'}
                      {order.status === 'active' && 'Активен'}
                      {order.status === 'completed' && 'Завершен'}
                      {order.status === 'cancelled' && 'Отменен'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Настройки системы
              </h3>
              <p className="text-muted-foreground">
                Здесь будут настройки системы, управление платежными методами и другие административные функции.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Имя пользователя
              </label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Роль
              </label>
              <Select 
                value={editForm.role} 
                onValueChange={(value: 'user' | 'worker') => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="worker">Модератор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Баланс (₽)
              </label>
              <Input
                type="number"
                step="0.01"
                value={editForm.balance}
                onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button onClick={handleSaveUser} className="flex-1">
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};