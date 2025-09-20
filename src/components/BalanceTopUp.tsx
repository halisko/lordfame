import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GlassCard } from "./GlassCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

interface DatabasePaymentMethod {
  id: string;
  name: string;
  description: string;
  commission_percent: number;
  enabled: boolean;
  created_at: string;
}

interface BalanceTopUpProps {
  onClose: () => void;
  paymentMethods: DatabasePaymentMethod[];
}

export const BalanceTopUp = ({ onClose, paymentMethods }: BalanceTopUpProps) => {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<DatabasePaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleTopUp = async () => {
    if (!selectedMethod || !amount) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Пополнение успешно",
        description: `Баланс пополнен на ${amount} ₽ через ${selectedMethod.name}`
      });
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  const calculateTotal = () => {
    if (!amount || !selectedMethod) return 0;
    const baseAmount = parseFloat(amount);
    const commission = (baseAmount * selectedMethod.commission_percent) / 100;
    return baseAmount + commission;
  };

  return (
    <GlassCard>
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Пополнение баланса</CardTitle>
          <CardDescription className="text-center text-gray-300">
            Выберите сумму и способ пополнения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма пополнения (₽)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {amount && (
            <div className="space-y-3">
              <Label>Способы пополнения</Label>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {paymentMethods.filter(method => method.enabled).map((method) => (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedMethod?.id === method.id
                          ? "border-primary bg-primary/10"
                          : "border-white/20 bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={() => setSelectedMethod(method)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{method.name}</h4>
                            {method.description && (
                              <p className="text-sm text-gray-400">{method.description}</p>
                            )}
                          </div>
                          <Badge 
                            variant={method.commission_percent === 0 ? "secondary" : "outline"}
                            className={method.commission_percent === 0 ? "bg-green-500/20 text-green-400" : ""}
                          >
                            {method.commission_percent === 0 ? "0%" : `${method.commission_percent}%`}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {selectedMethod && amount && (
            <div className="space-y-4">
              <Separator className="bg-white/20" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Сумма:</span>
                  <span className="text-white">{amount} ₽</span>
                </div>
                {selectedMethod.commission_percent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Комиссия ({selectedMethod.commission_percent}%):</span>
                    <span className="text-orange-400">
                      +{((parseFloat(amount) * selectedMethod.commission_percent) / 100).toFixed(2)} ₽
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span className="text-white">К доплате:</span>
                  <span className="text-primary">{calculateTotal().toFixed(2)} ₽</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleTopUp}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? <LoadingSpinner /> : "Пополнить"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </GlassCard>
  );
};