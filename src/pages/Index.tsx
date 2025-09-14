import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  LogIn,
  LogOut,
  Send,
  Smile,
  Link as LinkIcon,
  X,
  Radio,
  MessagesSquare,
  Bot,
  Store,
  Coins,
  Vote,
  Activity,
  Users,
  Clock,
  TrendingUp,
  Settings,
  Trash2,
  Copy,
  ExternalLink,
  Zap,
  Heart,
  Star
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { GlassCard } from "@/components/GlassCard";
import { StatusIndicator } from "@/components/StatusIndicator";
import { EmojiPicker } from "@/components/EmojiPicker";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TwitchEmbed } from "@/components/TwitchEmbed";
import { useNotifications } from "@/components/NotificationSystem";
import { useTwitchBot } from "@/hooks/useTwitchBot";
import { Bot as BotType } from "@/types";

// Modal Component
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ open, onClose, title, children, maxWidth = "max-w-md" }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`relative w-full ${maxWidth} mx-4`}
        >
          <GlassCard className="p-0">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>
            <div className="p-6">{children}</div>
          </GlassCard>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Section Header Component
const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  children?: React.ReactNode;
}> = ({ icon: Icon, title, children }) => (
  <div className="flex items-center justify-between p-4 border-b border-border">
    <div className="flex items-center gap-2 text-foreground">
      <Icon size={18} />
      <span className="font-medium">{title}</span>
    </div>
    {children}
  </div>
);

