import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Platform, PlatformInfo, PlatformService } from '@/types';
import { 
  Twitch, 
  Youtube, 
  MessageCircle, 
  Video, 
  Users, 
  Heart, 
  Eye, 
  ThumbsUp, 
  Clock, 
  Star,
  Zap
} from 'lucide-react';

// Import platform icons
import twitchIcon from '@/assets/icons/twitch.png';
import kickIcon from '@/assets/icons/kick.png';
import youtubeIcon from '@/assets/icons/youtube.png';
import trovoIcon from '@/assets/icons/trovo.png';
import vkplayIcon from '@/assets/icons/vkplay.png';
import dliveIcon from '@/assets/icons/dlive.png';
import telegramIcon from '@/assets/icons/telegram.png';
import bigoIcon from '@/assets/icons/bigo.png';
import bizon365Icon from '@/assets/icons/bizon365.png';
import yappyIcon from '@/assets/icons/yappy.png';
import tiktokIcon from '@/assets/icons/tiktok.png';
import rumbleIcon from '@/assets/icons/rumble.png';
import zoomIcon from '@/assets/icons/zoom.png';

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
    ]
  },
  {
    id: 'kick',
    name: 'Kick',
    icon: kickIcon,
    color: 'bg-green-600',
    services: [
      { id: 'kick-viewers', name: 'Kick.com зрители', description: 'Увеличение зрителей', price: 90, currency: 'RUB', icon: '👥' },
      { id: 'kick-bots', name: 'Kick.com чат-боты', description: 'Боты для чата', price: 180, currency: 'RUB', icon: '🤖' },
      { id: 'kick-followers', name: 'Kick.com подписчики', description: 'Новые фолловеры', price: 45, currency: 'RUB', icon: '❤️' },
      { id: 'kick-views', name: 'Kick.com просмотры', description: 'Увеличение просмотров', price: 70, currency: 'RUB', icon: '👁️' },
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: youtubeIcon,
    color: 'bg-red-600',
    services: [
      { id: 'yt-viewers', name: 'YouTube зрители', description: 'Зрители для стрима', price: 120, currency: 'RUB', icon: '👥' },
      { id: 'yt-bots', name: 'YouTube чат-боты', description: 'Активность в чате', price: 220, currency: 'RUB', icon: '🤖' },
      { id: 'yt-views', name: 'YouTube просмотры', description: 'Просмотры видео', price: 80, currency: 'RUB', icon: '👁️' },
      { id: 'yt-subs', name: 'YouTube подписчики', description: 'Новые подписчики', price: 60, currency: 'RUB', icon: '❤️', popular: true },
      { id: 'yt-likes', name: 'YouTube лайки', description: 'Лайки на видео', price: 30, currency: 'RUB', icon: '👍' },
      { id: 'yt-comments', name: 'YouTube комментарии', description: 'Комментарии под видео', price: 40, currency: 'RUB', icon: '💬' },
      { id: 'yt-hours', name: 'Часы просмотров', description: 'Накрутка времени просмотра', price: 150, currency: 'RUB', icon: '⏱️' },
    ]
  },
  {
    id: 'trovo',
    name: 'Trovo',
    icon: trovoIcon,
    color: 'bg-blue-600',
    services: [
      { id: 'trovo-viewers', name: 'Trovo зрители', description: 'Увеличение зрителей', price: 85, currency: 'RUB', icon: '👥' },
      { id: 'trovo-bots', name: 'Trovo чат-боты', description: 'Боты для чата', price: 170, currency: 'RUB', icon: '🤖' },
      { id: 'trovo-followers', name: 'Trovo подписчики', description: 'Новые подписчики', price: 40, currency: 'RUB', icon: '❤️' },
      { id: 'trovo-views', name: 'Trovo просмотры', description: 'Увеличение просмотров', price: 65, currency: 'RUB', icon: '👁️' },
      { id: 'trovo-likes', name: 'Trovo лайки', description: 'Лайки на стрим', price: 25, currency: 'RUB', icon: '👍' },
    ]
  },
  {
    id: 'vkplay',
    name: 'VKPlay',
    icon: vkplayIcon,
    color: 'bg-blue-500',
    services: [
      { id: 'vk-viewers', name: 'VKPlay зрители', description: 'Зрители для стрима', price: 95, currency: 'RUB', icon: '👥' },
      { id: 'vk-views', name: 'VKPlay просмотры', description: 'Увеличение просмотров', price: 70, currency: 'RUB', icon: '👁️' },
    ]
  },
  {
    id: 'dlive',
    name: 'DLive',
    icon: dliveIcon,
    color: 'bg-yellow-600',
    services: [
      { id: 'dlive-viewers', name: 'DLive зрители', description: 'Зрители для стрима', price: 110, currency: 'RUB', icon: '👥' },
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: telegramIcon,
    color: 'bg-cyan-500',
    services: [
      { id: 'tg-subs', name: 'Telegram подписчики', description: 'Подписчики на канал', price: 35, currency: 'RUB', icon: '❤️' },
      { id: 'tg-views', name: 'Telegram просмотры', description: 'Просмотры постов', price: 20, currency: 'RUB', icon: '👁️' },
    ]
  },
  {
    id: 'bigo',
    name: 'Bigo',
    icon: bigoIcon,
    color: 'bg-purple-500',
    services: [
      { id: 'bigo-viewers', name: 'Bigo зрители', description: 'Зрители для стрима', price: 105, currency: 'RUB', icon: '👥' },
    ]
  },
  {
    id: 'bizon365',
    name: 'Bizon365',
    icon: bizon365Icon,
    color: 'bg-amber-600',
    services: [
      { id: 'bizon-viewers', name: 'Bizon365 зрители', description: 'Зрители для вебинара', price: 130, currency: 'RUB', icon: '👥' },
    ]
  },
  {
    id: 'yappy',
    name: 'Yappy',
    icon: yappyIcon,
    color: 'bg-yellow-500',
    services: [
      { id: 'tiktok-viewers', name: 'TikTok зрители', description: 'Зрители для прямого эфира', price: 115, currency: 'RUB', icon: '👥' },
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: tiktokIcon,
    color: 'bg-gray-800',
    services: [
      { id: 'tiktok-viewers', name: 'TikTok зрители', description: 'Зрители для прямого эфира', price: 115, currency: 'RUB', icon: '👥' },
    ]
  },
  {
    id: 'rumble',
    name: 'Rumble',
    icon: rumbleIcon,
    color: 'bg-orange-600',
    services: [
      { id: 'rumble-viewers', name: 'Rumble зрители', description: 'Зрители для стрима', price: 100, currency: 'RUB', icon: '👥' },
      { id: 'rumble-subs', name: 'Rumble подписчики', description: 'Новые подписчики', price: 55, currency: 'RUB', icon: '❤️' },
    ]
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: zoomIcon,
    color: 'bg-blue-400',
    services: [
      { id: 'zoom-viewers', name: 'Zoom зрители', description: 'Участники конференции', price: 140, currency: 'RUB', icon: '👥' },
    ]
  }
];

interface PlatformSelectorProps {
  onPlatformSelect: (platform: Platform) => void;
  onServiceSelect: (service: PlatformService, platform: Platform) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  onPlatformSelect, 
  onServiceSelect 
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const handlePlatformClick = (platform: Platform) => {
    setSelectedPlatform(selectedPlatform === platform ? null : platform);
    onPlatformSelect(platform);
  };

  const selectedPlatformData = platformsData.find(p => p.id === selectedPlatform);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Выберите платформу</h2>
        <p className="text-muted-foreground">Мы работаем со всеми популярными платформами</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {platformsData.map((platform) => (
          <motion.div
            key={platform.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
              <Card
                className={`p-4 cursor-pointer transition-all border-2 hover:shadow-lg ${
                  selectedPlatform === platform.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handlePlatformClick(platform.id)}
              >
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <img 
                      src={platform.icon} 
                      alt={platform.name} 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {platform.name}
                  </div>
                </div>
              </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedPlatformData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <img 
                    src={selectedPlatformData.icon} 
                    alt={selectedPlatformData.name} 
                    className="w-6 h-6 object-contain"
                  />
                  Услуги {selectedPlatformData.name}
                </h3>
                <Separator />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedPlatformData.services.map((service) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-all cursor-pointer border hover:border-primary/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{service.icon}</div>
                        {service.popular && (
                          <Badge variant="default" className="text-xs">
                            Популярное
                          </Badge>
                        )}
                      </div>

                      <h4 className="font-semibold text-foreground mb-2">
                        {service.name}
                      </h4>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">
                          {service.price} {service.currency}
                        </div>
                        
                        <Button 
                          size="sm"
                          onClick={() => onServiceSelect(service, selectedPlatformData.id)}
                        >
                          Заказать
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};