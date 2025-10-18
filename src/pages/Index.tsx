import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Plus,
  LogOut,
  Send,
  Play,
  RefreshCw,
  UserMinus,
  Heart,
  ChevronDown,
  Settings,
  Trash2,
  Radio
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ModeratorPanel } from "@/components/ModeratorPanel";
import { TwitchPlayer } from "@/components/TwitchPlayer";
import { TwitchChat } from "@/components/TwitchChat";
import { ChatAccountsPanel } from "@/components/ChatAccountsPanel";
import { AddBotDialog } from "@/components/AddBotDialog";
import { useAuth } from "@/hooks/useAuth";
import { useStreamers } from "@/hooks/useStreamers";
import { useBotCategories } from "@/hooks/useBotCategories";
import { useTwitchBot } from "@/hooks/useTwitchBot";

import lordLogo from '@/assets/lord-logo.png';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

const Index: React.FC = () => {
  const { profile, loading, signOut, isAuthenticated, isModerator } = useAuth();
  const { streamers, loading: streamersLoading, addStreamer, removeStreamer, refreshStreamers } = useStreamers();
  const { categories, categoryBots, selectedCategory, setSelectedCategory, refreshCategories, deleteBot } = useBotCategories();
  const { bots, connectBot, disconnectBot } = useTwitchBot();
  
  const [streamerUrl, setStreamerUrl] = useState('');
  const [streamerName, setStreamerName] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', username: 'haitako57', message: 'спасибо', timestamp: '19:35' },
    { id: '2', username: 'haitako57', message: 'не смотри канал у 18 аудиторию', timestamp: '19:36' },
    { id: '3', username: 'hannes19', message: 'та на 35 малолето', timestamp: '19:37' },
    { id: '4', username: 'haitako57', message: 'ним удаяяя таба я пойду', timestamp: '19:38' },
    { id: '5', username: 'hannes19', message: 'та на доті намідрі', timestamp: '19:39' },
    { id: '6', username: 'hannes19', message: 'поздравлю уже', timestamp: '19:40' },
    { id: '7', username: 'rafa998045', message: 'ппц', timestamp: '19:41' },
    { id: '8', username: 'rafa998045', message: 'та ще сонце нерос', timestamp: '19:42' },
  ]);
  
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [botMessage, setBotMessage] = useState('');
  const [messageInterval, setMessageInterval] = useState(5);
  const [messageMode, setMessageMode] = useState<'random' | 'order'>('random');
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedStreamer, setSelectedStreamer] = useState<string | null>(null);

  const activeStreamer = streamers.find(s => s.id === selectedStreamer);

  if (!loading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedBot) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        username: selectedBot.nickname,
        message: messageInput,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessageInput('');
    }
  };

  const handleAddStreamer = async () => {
    if (streamerUrl && streamerName) {
      await addStreamer(streamerUrl, streamerName);
      setStreamerUrl('');
      setStreamerName('');
    }
  };

  const connectToStream = (streamerId: string) => {
    setSelectedStreamer(streamerId);
    setActiveTab('chat');
  };

  const getTwitchChannel = (streamUrl: string): string => {
    return streamUrl.split('/').pop() || '';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <img src={lordLogo} alt="LordFame" className="h-8 w-auto" />
              <div className="flex gap-0">
                <button
                  onClick={() => setActiveTab('main')}
                  className={`px-4 py-2 transition-colors ${
                    activeTab === 'main'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Главная
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 transition-colors ${
                    activeTab === 'chat'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Чат
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`px-4 py-2 transition-colors ${
                    activeTab === 'templates'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Шаблоны
                </button>
                {isModerator && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-4 py-2 transition-colors ${
                      activeTab === 'admin'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Админ
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Пользователь:</span>
              <span className="text-white font-medium">{profile?.username}</span>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        {activeTab === 'chat' && (
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
              {/* Left Sidebar - Twitch Chat */}
              <div className="col-span-3 h-full">
                {activeStreamer && activeStreamer.stream_url.includes('twitch.tv') ? (
                  <TwitchChat 
                    channel={getTwitchChannel(activeStreamer.stream_url)} 
                    height="100%"
                  />
                ) : (
                  <Card className="h-full bg-white/5 border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="font-semibold">Чат трансляции</h3>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <p>Выберите стример из списка</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Center - Video Stream */}
              <div className="col-span-6 flex flex-col gap-4">
                {activeStreamer && activeStreamer.stream_url.includes('twitch.tv') ? (
                  <Card className="bg-black border-white/10 aspect-video overflow-hidden">
                    <TwitchPlayer 
                      channel={getTwitchChannel(activeStreamer.stream_url)} 
                      height="100%"
                    />
                  </Card>
                ) : (
                  <Card className="bg-black border-white/10 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Выберите стример для просмотра</p>
                    </div>
                  </Card>
                )}

                {/* Message Input Section */}
                <Card className="bg-white/5 border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      placeholder="данный я ток пойду наверн"
                      value={botMessage}
                      onChange={(e) => setBotMessage(e.target.value)}
                      className="bg-white/5 border-white/10 flex-1"
                    />
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <span>{botMessage.length}</span>
                      <span>/</span>
                      <span>1000</span>
                    </div>
                    <Button size="icon" className="bg-primary">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Bot Messages Section */}
                  <Card className="bg-white/5 border-white/10">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h4 className="font-semibold">Бот сообщений</h4>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div className="flex gap-2">
                        <Button
                          variant={messageMode === 'random' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMessageMode('random')}
                          className="flex-1"
                        >
                          Случайный
                        </Button>
                        <Button
                          variant={messageMode === 'order' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMessageMode('order')}
                          className="flex-1"
                        >
                          По порядку
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">
                          Интервал сообщений в секундах
                        </label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[messageInterval]}
                            onValueChange={(value) => setMessageInterval(value[0])}
                            min={1}
                            max={60}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={messageInterval}
                            onChange={(e) => setMessageInterval(parseInt(e.target.value) || 5)}
                            className="w-20 bg-white/5 border-white/10"
                          />
                        </div>
                      </div>

                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Запустить бота
                      </Button>
                    </div>
                  </Card>
                </Card>
              </div>

              {/* Right Sidebar - Account Management */}
              <div className="col-span-3 space-y-4">
                <ChatAccountsPanel
                  bots={bots}
                  selectedBot={selectedBot}
                  onSelectBot={setSelectedBot}
                  onConnectBot={connectBot}
                  onDisconnectBot={disconnectBot}
                  onRefreshBots={refreshStreamers}
                  categories={categories}
                  categoryBots={categoryBots}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />

                <Card className="bg-white/5 border-white/10 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-sm">Выбор аккаунта</h4>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <Button variant="default" size="sm" className="flex-1 bg-primary text-xs">
                      Случайный
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-white/20 text-xs">
                      По порядку
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="text-gray-400">Выбор сообщения</div>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" className="flex-1 bg-primary text-xs">
                        Случайный
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-white/20 text-xs">
                        По порядку
                      </Button>
                    </div>

                    <div className="text-gray-400 mt-3">Интервал сообщений в секундах</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 border-white/20">-</Button>
                      <Input 
                        type="number" 
                        value="5" 
                        className="bg-white/5 border-white/10 text-center h-8"
                      />
                      <Button variant="outline" size="icon" className="h-8 w-8 border-white/20">+</Button>
                    </div>

                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                      Запустить бота
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
        )}

        {activeTab === 'main' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="bg-white/5 border-white/10 p-6">
                <h3 className="text-xl font-semibold mb-4">Добавить стример</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Ссылка на аккаунт</label>
                    <Input
                      placeholder="https://twitch.tv/username"
                      value={streamerUrl}
                      onChange={(e) => setStreamerUrl(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Имя стримера</label>
                    <Input
                      placeholder="username"
                      value={streamerName}
                      onChange={(e) => setStreamerName(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button onClick={handleAddStreamer} className="w-full bg-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Список стримеров</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={refreshStreamers}
                    className="text-gray-400 hover:text-white"
                    disabled={streamersLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${streamersLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="space-y-3">
                  {streamers.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">Нет добавленных стримеров</p>
                  ) : (
                    streamers.map((streamer) => (
                      <div 
                        key={streamer.id} 
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{streamer.streamer_name}</span>
                            <div className="flex items-center gap-1">
                              {streamer.is_live ? (
                                <>
                                  <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                                  <span className="text-xs text-red-500">В эфире</span>
                                </>
                              ) : (
                                <span className="text-xs text-gray-500">Оффлайн</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">{streamer.stream_url}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => connectToStream(streamer.id)}
                            className="bg-primary"
                          >
                            Подключиться
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => removeStreamer(streamer.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
        )}

        {activeTab === 'templates' && (
            <div className="max-w-6xl mx-auto">
              <Card className="bg-white/5 border-white/10 p-6">
                <h3 className="text-xl font-semibold mb-4">Шаблоны ботов</h3>
                <Tabs value={selectedCategory || undefined} onValueChange={setSelectedCategory}>
                  <TabsList className="bg-white/5 border-white/10 w-full justify-start flex-wrap h-auto gap-2 p-2">
                    {categories.map((category) => (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id}
                        className="data-[state=active]:bg-primary"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {categories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium">{category.name}</h4>
                          <AddBotDialog 
                            categoryId={category.id} 
                            onBotAdded={refreshCategories}
                          />
                        </div>
                        
                        {categoryBots.length === 0 ? (
                          <Card className="bg-white/5 border-white/10 p-8 text-center">
                            <p className="text-gray-400">Нет ботов в этой категории</p>
                          </Card>
                        ) : (
                          <div className="grid gap-3">
                            {categoryBots.map((bot) => (
                              <Card key={bot.id} className="bg-white/5 border-white/10 p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="font-medium">{bot.nickname}</span>
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        bot.connected 
                                          ? 'bg-green-500/20 text-green-400' 
                                          : 'bg-gray-500/20 text-gray-400'
                                      }`}>
                                        {bot.status}
                                      </span>
                                      <span className="text-xs text-gray-500">{bot.platform}</span>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-400">
                                      {bot.country && (
                                        <span>Страна: {bot.country}</span>
                                      )}
                                      {bot.proxy && (
                                        <span>Прокси: {bot.proxy}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-xs text-gray-500">
                                      Cookie токен: {bot.token.substring(0, 20)}...
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => deleteBot(bot.id)}
                                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {!selectedCategory && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Выберите категорию для просмотра ботов</p>
                  </div>
                )}
              </Card>
            </div>
        )}

        {isModerator && activeTab === 'admin' && (
          <ModeratorPanel />
        )}
      </div>
    </div>
  );
};

export default Index;