// Main App Component
const TwitchMultiBot: React.FC = () => {
  const {
    bots,
    currentStream,
    chatMessages,
    predictions,
    channelPoints,
    rewards,
    isConnecting,
    addBot,
    removeBot,
    connectBot,
    disconnectBot,
    connectAllBots,
    disconnectAllBots,
    connectToStream,
    sendMessage
  } = useTwitchBot();

  // UI State
  const [showAddBot, setShowAddBot] = useState(false);
  const [showConnectStream, setShowConnectStream] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Form State
  const [botForm, setBotForm] = useState({ nickname: "", token: "" });
  const [streamUrl, setStreamUrl] = useState("");
  const [selectedBotForChat, setSelectedBotForChat] = useState<string>("");
  const [chatInput, setChatInput] = useState("");

  // Connected bots
  const connectedBots = bots.filter(bot => bot.connected);
  const onlineBots = bots.filter(bot => bot.status === 'online');

  // Handlers
  const handleAddBot = () => {
    addBot(botForm.nickname, botForm.token);
    setBotForm({ nickname: "", token: "" });
    setShowAddBot(false);
  };

  const handleConnectToStream = () => {
    connectToStream(streamUrl);
    setShowConnectStream(false);
    setStreamUrl("");
  };

  const handleSendMessage = () => {
    if (selectedBotForChat && chatInput.trim()) {
      sendMessage(selectedBotForChat, chatInput);
      setChatInput("");
    }
  };

  const handleEmojiPick = (emoji: string) => {
    setChatInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl twitch-gradient flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Twitch MultiBot
                </h1>
                <p className="text-sm text-muted-foreground">
                  Управление мульти-аккаунтами
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowAddBot(true)}
                variant="glow"
                className="gap-2"
              >
                <Plus size={16} />
                Добавить бота
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowConnectStream(true)}
                className="gap-2"
              >
                <LinkIcon size={16} />
                {currentStream ? "Сменить стрим" : "Подключить к стриму"}
              </Button>

              {connectedBots.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={disconnectAllBots}
                  className="gap-2"
                >
                  <LogOut size={16} />
                  Отключить всех
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Stream Stats */}
            <GlassCard>
              <SectionHeader icon={Activity} title="Статистика стрима" />
              <div className="p-4 space-y-3">
                {currentStream ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Зрителей</span>
                      <AnimatedCounter 
                        value={currentStream.viewerCount} 
                        className="font-medium"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">В эфире</span>
                      <AnimatedCounter
                        value={currentStream.startedAt ? 
                          Math.floor((Date.now() - currentStream.startedAt.getTime()) / (1000 * 60)) 
                          : 0}
                        format={(v) => `${v} мин`}
                        className="font-medium"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Статус</span>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        <StatusIndicator online size="sm" className="mr-1" />
                        В сети
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Подключитесь к стриму для просмотра статистики
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Predictions */}
            <GlassCard>
              <SectionHeader icon={Vote} title="Прогнозы">
                <Button variant="ghost" size="sm">Обновить</Button>
              </SectionHeader>
              <div className="p-4">
                {predictions.length > 0 ? (
                  <div className="space-y-3">
                    {predictions.map(prediction => (
                      <div key={prediction.id} className="space-y-2">
                        <h4 className="text-sm font-medium">{prediction.title}</h4>
                        {prediction.outcomes.map(outcome => (
                          <div key={outcome.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={`text-${outcome.color}-400`}>
                                {outcome.title}
                              </span>
                              <span>{outcome.totalPoints.toLocaleString()} баллов</span>
                            </div>
                            <Progress 
                              value={outcome.totalPoints / 200} 
                              className="h-2"
                            />
                          </div>
                        ))}
                        <Badge variant="secondary" className="text-xs">
                          {prediction.status === 'ACTIVE' ? 'Активен' : 'Завершен'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Сейчас нет активных прогнозов
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Channel Points */}
            <GlassCard>
              <SectionHeader icon={Coins} title="Баллы канала" />
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <AnimatedCounter
                    value={channelPoints}
                    className="text-2xl font-bold text-primary"
                  />
                  <div className="text-sm text-muted-foreground">Доступно баллов</div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store size={16} />
                    Магазин за баллы
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {rewards.slice(0, 4).map(reward => (
                      <Button
                        key={reward.id}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-auto p-2"
                      >
                        <div className="text-left">
                          <div className="font-medium">{reward.title}</div>
                          <div className="text-muted-foreground">{reward.cost} баллов</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Center Area */}
          <div className="col-span-6 space-y-6">
            {/* Stream Player */}
            <GlassCard>
              <SectionHeader 
                icon={Radio} 
                title={currentStream ? currentStream.title : "Стрим не выбран"}
              >
                {currentStream && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users size={16} />
                    <AnimatedCounter value={currentStream.viewerCount} />
                    <Clock size={16} className="ml-2" />
                    <AnimatedCounter 
                      value={Math.floor((Date.now() - (currentStream.startedAt?.getTime() || Date.now())) / (1000 * 60))}
                      format={(v) => `${v} мин`}
                    />
                  </div>
                )}
              </SectionHeader>
              
              <div className="p-4">
                <TwitchEmbed
                  streamUrl={currentStream?.url}
                  title={currentStream?.title}
                  streamerName={currentStream?.streamerName}
                  viewerCount={currentStream?.viewerCount}
                  isLive={currentStream?.isLive}
                />
              </div>
            </GlassCard>

            {/* Chat Interface */}
            <GlassCard>
              <SectionHeader icon={MessagesSquare} title="Чат">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Аккаунт:</span>
                  <select
                    value={selectedBotForChat}
                    onChange={(e) => setSelectedBotForChat(e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-3 py-1 text-sm"
                  >
                    <option value="">Выберите бота</option>
                    {connectedBots.map(bot => (
                      <option key={bot.id} value={bot.id}>
                        {bot.nickname}
                      </option>
                    ))}
                  </select>
                </div>
              </SectionHeader>

              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {chatMessages.length > 0 ? (
                  chatMessages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <StatusIndicator online size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-primary">
                            {message.botNickname}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed mt-1">
                          {message.text}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Сообщений пока нет
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2 relative">
                  <div className="flex-1 relative">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={
                        selectedBotForChat 
                          ? `Написать от имени ${connectedBots.find(b => b.id === selectedBotForChat)?.nickname}...`
                          : "Выберите аккаунт для отправки"
                      }
                      disabled={!selectedBotForChat}
                      className="pr-12"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <Smile size={16} />
                    </Button>
                    
                    <EmojiPicker
                      open={showEmojiPicker}
                      onPick={handleEmojiPick}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!selectedBotForChat || !chatInput.trim()}
                    className="gap-2"
                  >
                    <Send size={16} />
                    Отправить
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Sidebar - Bot Management */}
          <div className="col-span-3">
            <GlassCard>
              <SectionHeader 
                icon={Bot} 
                title="Управление ботами"
              >
                <Badge variant="secondary">
                  {bots.length} ботов
                </Badge>
              </SectionHeader>

              <div className="p-4 space-y-4">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddBot(true)}
                    className="gap-1"
                  >
                    <Plus size={14} />
                    Добавить
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={connectAllBots}
                    disabled={bots.length === 0}
                    className="gap-1"
                  >
                    <LogIn size={14} />
                    Подключить всех
                  </Button>
                </div>

                <Separator />

                {/* Bot List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bots.length > 0 ? (
                    bots.map(bot => (
                      <motion.div
                        key={bot.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-secondary/50 rounded-lg border border-border hover-lift"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <StatusIndicator 
                              online={bot.status === 'online'} 
                              size="sm" 
                            />
                            <div>
                              <div className="font-medium text-sm">
                                {bot.nickname}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {bot.id.slice(-6)}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBot(bot.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {bot.connected ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => disconnectBot(bot.id)}
                              className="flex-1 gap-1 text-xs h-7"
                            >
                              <LogOut size={12} />
                              Отключить
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => connectBot(bot.id)}
                              disabled={bot.status === 'connecting'}
                              className="flex-1 gap-1 text-xs h-7"
                            >
                              {bot.status === 'connecting' ? (
                                <>
                                  <LoadingSpinner size="sm" />
                                  Подключение...
                                </>
                              ) : (
                                <>
                                  <LogIn size={12} />
                                  Подключить
                                </>
                              )}
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(bot.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Copy size={12} />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">Нет добавленных ботов</div>
                      <Button 
                        size="sm" 
                        onClick={() => setShowAddBot(true)}
                        className="mt-2"
                      >
                        Добавить первого бота
                      </Button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                {bots.length > 0 && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-success">
                          <AnimatedCounter value={onlineBots.length} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Онлайн
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-muted-foreground">
                          <AnimatedCounter value={bots.length - onlineBots.length} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Офлайн
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Add Bot Modal */}
      <Modal
        open={showAddBot}
        onClose={() => {
          setShowAddBot(false);
          setBotForm({ nickname: "", token: "" });
        }}
        title="Добавить нового бота"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Никнейм бота
            </label>
            <Input
              value={botForm.nickname}
              onChange={(e) => setBotForm(prev => ({ ...prev, nickname: e.target.value }))}
              placeholder="Например: my_twitch_bot"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Cookie-токен Twitch
            </label>
            <Textarea
              value={botForm.token}
              onChange={(e) => setBotForm(prev => ({ ...prev, token: e.target.value }))}
              placeholder="Вставьте auth-token из куки Twitch..."
              className="h-24 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Найдите auth-token в куки браузера на сайте Twitch
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddBot(false);
                setBotForm({ nickname: "", token: "" });
              }}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleAddBot}
              disabled={!botForm.nickname.trim() || !botForm.token.trim()}
            >
              Добавить бота
            </Button>
          </div>
        </div>
      </Modal>

      {/* Connect to Stream Modal */}
      <Modal
        open={showConnectStream}
        onClose={() => {
          setShowConnectStream(false);
          setStreamUrl("");
        }}
        title="Подключиться к стриму"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              URL стрима Twitch
            </label>
            <Input
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="https://www.twitch.tv/username"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                setShowConnectStream(false);
                setStreamUrl("");
              }}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleConnectToStream}
              disabled={!streamUrl.trim() || isConnecting}
              variant="twitch"
            >
              {isConnecting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Подключение...
                </>
              ) : (
                "Подключиться"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TwitchMultiBot;