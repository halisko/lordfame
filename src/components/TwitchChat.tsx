import React, { useEffect, useRef } from 'react';

interface TwitchChatProps {
  channel: string;
  height?: string;
}

declare global {
  interface Window {
    Twitch: any;
  }
}

export const TwitchChat: React.FC<TwitchChatProps> = ({ channel, height = '100%' }) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);

  useEffect(() => {
    // Load Twitch embed script
    const script = document.createElement('script');
    script.src = 'https://embed.twitch.tv/embed/v1.js';
    script.async = true;
    
    script.onload = () => {
      if (chatRef.current && window.Twitch && !embedRef.current) {
        embedRef.current = new window.Twitch.Embed(chatRef.current, {
          width: '100%',
          height: '100%',
          channel: channel,
          layout: 'chat',
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
      ref={chatRef} 
      style={{ width: '100%', height }} 
      className="rounded-lg overflow-hidden"
    />
  );
};
