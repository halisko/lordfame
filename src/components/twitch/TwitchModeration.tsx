import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Ban, Clock, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BannedWord {
  id: string;
  word: string;
  action: 'timeout' | 'ban' | 'delete';
  duration?: number;
}

interface BannedUser {
  id: string;
  username: string;
  reason: string;
  bannedAt: Date;
  permanent: boolean;
}

interface ModerationAction {
  id: string;
  username: string;
  action: string;
  reason: string;
  timestamp: Date;
  moderator: string;
}

export const TwitchModeration: React.FC = () => {
  const { toast } = useToast();

  const [bannedWords, setBannedWords] = useState<BannedWord[]>([
    { id: '1', word: 'спам', action: 'timeout', duration: 600 },
    { id: '2', word: 'реклама', action: 'delete' }
  ]);

  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([
    {
      id: '1',
      username: 'toxic_user123',
      reason: 'Оскорбления',
      bannedAt: new Date(Date.now() - 3600000),
      permanent: true
    }
  ]);

  const [moderationLog, setModerationLog] = useState<ModerationAction[]>([
    {
      id: '1',
      username: 'user123',
      action: 'Timeout 10 мин',
      reason: 'Спам в чате',
      timestamp: new Date(Date.now() - 1800000),
      moderator: 'bot_moderator'
    }
  ]);

  const [newWord, setNewWord] = useState('');
  const [newAction, setNewAction] = useState<'timeout' | 'ban' | 'delete'>('timeout');

  const handleAddBannedWord = () => {
    if (!newWord) {
      toast({
        title: 'Ошибка',
        description: 'Введите слово для бана',
        variant: 'destructive'
      });
      return;
    }

    const word: BannedWord = {
      id: Date.now().toString(),
      word: newWord,
      action: newAction,
      duration: newAction === 'timeout' ? 600 : undefined
    };

    setBannedWords([...bannedWords, word]);
    setNewWord('');
    
    toast({
      title: 'Слово добавлено',
      description: `"${word.word}" добавлено в фильтр`
    });
  };

  const handleRemoveBannedWord = (id: string) => {
    setBannedWords(bannedWords.filter(w => w.id !== id));
    toast({
      title: 'Слово удалено',
      description: 'Слово удалено из фильтра'
    });
  };

  const getActionBadge = (action: string) => {
    const colors = {
      timeout: 'bg-yellow-500/20 text-yellow-400',
      ban: 'bg-red-500/20 text-red-400',
      delete: 'bg-blue-500/20 text-blue-400'
    };
    return colors[action as keyof typeof colors] || '';
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filters">
            <Shield className="w-4 h-4 mr-2" />
            Фильтры
          </TabsTrigger>
          <TabsTrigger value="bans">
            <Ban className="w-4 h-4 mr-2" />
            Баны
          </TabsTrigger>
          <TabsTrigger value="log">
            <Clock className="w-4 h-4 mr-2" />
            Лог
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="space-y-4">
          {/* Add Banned Word */}
          <Card className="p-4 bg-card/50">
            <h4 className="font-semibold mb-3">Добавить запрещённое слово</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Введите слово"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
              />
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value as any)}
              >
                <option value="timeout">Timeout</option>
                <option value="ban">Ban</option>
                <option value="delete">Удалить сообщение</option>
              </select>
              <Button onClick={handleAddBannedWord}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </div>
          </Card>

          {/* Banned Words List */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Запрещённые слова ({bannedWords.length})
            </h4>
            {bannedWords.map((word) => (
              <Card key={word.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{word.word}</span>
                    <Badge className={getActionBadge(word.action)}>
                      {word.action === 'timeout' && `Timeout ${word.duration}s`}
                      {word.action === 'ban' && 'Ban'}
                      {word.action === 'delete' && 'Удалить'}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveBannedWord(word.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bans" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Забаненные пользователи ({bannedUsers.length})
            </h4>
            {bannedUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-foreground mb-1">{user.username}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Причина: {user.reason}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.bannedAt.toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <Badge variant={user.permanent ? 'destructive' : 'secondary'}>
                    {user.permanent ? 'Permanent' : 'Temporary'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="log" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">
              История модерации
            </h4>
            {moderationLog.map((log) => (
              <Card key={log.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{log.username}</span>
                      <Badge variant="outline">{log.action}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Причина: {log.reason}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.timestamp.toLocaleString('ru-RU')} • Модератор: {log.moderator}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};