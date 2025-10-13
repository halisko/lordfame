import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate, Link } from "react-router-dom";
import {
  Plus,
  Settings,
  Globe,
  Crown,
  LogOut,
  Timer,
  MessageSquare,
  Shield,
  Bell
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { GlassCard } from "@/components/GlassCard";
import { StatusIndicator } from "@/components/StatusIndicator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ModeratorPanel } from "@/components/ModeratorPanel";
import { DeviceSwitch } from "@/components/DeviceSwitch";
import { TwitchBotCommands } from "@/components/twitch/TwitchBotCommands";
import { TwitchModeration } from "@/components/twitch/TwitchModeration";
import { TwitchAlerts } from "@/components/twitch/TwitchAlerts";
import { useNotifications } from "@/components/NotificationSystem";
import { useTwitchBot } from "@/hooks/useTwitchBot";
import { useAuth } from "@/hooks/useAuth";
import { Bot as BotType, Platform } from "@/types";

// Import platform icons
import lordLogo from '@/assets/lord-logo.png';
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
  const { user, profile, loading, signOut, isAuthenticated, isModerator, getRoleDisplayName } = useAuth();
  
  // Modal states
  const [isAddBotModalOpen, setIsAddBotModalOpen] = useState(false);
  
  // Form states
  const [botForm, setBotForm] = useState({
    nickname: '',
    token: '',
    platform: 'twitch' as Platform,
    proxy: '',
    country: 'RU'
  });

  // Redirect to auth if not authenticated
  if (!loading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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

  const getCountryFlag = (countryName?: string) => {
    const country = countries.find(c => c.name === countryName);
    return country?.flag || '🌍';
  };

  const getPlatformIcon = (platform: Platform) => {
    const icons = {
      twitch: twitchIcon,
      kick: kickIcon, 
      youtube: youtubeIcon,
      trovo: trovoIcon,
      vkplay: vkplayIcon,
      dlive: dliveIcon,
      telegram: telegramIcon,
      bigo: bigoIcon,
      bizon365: bizon365Icon,
      yappy: yappyIcon,
      tiktok: tiktokIcon,
      rumble: rumbleIcon,
      zoom: zoomIcon
    };
    return icons[platform] || twitchIcon;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with user info */}
      <header className="border-b border-white/10 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={lordLogo} alt="LordFame" className="h-10 w-auto" />
              {profile && profile.role !== 'user' && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                  <Crown className="w-3 h-3 mr-1" />
                  {getRoleDisplayName(profile.role as any)}
                </Badge>
              )}
              <DeviceSwitch />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Пользователь:</span>
                <span className="text-white font-medium">{profile?.username}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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
              <img src={lordLogo} alt="LordFame" className="h-20 w-auto" />
              <Badge variant="secondary" className="ml-2">
                <Crown className="w-3 h-3 mr-1" />
                {getRoleDisplayName(profile?.role as any)}
              </Badge>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Закрытый сервис управления ботами для стриминговых платформ
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bots" className="w-full">
          <TabsList className={`grid w-full ${isModerator ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="bots">Боты</TabsTrigger>
            <TabsTrigger value="commands">
              <MessageSquare className="w-4 h-4 mr-1" />
              Команды
            </TabsTrigger>
            <TabsTrigger value="moderation">
              <Shield className="w-4 h-4 mr-1" />
              Модерация
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="w-4 h-4 mr-1" />
              Алерты
            </TabsTrigger>
            {isModerator && <TabsTrigger value="admin">Админ</TabsTrigger>}
          </TabsList>

          {/* Боты */}
          <TabsContent value="bots">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Управление ботами
                  </h3>
                  <Button onClick={() => setIsAddBotModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить бота
                  </Button>
                </div>

                <div className="grid gap-4">
                  {bots.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-lg">
                      <div className="text-6xl mb-4">🤖</div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">
                        Пока нет ботов
                      </h4>
                      <p className="text-muted-foreground mb-4">
                        Добавьте первого бота для начала работы
                      </p>
                      <Button onClick={() => setIsAddBotModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить бота
                      </Button>
                    </div>
                  ) : (
                    bots.map((bot) => (
                      <Card key={bot.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={getPlatformIcon(bot.platform)} 
                              alt={bot.platform} 
                              className="w-6 h-6 object-contain"
                            />
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
              </Card>
            </div>
          </TabsContent>

          {/* Команды бота */}
          <TabsContent value="commands">
            <TwitchBotCommands />
          </TabsContent>

          {/* Модерация */}
          <TabsContent value="moderation">
            <TwitchModeration />
          </TabsContent>

          {/* Алерты */}
          <TabsContent value="alerts">
            <TwitchAlerts />
          </TabsContent>


          {/* Admin Panel */}
          {isModerator && (
          <TabsContent value="admin">
            <ModeratorPanel />
          </TabsContent>
          )}
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
                      <SelectItem value="twitch">
                        <div className="flex items-center gap-2">
                          <img src={twitchIcon} alt="Twitch" className="w-4 h-4" />
                          Twitch
                        </div>
                      </SelectItem>
                      <SelectItem value="kick">
                        <div className="flex items-center gap-2">
                          <img src={kickIcon} alt="Kick" className="w-4 h-4" />
                          Kick
                        </div>
                      </SelectItem>
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <img src={youtubeIcon} alt="YouTube" className="w-4 h-4" />
                          YouTube
                        </div>
                      </SelectItem>
                      <SelectItem value="trovo">
                        <div className="flex items-center gap-2">
                          <img src={trovoIcon} alt="Trovo" className="w-4 h-4" />
                          Trovo
                        </div>
                      </SelectItem>
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

    </div>
  );
};

export default Index;