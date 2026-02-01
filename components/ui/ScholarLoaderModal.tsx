"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 0, 0],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <BookOpen className="w-16 h-16 text-primary relative z-10" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                {t('loading_scholar')}...
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('seeking_knowledge')}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
