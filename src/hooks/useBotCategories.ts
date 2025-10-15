import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BotCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Bot {
  id: string;
  user_id: string;
  nickname: string;
  token: string;
  platform: string;
  connected: boolean;
  status: string;
  category_id: string | null;
  proxy: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export const useBotCategories = () => {
  const [categories, setCategories] = useState<BotCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryBots, setCategoryBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
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
      setCategoryBots(data || []);
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
  };
};
