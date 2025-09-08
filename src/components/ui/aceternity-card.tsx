"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AceternityCardProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}

export const AceternityCard = ({
  children,
  className,
  containerClassName,
  animate = true,
}: AceternityCardProps) => {
  return (
    <div className={cn("relative group", containerClassName)}>
      <div
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r from-slate-300 via-gray-300 to-slate-400 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200",
          animate && "animate-tilt"
        )}
      ></div>
      <motion.div
        whileHover={animate ? { y: -2 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "relative bg-card border border-border rounded-lg p-6 shadow-lg backdrop-blur-sm",
          "bg-gradient-to-br from-white/90 to-slate-50/40 hover:from-white/95 hover:to-slate-50/60 transition-all duration-300",
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const GradientBackground = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100",
        "relative overflow-hidden",
        className
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};
