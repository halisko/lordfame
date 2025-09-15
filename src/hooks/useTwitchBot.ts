import { useState, useCallback, useEffect } from "react";
import { Bot, ChatMessage, StreamInfo, Prediction, Poll, ChannelPointsReward } from "@/types";
import { useNotifications } from "@/components/NotificationSystem";

// Mock data and functions for demonstration
const mockStreamInfo: StreamInfo = {
  id: "stream1",
  url: "https://www.twitch.tv/example_streamer",
  title: "Epic Gaming Session - Come Chat!",
  streamerName: "example_streamer", 
  viewerCount: 1547,
  isLive: true,
  startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
};

const mockPredictions: Prediction[] = [
  {
    id: "pred1",
    title: "Will we beat this boss?",
    outcomes: [
      {
        id: "yes",
        title: "Yes, easy!",
        color: "blue",
        totalPoints: 12450,
        topPredictors: [
          { username: "user1", points: 5000 },
          { username: "user2", points: 3000 }
        ]
      },
      {
        id: "no", 
        title: "No way!",
        color: "pink",
        totalPoints: 8230,
        topPredictors: [
          { username: "user3", points: 4000 },
          { username: "user4", points: 2500 }
        ]
      }
    ],
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    predictionWindow: 300
  }
];

const mockRewards: ChannelPointsReward[] = [
  {
    id: "reward1",
    title: "Highlight My Message",
    cost: 100,
    prompt: "Make your message stand out!",
    enabled: true,
    backgroundColor: "#9146ff",
    redemptionsThisStream: 23
  },
  {
    id: "reward2", 
    title: "Emote Only Mode (30s)",
    cost: 500,
    prompt: "Chat goes into emote-only mode",
    enabled: true,
    backgroundColor: "#f1c40f",
    redemptionsThisStream: 5,
    cooldown: 300
  },
  {
    id: "reward3",
    title: "Random Sound Effect", 
    cost: 250,
    prompt: "Play a random sound effect",
    enabled: true,
    backgroundColor: "#e74c3c",
    redemptionsThisStream: 15
  },
  {
    id: "reward4",
    title: "Song Request",
    cost: 1000,
    prompt: "Request a song to be played",
    enabled: true,
    backgroundColor: "#3498db",
    redemptionsThisStream: 8,
    maxRedemptions: 3
  }
];

export const useTwitchBot = () => {
  const { addNotification } = useNotifications();
  
  // State management
  const [bots, setBots] = useState<Bot[]>([]);
  const [currentStream, setCurrentStream] = useState<StreamInfo | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>(mockPredictions);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [channelPoints, setChannelPoints] = useState(15750);
  const [rewards, setRewards] = useState<ChannelPointsReward[]>(mockRewards);
  const [isConnecting, setIsConnecting] = useState(false);

  // Bot management
  const addBot = useCallback((nickname: string, token: string, proxy?: string, country?: string) => {
    if (!nickname.trim() || !token.trim()) {
      addNotification({
        type: "error",
        title: "Ошибка",
        message: "Заполните все поля"
      });
      return;
    }

    if (bots.some(bot => bot.nickname === nickname)) {
      addNotification({
        type: "error",
        title: "Ошибка",
        message: "Бот с таким именем уже существует"
      });
      return;
    }

    const newBot: Bot = {
      id: Math.random().toString(36).substring(2, 15),
      nickname: nickname.trim(),
      token: token.trim(),
      proxy: proxy?.trim() || undefined,
      country: country || undefined,
      connected: false,
      status: 'offline'
    };

    setBots(prev => [...prev, newBot]);
    
    addNotification({
      type: "success",
      title: "Успех!",
      message: `Бот ${nickname} добавлен${proxy ? ' с прокси' : ''}`
    });
  }, [bots, addNotification]);

  const removeBot = useCallback((botId: string) => {
    setBots(prev => prev.filter(bot => bot.id !== botId));
    addNotification({
      type: "info",
      title: "Бот удален",
      message: "Бот успешно удален из списка"
    });
  }, [addNotification]);

  const connectBot = useCallback(async (botId: string) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { ...bot, status: 'connecting' }
        : bot
    ));

    // Simulate connection delay
    setTimeout(() => {
      setBots(prev => prev.map(bot => 
        bot.id === botId 
          ? { ...bot, connected: true, status: 'online', lastSeen: new Date() }
          : bot
      ));

      const bot = bots.find(b => b.id === botId);
      if (bot) {
        addNotification({
          type: "success",
          title: "Подключение установлено",
          message: `Бот ${bot.nickname} подключен к чату`
        });
      }
    }, 1000 + Math.random() * 2000);
  }, [bots, addNotification]);

  const disconnectBot = useCallback((botId: string) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { ...bot, connected: false, status: 'offline' }
        : bot
    ));

    const bot = bots.find(b => b.id === botId);
    if (bot) {
      addNotification({
        type: "info", 
        title: "Отключено",
        message: `Бот ${bot.nickname} отключен от чата`
      });
    }
  }, [bots, addNotification]);

  const connectAllBots = useCallback(() => {
    const offlineBots = bots.filter(bot => !bot.connected);
    offlineBots.forEach(bot => connectBot(bot.id));
  }, [bots, connectBot]);

  const disconnectAllBots = useCallback(() => {
    const onlineBots = bots.filter(bot => bot.connected);
    onlineBots.forEach(bot => disconnectBot(bot.id));
  }, [bots, disconnectBot]);

  // Stream management
  const connectToStream = useCallback((streamUrl: string) => {
    if (!streamUrl.trim()) {
      addNotification({
        type: "error",
        title: "Ошибка", 
        message: "Введите URL стрима"
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate connection
    setTimeout(() => {
      setCurrentStream({ ...mockStreamInfo, url: streamUrl });
      setIsConnecting(false);
      
      addNotification({
        type: "success",
        title: "Подключено к стриму",
        message: `Успешное подключение к ${streamUrl}`
      });
    }, 2000);
  }, [addNotification]);

  // Chat functionality
  const sendMessage = useCallback((botId: string, message: string) => {
    const bot = bots.find(b => b.id === botId && b.connected);
    if (!bot) {
      addNotification({
        type: "error",
        title: "Ошибка",
        message: "Выберите подключенного бота"
      });
      return;
    }

    if (!message.trim()) {
      return;
    }

    const chatMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 15),
      botId,
      botNickname: bot.nickname,
      text: message.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, chatMessage]);
    
    // Simulate response delay 
    setTimeout(() => {
      addNotification({
        type: "success",
        title: "Сообщение отправлено",
        message: `От ${bot.nickname}: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`
      });
    }, 500);
  }, [bots, addNotification]);

  // Mock periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update viewer count
      if (currentStream) {
        setCurrentStream(prev => prev ? {
          ...prev,
          viewerCount: prev.viewerCount + Math.floor(Math.random() * 10 - 5)
        } : null);
      }

      // Update channel points occasionally
      if (Math.random() < 0.3) {
        setChannelPoints(prev => prev + Math.floor(Math.random() * 50));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentStream]);

  return {
    // State
    bots,
    currentStream,
    chatMessages,
    predictions,
    polls,
    channelPoints,
    rewards,
    isConnecting,

    // Actions
    addBot,
    removeBot,
    connectBot,
    disconnectBot,
    connectAllBots,
    disconnectAllBots,
    connectToStream,
    sendMessage
  };
};