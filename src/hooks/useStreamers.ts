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

  const checkStreamerStatus = async (streamUrl: string): Promise<boolean> => {
    try {
      if (streamUrl.includes('twitch.tv')) {
        const { data, error } = await supabase.functions.invoke('check-twitch-status', {
          body: { streamUrl },
        });

        if (error) {
          console.error('Ошибка проверки статуса Twitch:', error);
          return false;
        }

        return data?.isLive || false;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
      return false;
    }
  };

  const updateStreamerStatus = async (streamerId: string, isLive: boolean) => {
    try {
      const { error } = await supabase
        .from('streamers')
        .update({ is_live: isLive })
        .eq('id', streamerId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const refreshStreamersStatus = async () => {
    setLoading(true);
    try {
      const updates = await Promise.all(
        streamers.map(async (streamer) => {
          const isLive = await checkStreamerStatus(streamer.stream_url);
          await updateStreamerStatus(streamer.id, isLive);
          return { ...streamer, is_live: isLive };
        })
      );
      
      setStreamers(updates);
      toast({
        title: 'Успешно',
        description: 'Статусы стримеров обновлены',
      });
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

  useEffect(() => {
    fetchStreamers();
  }, []);

  return {
    streamers,
    loading,
    addStreamer,
    removeStreamer,
    refreshStreamers: refreshStreamersStatus,
  };
};
