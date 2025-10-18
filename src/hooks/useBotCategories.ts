import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot as BotType } from '@/types';

export interface BotCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface BotFromDB extends BotType {
  user_id: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useBotCategories = () => {
  const [categories, setCategories] = useState<BotCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryBots, setCategoryBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Сортируем в правильном порядке
      const sortedData = (data || []).sort((a, b) => {
        const order = ['Мульти боты', 'Боты для GTA 5', 'Боты для CS 2', 'Боты для Dota 2'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
      
      setCategories(sortedData);
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

  const fetchBotsByCategory = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database bots to Bot type
      const mappedBots: BotType[] = (data || []).map(bot => ({
        id: bot.id,
        nickname: bot.nickname,
        token: bot.token,
        platform: bot.platform as BotType['platform'],
        connected: bot.connected,
        status: bot.status as BotType['status'],
        proxy: bot.proxy || undefined,
        country: bot.country || undefined,
      }));
      
      setCategoryBots(mappedBots);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteBot = async (botId: string) => {
    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId);

      if (error) throw error;
      
      toast({
        title: 'Успешно',
        description: 'Бот удален',
      });
      
      // Обновляем список ботов
      if (selectedCategory) {
        fetchBotsByCategory(selectedCategory);
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchBotsByCategory(selectedCategory);
    } else {
      setCategoryBots([]);
    }
  }, [selectedCategory]);

  return {
    categories,
    categoryBots,
    selectedCategory,
    setSelectedCategory,
    loading,
    refreshCategories: fetchCategories,
    deleteBot,
  };
};
