import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = false 
}) => {
  return (
    <div className={cn(
      "glass-card rounded-xl shadow-card",
      hover && "hover-lift cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
};