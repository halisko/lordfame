import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Shield, Globe, Zap } from 'lucide-react';

interface ProxyService {
  name: string;
  description: string;
  features: string[];
  pricing: string;
  countries: number;
  quality: 'high' | 'medium' | 'premium';
  url: string;
}

const proxyServices: ProxyService[] = [
  {
    name: 'Bright Data',
    description: 'Лидер рынка residential прокси с 150+ млн IP адресов',
    features: ['Residential IP', '195 стран', '99.9% аптайм', 'Ротация сессий'],
    pricing: 'от $500/мес',
    countries: 195,
    quality: 'premium',
    url: 'https://brightdata.com'
  },
  {
    name: 'Oxylabs',
    description: 'Premium residential и datacenter прокси для бизнеса',
    features: ['100+ млн IP', 'Sticky sessions', 'API интеграция', '24/7 поддержка'],
    pricing: 'от $300/мес',
    countries: 100,
    quality: 'premium',
    url: 'https://oxylabs.io'
  },
  {
    name: 'Smartproxy',
    description: 'Доступные residential прокси с хорошим качеством',
    features: ['40+ млн IP', 'Неограниченные потоки', 'Город таргетинг', 'Easy setup'],
    pricing: 'от $75/мес',
    countries: 195,
    quality: 'high',
    url: 'https://smartproxy.com'
  },
  {
    name: 'ProxyEmpire',
    description: 'Быстрые residential прокси с конкурентными ценами',
    features: ['9+ млн IP', 'Высокая скорость', 'IP ротация', 'Хорошие цены'],
    pricing: 'от $39/мес',
    countries: 170,
    quality: 'high',
    url: 'https://proxyempire.io'
  },
  {
    name: 'Webshare',
    description: 'Бюджетные datacenter прокси для начинающих',
    features: ['Datacenter IP', 'Хорошие цены', 'Простая настройка', 'API доступ'],
    pricing: 'от $2.99/мес',
    countries: 50,
    quality: 'medium',
    url: 'https://webshare.io'
  }
];

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'premium': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    case 'high': return 'bg-green-500/20 text-green-300 border-green-500/50';
    case 'medium': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  }
};

const getQualityLabel = (quality: string) => {
  switch (quality) {
    case 'premium': return 'Премиум';
    case 'high': return 'Высокое';
    case 'medium': return 'Среднее';
    default: return 'Базовое';
  }
};

export const ProxyRecommendations: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Рекомендованные прокси сервисы
        </h2>
        <p className="text-muted-foreground">
          Для обеспечения разнообразия геолокации ваших ботов
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {proxyServices.map((service, index) => (
          <Card key={index} className="p-4 space-y-4 hover-lift">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <Badge 
                  variant="outline" 
                  className={getQualityColor(service.quality)}
                >
                  {getQualityLabel(service.quality)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
            </div>

            <div className="space-y-2">
              {service.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"/>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Globe size={12} />
                <span>{service.countries} стран</span>
              </div>
              <div className="font-medium text-primary">
                {service.pricing}
              </div>
            </div>

            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors text-sm font-medium"
            >
              <ExternalLink size={14} />
              Перейти на сайт
            </a>
          </Card>
        ))}
      </div>

      <Card className="p-4 border-amber-500/50 bg-amber-500/10">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-amber-200">Важные рекомендации</h4>
            <div className="text-sm text-amber-200/80 space-y-1">
              <p>• Используйте residential прокси для лучшей стабильности</p>
              <p>• Выбирайте разные страны для каждого бота</p>
              <p>• Избегайте бесплатных прокси - они часто заблокированы</p>
              <p>• Проверяйте скорость и стабильность перед покупкой</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};