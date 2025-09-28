import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Platform, PlatformInfo, PlatformService } from '@/types';
import { 
  Users, 
  Heart, 
  Eye, 
  Star,
  Film,
  Zap
} from 'lucide-react';

// Import platform icons
import twitchIcon from '@/assets/icons/twitch.png';

const platformsData: PlatformInfo[] = [
  {
    id: 'twitch',
    name: 'Twitch',
    icon: twitchIcon,
    color: 'bg-purple-600',
    services: [
      { id: 'twitch-viewers', name: 'Twitch зрители', description: 'Увеличение числа зрителей', price: 100, currency: 'RUB', icon: '👥' },
      { id: 'twitch-followers', name: 'Twitch фолловеры', description: 'Новые подписчики', price: 50, currency: 'RUB', icon: '❤️' },
      { id: 'twitch-views', name: 'Twitch просмотры', description: 'Увеличение просмотров', price: 75, currency: 'RUB', icon: '👁️' },
      { id: 'twitch-bots', name: 'Twitch чат-боты', description: 'Активность в чате', price: 200, currency: 'RUB', icon: '🤖', popular: true },
      { id: 'twitch-clip-views', name: 'Twitch клипы', description: 'Просмотры клипов', price: 90, currency: 'RUB', icon: '🎬' },
      { id: 'twitch-channel-points', name: 'Twitch поинты', description: 'Активность поинтов канала', price: 130, currency: 'RUB', icon: '⭐' },
    ]
  }
];

interface PlatformSelectorProps {
  onPlatformSelect: (platform: Platform) => void;
  onServiceSelect: (service: PlatformService, platform: Platform) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  onPlatformSelect,
  onServiceSelect,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('twitch');
  
  const handlePlatformClick = (platform: Platform) => {
    setSelectedPlatform(platform);
    onPlatformSelect(platform);
  };

  const getServiceIcon = (service: PlatformService) => {
    if (service.icon === '👥') return <Users className="w-4 h-4" />;
    if (service.icon === '❤️') return <Heart className="w-4 h-4" />;
    if (service.icon === '👁️') return <Eye className="w-4 h-4" />;
    if (service.icon === '⭐') return <Star className="w-4 h-4" />;
    if (service.icon === '🎬') return <Film className="w-4 h-4" />;
    if (service.icon === '🤖') return <Zap className="w-4 h-4" />;
    return <div className="w-4 h-4 text-center text-xs">{service.icon}</div>;
  };

  const selectedPlatformData = platformsData.find(p => p.id === selectedPlatform);

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Выберите услуги для Twitch
        </h2>
        <p className="text-muted-foreground">
          Профессиональная накрутка активности для вашего Twitch канала
        </p>
      </div>

      {/* Platform Card */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
              <img 
                src={twitchIcon} 
                alt="Twitch" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Twitch</h3>
              <p className="text-muted-foreground">
                Ведущая стриминговая платформа
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                6 услуг
              </Badge>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedPlatformData?.services.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-4 h-full cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getServiceIcon(service)}
                      {service.popular && (
                        <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
                          Популярно
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        {service.price} ₽
                      </div>
                      <div className="text-xs text-muted-foreground">
                        за 24 часа
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground text-sm">
                      {service.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <Button
                    onClick={() => onServiceSelect(service, selectedPlatform)}
                    className="w-full"
                    size="sm"
                  >
                    Добавить в корзину
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Features */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <h4 className="font-medium text-foreground mb-1">Быстрый старт</h4>
            <p className="text-xs text-muted-foreground">
              Услуги активируются в течение 15 минут
            </p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <h4 className="font-medium text-foreground mb-1">Качество</h4>
            <p className="text-xs text-muted-foreground">
              Только реальные аккаунты и активность
            </p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <h4 className="font-medium text-foreground mb-1">Поддержка 24/7</h4>
            <p className="text-xs text-muted-foreground">
              Всегда готовы помочь с вопросами
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};