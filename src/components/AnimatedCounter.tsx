import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1,
  className = "",
  format = (v) => v.toLocaleString()
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  const spring = useSpring(displayValue, {
    stiffness: 100,
    damping: 30,
    mass: 1
  });

  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return rounded.onChange((latest) => {
      setDisplayValue(latest);
    });
  }, [rounded]);

  return (
    <motion.span 
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: value !== displayValue ? 1.1 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {format(displayValue)}
    </motion.span>
  );
};