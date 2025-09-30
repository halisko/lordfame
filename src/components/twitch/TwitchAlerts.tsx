import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Heart, UserPlus, Gift, Zap, Eye, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertConfig {
  id: string;
  type: 'follow' | 'subscribe' | 'donate' | 'raid' | 'cheer';
  enabled: boolean;
  sound: string;
  volume: number;
  duration: number;
  message: string;
}

interface AlertPreview {
  type: string;
  username: string;
  amount?: number;
  message?: string;
}

export const TwitchAlerts: React.FC = () => {
  const { toast } = useToast();

  const [alerts, setAlerts] = useState<AlertConfig[]>([
    {
      id: '1',
      type: 'follow',
      enabled: true,
      sound: 'default',
      volume: 80,
      duration: 5,
      message: '{username} теперь с нами!'
    },
    {
      id: '2',
      type: 'subscribe',
      enabled: true,
      sound: 'celebration',
      volume: 90,
      duration: 7,
      message: '{username} подписался на канал!'
    },
    {
      id: '3',
      type: 'donate',
      enabled: true,
      sound: 'coins',
      volume: 85,
      duration: 6,
      message: '{username} задонатил {amount}₽!'
    }
  ]);

  const [previewAlert, setPreviewAlert] = useState<AlertPreview | null>(null);

  const getAlertIcon = (type: string) => {
    const icons = {
      follow: <UserPlus className="w-5 h-5" />,
      subscribe: <Heart className="w-5 h-5" />,
      donate: <Gift className="w-5 h-5" />,
      raid: <Zap className="w-5 h-5" />,
      cheer: <Bell className="w-5 h-5" />
    };
    return icons[type as keyof typeof icons] || <Bell className="w-5 h-5" />;
  };

  const getAlertTitle = (type: string) => {
    const titles = {
      follow: 'Новый фолловер',
      subscribe: 'Новая подписка',
      donate: 'Донат',
      raid: 'Рейд',
      cheer: 'Cheers'
    };
    return titles[type as keyof typeof titles] || type;
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
    
    const alert = alerts.find(a => a.id === id);
    toast({
      title: alert?.enabled ? 'Алерт выключен' : 'Алерт включён',
      description: `${getAlertTitle(alert?.type || '')} ${alert?.enabled ? 'выключен' : 'включён'}`
    });
  };

  const handleTestAlert = (type: string) => {
    setPreviewAlert({
      type,
      username: 'TestUser',
      amount: type === 'donate' ? 100 : undefined,
      message: type === 'donate' ? 'Спасибо за стрим!' : undefined
    });

    setTimeout(() => setPreviewAlert(null), 5000);
  };

  const handleVolumeChange = (id: string, volume: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, volume } : alert
    ));
  };

  return (
    <div className="space-y-6">
      {/* Alert Preview */}
      {previewAlert && (
        <Card className="p-6 bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
              {getAlertIcon(previewAlert.type)}
            </div>
            <div>
              <div className="text-lg font-bold text-primary mb-1">
                {getAlertTitle(previewAlert.type)}
              </div>
              <div className="text-foreground">
                {previewAlert.type === 'donate' 
                  ? `${previewAlert.username} задонатил ${previewAlert.amount}₽!`
                  : `${previewAlert.username} ${getAlertTitle(previewAlert.type).toLowerCase()}!`
                }
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alerts">
              <Bell className="w-4 h-4 mr-2" />
              Настройки алертов
            </TabsTrigger>
            <TabsTrigger value="overlay">
              <Eye className="w-4 h-4 mr-2" />
              URL для OBS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {getAlertTitle(alert.type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {alert.message}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.enabled ? 'default' : 'secondary'}>
                        {alert.enabled ? 'Включено' : 'Выключено'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleAlert(alert.id)}
                      >
                        {alert.enabled ? 'Выключить' : 'Включить'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestAlert(alert.type)}
                      >
                        Тест
                      </Button>
                    </div>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-4">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={alert.volume}
                      onChange={(e) => handleVolumeChange(alert.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12">
                      {alert.volume}%
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Длительность:</span>
                    <Input
                      type="number"
                      value={alert.duration}
                      onChange={(e) => setAlerts(alerts.map(a => 
                        a.id === alert.id ? { ...a, duration: parseInt(e.target.value) } : a
                      ))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">секунд</span>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="overlay" className="space-y-4">
            <Card className="p-4 bg-card/50">
              <h4 className="font-semibold mb-3">Browser Source для OBS</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Скопируйте этот URL и добавьте как Browser Source в OBS Studio
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value="https://wwbots.app/overlay/alerts?token=YOUR_TOKEN"
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText('https://wwbots.app/overlay/alerts?token=YOUR_TOKEN');
                    toast({
                      title: 'Скопировано',
                      description: 'URL скопирован в буфер обмена'
                    });
                  }}
                >
                  Копировать
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <h4 className="font-semibold mb-2 text-blue-400">Инструкция</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Откройте OBS Studio</li>
                <li>Добавьте источник "Browser"</li>
                <li>Вставьте скопированный URL</li>
                <li>Установите размер 1920x1080</li>
                <li>Нажмите "ОК"</li>
              </ol>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};