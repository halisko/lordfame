import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./GlassCard";
import twitchHeroBg from "@/assets/twitch-hero-bg.jpg";
import gamingSetup from "@/assets/gaming-setup.jpg";

interface TwitchEmbedProps {
  streamUrl?: string;
  title?: string;
  streamerName?: string;
  viewerCount?: number;
  isLive?: boolean;
}

export const TwitchEmbed: React.FC<TwitchEmbedProps> = ({
  streamUrl,
  title = "Выберите стрим",
  streamerName = "streamer",
  viewerCount = 0,
  isLive = false
}) => {
  const embedRef = useRef<HTMLDivElement>(null);

  const openInTwitch = () => {
    if (streamUrl) {
      window.open(streamUrl, '_blank');
    }
  };

  if (!streamUrl) {
    return (
      <div 
        className="aspect-video rounded-lg overflow-hidden relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${twitchHeroBg})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Подключитесь к стриму</h3>
              <p className="text-gray-300">
                Выберите Twitch стрим для начала работы с ботами
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stream Preview */}
      <div 
        className="aspect-video rounded-lg overflow-hidden relative bg-cover bg-center bg-no-repeat cursor-pointer group"
        style={{ backgroundImage: `url(${gamingSetup})` }}
        onClick={openInTwitch}
      >
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
        
        {/* Live Badge */}
        {isLive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-4 z-10"
          >
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              В ЭФИРЕ
            </div>
          </motion.div>
        )}

        {/* Viewer Count */}
        <div className="absolute top-4 right-4 z-10">
          <GlassCard className="px-3 py-1">
            <div className="text-white text-sm font-medium">
              {viewerCount.toLocaleString()} зрителей
            </div>
          </GlassCard>
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow"
          >
            <Play className="w-10 h-10 text-white ml-1" />
          </motion.div>
        </div>

        {/* Stream Info */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <div className="flex items-center justify-between">
              <p className="text-gray-300">twitch.tv/{streamerName}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openInTwitch();
                }}
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ExternalLink size={14} />
                Открыть в Twitch
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Controls */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Качество: Авто</span>
          <span>Задержка: ~2с</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Чат синхронизирован</span>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};