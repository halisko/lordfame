import React, { useEffect, useRef } from 'react';

interface TwitchPlayerProps {
  channel: string;
  height?: string;
}

declare global {
  interface Window {
    Twitch: any;
  }
}

export const TwitchPlayer: React.FC<TwitchPlayerProps> = ({ channel, height = '100%' }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);

  useEffect(() => {
    // Load Twitch embed script
    const script = document.createElement('script');
    script.src = 'https://embed.twitch.tv/embed/v1.js';
    script.async = true;
    
    script.onload = () => {
      if (playerRef.current && window.Twitch && !embedRef.current) {
        embedRef.current = new window.Twitch.Embed(playerRef.current, {
          width: '100%',
          height: '100%',
          channel: channel,
          layout: 'video',
          autoplay: false,
          muted: false,
          parent: [window.location.hostname, 'localhost']
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      if (embedRef.current) {
        embedRef.current = null;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [channel]);

  return (
    <div 
      ref={playerRef} 
      style={{ width: '100%', height }} 
      className="rounded-lg overflow-hidden"
    />
  );
};
