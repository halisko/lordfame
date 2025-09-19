import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { PaymentMethod } from '@/types';

const paymentMethods: PaymentMethod[] = [
  {
    id: 'sbp',
    name: 'СБП',
    icon: '🏦',
    description: 'Система быстрых платежей'
  },
  {
    id: 'card',
    name: 'Банковская карта',
    icon: '💳',
    description: 'Visa, MasterCard, МИР'
  },
  {
    id: 'qiwi',
    name: 'QIWI',
    icon: '🥝',
    description: 'QIWI кошелек'
  },
  {
    id: 'yoomoney',
    name: 'ЮMoney',
    icon: '💰',
    description: 'Яндекс.Деньги'
  },
  {
    id: 'webmoney',
    name: 'WebMoney',
    icon: '🔷',
    description: 'WebMoney кошелек'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🌐',
    description: 'Международные платежи'
  }
];

interface PaymentSystemProps {
  amount: number;
  currency: string;
  serviceName: string;
  onPayment: (method: PaymentMethod) => void;
}

export const PaymentSystem: React.FC<PaymentSystemProps> = ({
  amount,
  currency,
  serviceName,
  onPayment
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    
    // Симулация обработки платежа
    setTimeout(() => {
      setIsProcessing(false);
      onPayment(selectedMethod);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Оплата заказа</h2>
        <p className="text-muted-foreground">Выберите удобный способ оплаты</p>
      </div>

      {/* Информация о заказе */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground">Услуга:</span>
            <span className="font-semibold">{serviceName}</span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold text-foreground">К оплате:</span>
            <span className="font-bold text-primary text-xl">
              {amount} {currency}
            </span>
          </div>
        </div>
      </Card>

      {/* Способы оплаты */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Способы оплаты
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedMethod?.id === method.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedMethod(method)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{method.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {method.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {method.description}
                    </div>
                  </div>
                  {selectedMethod?.id === method.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* СБП выделяем особо */}
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xl">🏦</div>
            <Badge variant="default" className="text-xs">Рекомендуем</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>СБП</strong> - самый быстрый и безопасный способ оплаты. 
            Мгновенное зачисление средств без комиссии.
          </div>
        </div>
      </Card>

      {/* Кнопка оплаты */}
      {selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Безопасная оплата через защищенное соединение</span>
              </div>
              
              <Button
                className="w-full py-6 text-lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    Обработка платежа...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Оплатить {amount} {currency}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Нажимая кнопку "Оплатить", вы соглашаетесь с условиями использования
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};