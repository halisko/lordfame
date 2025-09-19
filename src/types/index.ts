export type Platform = 'twitch' | 'kick' | 'youtube' | 'trovo' | 'vkplay' | 'dlive' | 'telegram' | 'bigo' | 'bizon365' | 'yappy' | 'tiktok' | 'rumble' | 'zoom';

export interface Bot {
  id: string;
  nickname: string;
  token: string;
  proxy?: string;
  country?: string;
  platform: Platform;
  connected: boolean;
  status: 'online' | 'offline' | 'connecting';
  lastSeen?: Date;
}

export interface PlatformService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'RUB' | 'USD';
  icon: string;
  popular?: boolean;
}

export interface PlatformInfo {
  id: Platform;
  name: string;
  icon: string;
  color: string;
  services: PlatformService[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ProxyInfo {
  host: string;
  port: number;
  username?: string;
  password?: string;
  country: string;
}

export interface ChatMessage {
  id: string;
  botId: string;
  botNickname: string;
  text: string;
  timestamp: Date;
  emojis?: string[];
}

export interface StreamInfo {
  id: string;
  url: string;
  title: string;
  streamerName: string;
  viewerCount: number;
  isLive: boolean;
  startedAt?: Date;
}

export interface Prediction {
  id: string;
  title: string;
  outcomes: {
    id: string;
    title: string;
    color: 'blue' | 'pink';
    totalPoints: number;
    topPredictors: Array<{
      username: string;
      points: number;
    }>;
  }[];
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELED' | 'LOCKED';
  createdAt: Date;
  endedAt?: Date;
  predictionWindow: number;
  winningOutcome?: string;
}

export interface Poll {
  id: string;
  title: string;
  choices: {
    id: string;
    title: string;
    votes: number;
  }[];
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  duration: number;
  totalVotes: number;
  createdAt: Date;
  endedAt?: Date;
}

export interface ChannelPointsReward {
  id: string;
  title: string;
  cost: number;
  prompt: string;
  enabled: boolean;
  backgroundColor: string;
  image?: string;
  redemptionsThisStream?: number;
  maxRedemptions?: number;
  cooldown?: number;
}

export interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}