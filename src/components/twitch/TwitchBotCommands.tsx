import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit2, Save, X, Timer, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BotCommand {
  id: string;
  trigger: string;
  response: string;
  cooldown: number;
  enabled: boolean;
  usageCount: number;
}

interface AutoReply {
  id: string;
  keywords: string[];
  response: string;
  enabled: boolean;
}

interface TimedMessage {
  id: string;
  message: string;
  interval: number; // minutes
  enabled: boolean;
}

export const TwitchBotCommands: React.FC = () => {
  const { toast } = useToast();
  
  const [commands, setCommands] = useState<BotCommand[]>([
    {
      id: '1',
      trigger: '!discord',
      response: 'Присоединяйся к нашему Discord: discord.gg/example',
      cooldown: 30,
      enabled: true,
      usageCount: 45
    },
    {
      id: '2',
      trigger: '!commands',
      response: 'Доступные команды: !discord, !socials, !donate',
      cooldown: 60,
      enabled: true,
      usageCount: 123
    }
  ]);

  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([
    {
      id: '1',
      keywords: ['привет', 'hello', 'hi'],
      response: 'Привет! Добро пожаловать на стрим!',
      enabled: true
    }
  ]);

  const [timedMessages, setTimedMessages] = useState<TimedMessage[]>([
    {
      id: '1',
      message: 'Не забудь подписаться на канал!',
      interval: 15,
      enabled: true
    }
  ]);

  const [editingCommand, setEditingCommand] = useState<string | null>(null);
  const [newCommand, setNewCommand] = useState({ trigger: '', response: '', cooldown: 30 });

  const handleAddCommand = () => {
    if (!newCommand.trigger || !newCommand.response) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    const command: BotCommand = {
      id: Date.now().toString(),
      trigger: newCommand.trigger,
      response: newCommand.response,
      cooldown: newCommand.cooldown,
      enabled: true,
      usageCount: 0
    };

    setCommands([...commands, command]);
    setNewCommand({ trigger: '', response: '', cooldown: 30 });
    
    toast({
      title: 'Команда добавлена',
      description: `Команда ${command.trigger} успешно создана`
    });
  };

  const handleToggleCommand = (id: string) => {
    setCommands(commands.map(cmd => 
      cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
    ));
  };

  const handleDeleteCommand = (id: string) => {
    setCommands(commands.filter(cmd => cmd.id !== id));
    toast({
      title: 'Команда удалена',
      description: 'Команда успешно удалена'
    });
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="commands" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commands">
            <MessageSquare className="w-4 h-4 mr-2" />
            Команды
          </TabsTrigger>
          <TabsTrigger value="auto-replies">
            Автоответы
          </TabsTrigger>
          <TabsTrigger value="timed">
            <Timer className="w-4 h-4 mr-2" />
            Таймеры
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-4">
          {/* Add New Command */}
          <Card className="p-4 bg-card/50">
            <h4 className="font-semibold mb-3">Добавить команду</h4>
            <div className="grid gap-3">
              <Input
                placeholder="Триггер (например: !discord)"
                value={newCommand.trigger}
                onChange={(e) => setNewCommand({ ...newCommand, trigger: e.target.value })}
              />
              <Input
                placeholder="Ответ бота"
                value={newCommand.response}
                onChange={(e) => setNewCommand({ ...newCommand, response: e.target.value })}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Кулдаун (сек)"
                  value={newCommand.cooldown}
                  onChange={(e) => setNewCommand({ ...newCommand, cooldown: parseInt(e.target.value) })}
                  className="w-32"
                />
                <Button onClick={handleAddCommand} className="ml-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </div>
          </Card>

          {/* Commands List */}
          <div className="space-y-2">
            {commands.map((command) => (
              <Card key={command.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={command.enabled ? 'default' : 'secondary'}>
                        {command.trigger}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Использовано: {command.usageCount} раз
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-2">{command.response}</p>
                    <div className="text-xs text-muted-foreground">
                      Кулдаун: {command.cooldown}с
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleCommand(command.id)}
                    >
                      {command.enabled ? 'Выключить' : 'Включить'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCommand(command.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auto-replies" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Автоматические ответы на ключевые слова</p>
            <p className="text-sm">Функция в разработке</p>
          </div>
        </TabsContent>

        <TabsContent value="timed" className="space-y-4">
          <div className="space-y-2">
            {timedMessages.map((msg) => (
              <Card key={msg.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-2">{msg.message}</p>
                    <div className="text-xs text-muted-foreground">
                      Интервал: каждые {msg.interval} минут
                    </div>
                  </div>
                  <Badge variant={msg.enabled ? 'default' : 'secondary'}>
                    {msg.enabled ? 'Активно' : 'Выключено'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};