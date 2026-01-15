import React from 'react';
import { motion } from 'framer-motion';

interface SpringConfig {
  delay?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  tension?: number;
  friction?: number;
}

interface MotionProps {
  defaultStyle: Record<string, number>;
  style: Record<string, number | SpringConfig>;
  children: (style: Record<string, number>) => React.ReactNode;
}

// Converts spring config to framer-motion transition config
const springConfigToTransition = (config: SpringConfig = {}) => {
  const { delay = 0, stiffness = 100, damping = 10 } = config;
  
  // Map react-motion spring physics to framer-motion
  // Higher stiffness = faster animation
  // Higher damping = less overshoot
  const durationMap = stiffness ? Math.max(0.2, 1 / (stiffness / 100)) : 0.8;
  
  return {
    duration: durationMap,
    delay: delay / 1000, // Convert ms to seconds
    ease: damping > 15 ? 'easeOut' : 'easeInOut',
  };
};

// Wrapper Motion component that mimics react-motion but uses framer-motion
export const Motion = React.forwardRef<HTMLDivElement, MotionProps>(
  ({ defaultStyle, style, children }, ref) => {
    // Extract values and animation config
    const animate: Record<string, number> = {};
    let springConfig: SpringConfig = {};

    for (const key in style) {
      const value = style[key];
      if (typeof value === 'number') {
        animate[key] = value;
      } else if (value && typeof value === 'object') {
        // Extract the actual animation value and config
        const firstValue = Object.values(value)[0];
        if (typeof firstValue === 'number') {
          animate[key] = firstValue;
        }
        // Store the config
        springConfig = { ...springConfig, ...value };
      }
    }

    const transition = springConfigToTransition(springConfig);

    // The children function receives the animated style values
    return (
      <motion.div
        ref={ref}
        initial={defaultStyle}
        animate={animate}
        transition={transition}
      >
        {typeof children === 'function' ? children(animate) : children}
      </motion.div>
    );
  }
);

Motion.displayName = 'Motion';

// Re-export spring function for compatibility
export const spring = (value: number, config?: SpringConfig) => {
  return { val: value, ...config };
};
