import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RefreshCw, UserMinus, Heart, Search, Power, PowerOff } from 'lucide-react';
import { Bot } from '@/types';

interface ChatAccountsPanelProps {
  bots: Bot[];
  selectedBot: Bot | null;
  onSelectBot: (bot: Bot) => void;
  onConnectBot: (botId: string) => void;
  onDisconnectBot: (botId: string) => void;
  onRefreshBots: () => void;
}

type AccountMode = 'selected' | 'random' | 'order';

export const ChatAccountsPanel: React.FC<ChatAccountsPanelProps> = ({
  bots,
  selectedBot,
  onSelectBot,
  onConnectBot,
  onDisconnectBot,
  onRefreshBots
}) => {
  const [accountMode, setAccountMode] = useState<AccountMode>('selected');
  const [searchQuery, setSearchQuery] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const filteredBots = bots.filter(bot => 
    bot.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-white/5 border-white/10 p-4">
      <h4 className="font-semibold mb-4">Аккаунты для сообщений в чате</h4>
      
      {/* Mode Selection Buttons */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant={accountMode === 'selected' ? 'default' : 'outline'} 
          size="sm" 
          className={accountMode === 'selected' ? 'flex-1 bg-purple-600 hover:bg-purple-700' : 'flex-1 border-white/20 text-gray-300 hover:text-white'}
          onClick={() => setAccountMode('selected')}
        >
          Выбранный
        </Button>
        <Button 
          variant={accountMode === 'random' ? 'default' : 'outline'} 
          size="sm" 
          className={accountMode === 'random' ? 'flex-1 bg-purple-600 hover:bg-purple-700' : 'flex-1 border-white/20 text-gray-300 hover:text-white'}
          onClick={() => setAccountMode('random')}
        >
          Случайный
        </Button>
        <Button 
          variant={accountMode === 'order' ? 'default' : 'outline'} 
          size="sm" 
          className={accountMode === 'order' ? 'flex-1 bg-purple-600 hover:bg-purple-700' : 'flex-1 border-white/20 text-gray-300 hover:text-white'}
          onClick={() => setAccountMode('order')}
        >
          По порядку
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Input
          placeholder="Поиск аккаунта"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/5 border-white/10 pr-10"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Account List */}
      <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
        {filteredBots.length > 0 ? (
          filteredBots.map((bot) => (
            <div
              key={bot.id}
              className={`bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors ${
                selectedBot?.id === bot.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => onSelectBot(bot)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{bot.nickname}</span>
                  {selectedBot?.id === bot.id && (
                    <span className="text-green-500">✓</span>
                  )}
                  {bot.connected && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <Button
                  size="sm"
                  variant={bot.connected ? 'destructive' : 'default'}
                  className={bot.connected ? 'h-7 px-2' : 'h-7 px-2 bg-green-600 hover:bg-green-700'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (bot.connected) {
                      onDisconnectBot(bot.id);
                    } else {
                      onConnectBot(bot.id);
                    }
                  }}
                >
                  {bot.connected ? (
                    <PowerOff className="h-3 w-3" />
                  ) : (
                    <Power className="h-3 w-3" />
                  )}
                </Button>
              </div>
              {bot.country && (
                <div className="text-xs text-gray-400 mt-1">{bot.country}</div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            <p className="text-sm">
              {searchQuery ? 'Аккаунты не найдены' : 'Нет доступных аккаунтов'}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full border-white/20 justify-start text-gray-300 hover:text-white hover:bg-white/10"
          onClick={onRefreshBots}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить ботов
        </Button>
        
        {selectedBot && (
          <>
            <Button 
              variant="outline" 
              className="w-full border-white/20 justify-start text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => selectedBot.connected ? onDisconnectBot(selectedBot.id) : onConnectBot(selectedBot.id)}
            >
              {selectedBot.connected ? (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Отключить аккаунт
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Подключить аккаунт
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className={`w-full border-white/20 justify-start ${subscribed ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'} hover:bg-white/10`}
              onClick={() => setSubscribed(!subscribed)}
            >
              <Heart className={`h-4 w-4 mr-2 ${subscribed ? 'fill-current' : ''}`} />
              {subscribed ? 'Отписаться' : 'Подписаться'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
