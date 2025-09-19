import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Settings,
  CreditCard,
  ShoppingCart,
  Globe,
  Crown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { GlassCard } from "@/components/GlassCard";
import { StatusIndicator } from "@/components/StatusIndicator";
import { PlatformSelector } from "@/components/PlatformSelector";
import { PaymentSystem } from "@/components/PaymentSystem";
import { ProxyRecommendations } from "@/components/ProxyRecommendations";
import { useNotifications } from "@/components/NotificationSystem";
import { useTwitchBot } from "@/hooks/useTwitchBot";
import { Bot as BotType, Platform, PlatformService, PaymentMethod } from "@/types";

const countries = [
  { code: 'RU', name: 'Россия', flag: '🇷🇺' },
  { code: 'US', name: 'США', flag: '🇺🇸' },
  { code: 'GB', name: 'Великобритания', flag: '🇬🇧' },
  { code: 'DE', name: 'Германия', flag: '🇩🇪' },
  { code: 'FR', name: 'Франция', flag: '🇫🇷' },
  { code: 'IT', name: 'Италия', flag: '🇮🇹' },
  { code: 'ES', name: 'Испания', flag: '🇪🇸' },
  { code: 'CA', name: 'Канада', flag: '🇨🇦' },
  { code: 'AU', name: 'Австралия', flag: '🇦🇺' },
  { code: 'JP', name: 'Япония', flag: '🇯🇵' }
];

