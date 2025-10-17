import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddBotDialogProps {
  categoryId: string;
  onBotAdded: () => void;
}

export const AddBotDialog: React.FC<AddBotDialogProps> = ({ categoryId, onBotAdded }) => {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [token, setToken] = useState('');
  const [platform, setPlatform] = useState('twitch');
  const [country, setCountry] = useState('');
  const [proxy, setProxy] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim() || !token.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      const { error } = await supabase
        .from('bots')
        .insert({
          user_id: user.id,
          nickname: nickname.trim(),
          token: token.trim(),
          platform,
          category_id: categoryId,
          country: country.trim() || null,
          proxy: proxy.trim() || null,
          connected: false,
          status: 'offline',
        });

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Бот добавлен',
      });

      setNickname('');
      setToken('');
      setCountry('');
      setProxy('');
      setOpen(false);
      onBotAdded();
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Добавить ботов
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a2e] border-white/10">
        <DialogHeader>
          <DialogTitle>Добавить бота</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Ник *</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Введите ник бота"
              className="bg-white/5 border-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Токен *</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Введите токен"
              className="bg-white/5 border-white/10"
              type="password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Платформа</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                <SelectItem value="twitch">Twitch</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="kick">Kick</SelectItem>
                <SelectItem value="trovo">Trovo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Страна</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Например: RU, US, UA"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proxy">Прокси</Label>
            <Input
              id="proxy"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
              placeholder="ip:port:user:pass"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-white/20"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? 'Добавление...' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};