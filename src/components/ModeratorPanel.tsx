import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  DollarSign, 
  Users, 
  Settings, 
  Activity,
  Plus,
  Minus
} from 'lucide-react';

export const ModeratorPanel = () => {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [balanceUser, setBalanceUser] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract'>('add');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!hasPermission('moderator')) {
    return null;
  }

  const handleBalanceUpdate = async () => {
    if (!balanceUser || !balanceAmount) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      const amount = parseFloat(balanceAmount);
      const finalAmount = balanceOperation === 'subtract' ? -amount : amount;

      // Find user by username
      const { data: profiles, error: findError } = await supabase
        .from('profiles')
        .select('id, username, balance')
        .ilike('username', balanceUser);

      if (findError) throw findError;

      if (!profiles || profiles.length === 0) {
        toast({
          title: "Пользователь не найден",
          description: "Проверьте правильность имени пользователя",
          variant: "destructive"
        });
        return;
      }

      const user = profiles[0];
      const newBalance = user.balance + finalAmount;

      if (newBalance < 0) {
        toast({
          title: "Ошибка",
          description: "Недостаточно средств на балансе пользователя",
          variant: "destructive"
        });
        return;
      }

      // Update balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('balance_transactions')
        .insert({
          user_id: user.id,
          amount: finalAmount,
          type: balanceOperation === 'add' ? 'admin_credit' : 'admin_debit',
          description: `Изменение баланса модератором: ${balanceOperation === 'add' ? '+' : '-'}${amount} ₽`
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Баланс обновлен",
        description: `Баланс пользователя ${user.username} ${balanceOperation === 'add' ? 'пополнен на' : 'уменьшен на'} ${amount} ₽`
      });

      setBalanceUser('');
      setBalanceAmount('');
      setBalanceOperation('add');

    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Панель модератора</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Управление балансом
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={balanceUser}
                onChange={(e) => setBalanceUser(e.target.value)}
                placeholder="Введите имя пользователя"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Сумма</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Операция</Label>
              <Select value={balanceOperation} onValueChange={(value: 'add' | 'subtract') => setBalanceOperation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-green-500" />
                      Пополнить
                    </div>
                  </SelectItem>
                  <SelectItem value="subtract">
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-red-500" />
                      Списать
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleBalanceUpdate}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Обновление...' : 'Обновить баланс'}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Просмотр всех пользователей
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Activity className="w-4 h-4 mr-2" />
              Мониторинг активных заказов
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              История транзакций
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Пользователи</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Активные заказы</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Оборот сегодня</p>
                <p className="text-2xl font-bold">- ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Статус системы</p>
                <p className="text-2xl font-bold text-green-500">ОК</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};