const Index: React.FC = () => {
  const { addNotification } = useNotifications();
  const { bots, addBot, removeBot, connectBot, disconnectBot } = useTwitchBot();
  
  // Modal states
  const [isAddBotModalOpen, setIsAddBotModalOpen] = useState(false);
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Form states
  const [botForm, setBotForm] = useState({
    nickname: '',
    token: '',
    platform: 'twitch' as Platform,
    proxy: '',
    country: 'RU'
  });
  
  // Payment state
  const [selectedService, setSelectedService] = useState<{
    service: PlatformService;
    platform: Platform;
  } | null>(null);

  const handleAddBot = () => {
    const { nickname, token, platform, proxy, country } = botForm;
    const selectedCountry = countries.find(c => c.code === country)?.name || 'Россия';
    
    addBot(nickname, token, platform, proxy || undefined, selectedCountry);
    
    setBotForm({
      nickname: '',
      token: '',
      platform: 'twitch',
      proxy: '',
      country: 'RU'
    });
    setIsAddBotModalOpen(false);
  };

  const handleServiceSelect = (service: PlatformService, platform: Platform) => {
    setSelectedService({ service, platform });
    setIsPaymentModalOpen(true);
  };

  const handlePayment = (method: PaymentMethod) => {
    addNotification({
      type: 'success',
      title: 'Оплата успешна!',
      message: `Заказ "${selectedService?.service.name}" оплачен через ${method.name}`
    });
    setIsPaymentModalOpen(false);
    setSelectedService(null);
  };

  const getCountryFlag = (countryName?: string) => {
    const country = countries.find(c => c.name === countryName);
    return country?.flag || '🌍';
  };

  const getPlatformIcon = (platform: Platform) => {
    const icons = {
      twitch: '🟣',
      kick: '🟢', 
      youtube: '🔴',
      trovo: '🔵',
      vkplay: '🟦',
      dlive: '🟨',
      telegram: '💙',
      bigo: '🟪',
      bizon365: '🟫',
      yappy: '🟡',
      tiktok: '⚫',
      rumble: '🔶',
      zoom: '🔷'
    };
    return icons[platform] || '⚪';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="relative container mx-auto px-4 py-16">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-6xl">🤖</div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                wwbots
              </h1>
              <Badge variant="secondary" className="ml-2">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Профессиональный сервис накрутки активности для всех популярных платформ.
              Боты, зрители, подписчики и многое другое.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Badge variant="outline" className="px-4 py-2">
                <Globe className="w-4 h-4 mr-2" />
                13+ платформ
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <ShoppingCart className="w-4 h-4 mr-2" />
                30+ услуг
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <CreditCard className="w-4 h-4 mr-2" />
                Безопасная оплата
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Услуги</TabsTrigger>
            <TabsTrigger value="bots">Мои боты</TabsTrigger>
            <TabsTrigger value="account">Аккаунт</TabsTrigger>
          </TabsList>

          {/* Услуги */}
          <TabsContent value="services">
            <div className="space-y-8">
              <PlatformSelector
                onPlatformSelect={() => {}}
                onServiceSelect={handleServiceSelect}
              />
            </div>
          </TabsContent>

          {/* Боты */}
          <TabsContent value="bots">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Управление ботами</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsProxyModalOpen(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Прокси
                  </Button>
                  <Button onClick={() => setIsAddBotModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить бота
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {bots.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Пока нет ботов
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Добавьте первого бота для начала работы
                    </p>
                    <Button onClick={() => setIsAddBotModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить бота
                    </Button>
                  </Card>
                ) : (
                  bots.map((bot) => (
                    <Card key={bot.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getPlatformIcon(bot.platform)}</div>
                          <StatusIndicator 
                            online={bot.status === 'online'} 
                            className="w-3 h-3" 
                          />
                          <div>
                            <div className="font-semibold text-foreground">
                              {bot.nickname}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="capitalize">{bot.platform}</span>
                              {bot.country && (
                                <>
                                  <span>•</span>
                                  <span>{getCountryFlag(bot.country)} {bot.country}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={bot.connected ? 'default' : 'secondary'}>
                            {bot.connected ? 'Онлайн' : 'Оффлайн'}
                          </Badge>
                          
                          <Button
                            size="sm"
                            variant={bot.connected ? 'destructive' : 'default'}
                            onClick={() => bot.connected ? disconnectBot(bot.id) : connectBot(bot.id)}
                          >
                            {bot.connected ? 'Отключить' : 'Подключить'}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeBot(bot.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Аккаунт */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Информация об аккаунте
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Статус:</span>
                    <Badge variant="default">Pro аккаунт</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Баланс:</span>
                    <span className="font-semibold">2,500 ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Активных ботов:</span>
                    <span className="font-semibold">{bots.filter(b => b.connected).length}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Пополнить баланс
                </h3>
                <p className="text-muted-foreground mb-4">
                  Пополните баланс для заказа услуг
                </p>
                <Button className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Пополнить баланс
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Модальные окна */}
      
      {/* Добавление бота */}
      {isAddBotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Добавить бота</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsAddBotModalOpen(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Платформа
                  </label>
                  <Select 
                    value={botForm.platform} 
                    onValueChange={(value: Platform) => setBotForm({...botForm, platform: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitch">🟣 Twitch</SelectItem>
                      <SelectItem value="kick">🟢 Kick</SelectItem>
                      <SelectItem value="youtube">🔴 YouTube</SelectItem>
                      <SelectItem value="trovo">🔵 Trovo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Никнейм
                  </label>
                  <Input
                    placeholder="Введите никнейм"
                    value={botForm.nickname}
                    onChange={(e) => setBotForm({...botForm, nickname: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Токен
                  </label>
                  <Input
                    type="password"
                    placeholder="Введите токен"
                    value={botForm.token}
                    onChange={(e) => setBotForm({...botForm, token: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Прокси (опционально)
                  </label>
                  <Input
                    placeholder="ip:port:user:pass или ip:port"
                    value={botForm.proxy}
                    onChange={(e) => setBotForm({...botForm, proxy: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Страна
                  </label>
                  <Select 
                    value={botForm.country} 
                    onValueChange={(value) => setBotForm({...botForm, country: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddBotModalOpen(false)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleAddBot} className="flex-1">
                    Добавить
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Прокси рекомендации */}
      {isProxyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Рекомендации прокси</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsProxyModalOpen(false)}
                >
                  ×
                </Button>
              </div>
              
              <ProxyRecommendations />
              
              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsProxyModalOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Оплата */}
      {isPaymentModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Оплата услуги</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedService(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <PaymentSystem
                amount={selectedService.service.price}
                currency={selectedService.service.currency}
                serviceName={selectedService.service.name}
                onPayment={handlePayment}
              />
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Index;