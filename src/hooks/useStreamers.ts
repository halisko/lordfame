import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Streamer {
  id: string;
  user_id: string;
  stream_url: string;
  streamer_name: string;
  is_live: boolean;
  created_at: string;
  updated_at: string;
}

export const useStreamers = () => {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStreamers = async () => {
    try {
      const { data, error } = await supabase
        .from('streamers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStreamers(data || []);
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

  const addStreamer = async (streamUrl: string, streamerName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пользователь не авторизован');

      const { data, error } = await supabase
        .from('streamers')
        .insert({
          user_id: user.id,
          stream_url: streamUrl,
          streamer_name: streamerName,
          is_live: false,
        })
        .select()
        .single();

      if (error) throw error;

      setStreamers([data, ...streamers]);
      toast({
        title: 'Успешно',
        description: 'Стример добавлен',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const removeStreamer = async (streamerId: string) => {
    try {
      const { error } = await supabase
        .from('streamers')
        .delete()
        .eq('id', streamerId);

      if (error) throw error;

      setStreamers(streamers.filter(s => s.id !== streamerId));
      toast({
        title: 'Успешно',
        description: 'Стример удален',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchStreamers();
  }, []);

  return {
    streamers,
    loading,
    addStreamer,
    removeStreamer,
    refreshStreamers: fetchStreamers,
  };
};
