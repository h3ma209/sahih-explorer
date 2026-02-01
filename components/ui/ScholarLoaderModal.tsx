"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Star, Sparkles, Scroll } from "lucide-react";

interface ScholarLoaderModalProps {
  isOpen: boolean;
}

export default function ScholarLoaderModal({ isOpen }: ScholarLoaderModalProps) {
  const t = useTranslations('Common');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
        >
          <div className="relative flex flex-col items-center justify-center">
            
            {/* Background Geometric Pattern (Spinning) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute pointer-events-none opacity-5 will-change-transform"
            >
              <div className="w-96 h-96 border-2 border-dashed border-primary rounded-full flex items-center justify-center">
                <div className="w-72 h-72 border border-primary/50 rounded-full" />
              </div>
            </motion.div>

            {/* Orbiting Particle */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute w-48 h-48 pointer-events-none will-change-transform"
            >
              <div className="w-2 h-2 bg-amber-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_2px_rgba(245,158,11,0.5)]" />
            </motion.div>
             <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute w-32 h-32 pointer-events-none will-change-transform"
            >
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)]" />
            </motion.div>

            {/* Central Icon Compisition */}
            <div className="relative mb-8">
              {/* Pulsing Glow */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl"
              />
              
              <div className="relative z-10 p-6 bg-card border border-amber-500/20 rounded-2xl shadow-2xl">
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                    <BookOpen className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                </motion.div>
                
                {/* Small floating elements */}
                <motion.div 
                    animate={{ y: [-2, 2, -2], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute -top-2 -right-2"
                >
                    <Sparkles className="w-5 h-5 text-amber-400" />
                </motion.div>
              </div>
            </div>

            {/* Text & Progress */}
            <div className="flex flex-col items-center space-y-3 z-10">
              <motion.h3 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700"
              >
                {t('loading_scholar')}
              </motion.h3>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-muted-foreground text-sm"
              >
                <Scroll className="w-3 h-3" />
                <span>{t('seeking_knowledge')}</span>
              </motion.div>

              {/* Loading Bar */}
              <motion.div 
                 className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-4"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.3 }}
              >
                 <motion.div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                 />
              </motion.div>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
