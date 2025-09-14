import React from "react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  online: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  online, 
  className,
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4"
  };

  return (
    <div className={cn(
      "status-indicator rounded-full",
      online ? "bg-success online" : "bg-error offline",
      sizeClasses[size],
      className
    )} />
  );
};