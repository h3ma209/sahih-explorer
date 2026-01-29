"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, ChevronDown, ChevronUp, Quote } from "lucide-react";
import { resolveIsnadChainSync } from "@/lib/isnad";

interface Hadith {
  hadith_no: string;
  source: string;
  chapter: string;
  chapter_no: string;
  text_ar: string;
  text_en: string;
  chain: string[];
}

interface HadithListProps {
  hadiths: Hadith[];
  searchIndex?: any[];
}

export default function HadithList({ hadiths, searchIndex = [] }: HadithListProps) {
  const t = useTranslations('Hadiths');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  if (!hadiths || hadiths.length === 0) {
    return (
      <Card className="bg-muted/5 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mb-4 opacity-20" />
          <p>{t('noNarrations')}</p>
        </CardContent>
      </Card>
    );
  }

  const displayedHadiths = hadiths.slice(0, page * itemsPerPage);
  const hasMore = displayedHadiths.length < hadiths.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Quote className="w-5 h-5 text-amber-500" />
          {t('recordedNarrations')}
          <Badge variant="secondary" className="ml-2">
            {hadiths.length}
          </Badge>
        </h3>
      </div>

      <div className="space-y-4">
        {displayedHadiths.map((hadith, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden bg-card/50 hover:bg-card transition-colors border-l-4 border-l-amber-500/50">
              <CardContent className="p-6 space-y-4">
                {/* Metadata */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                  <Badge variant="outline" className="bg-amber-500/5">
                    {hadith.source.trim()}
                  </Badge>
                  <Badge variant="outline">
                    {t('label')} {hadith.hadith_no}
                  </Badge>
                  <span className="flex items-center gap-1 ml-auto">
                    {hadith.chapter}
                  </span>
                </div>

                {/* Arabic Text */}
                <div 
                  className="text-right font-amiri text-xl leading-loose text-foreground/90 bg-muted/30 p-4 rounded-lg border border-border/50"
                  dir="rtl"
                >
                  {hadith.text_ar}
                </div>

                {/* English Text */}
                <div className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground/80 block mb-2">{t('translation')}:</span>
                  {hadith.text_en}
                </div>
                
                {/* Isnad Chain - Enhanced Display */}
                {hadith.chain && hadith.chain.length > 0 && (
                   <div className="pt-4 mt-4 border-t border-border/50">
                     <div className="flex items-center gap-2 mb-3">
                       <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                         </svg>
                         {t('isnad')}
                       </div>
                       <Badge variant="outline" className="text-xs">
                         {hadith.chain.length} {hadith.chain.length === 1 ? 'narrator' : 'narrators'}
                       </Badge>
                     </div>
                     <div className="flex flex-wrap items-center gap-2 text-sm">
                       {(searchIndex ? resolveIsnadChainSync(hadith.chain, searchIndex) : hadith.chain).map((narrator, idx, arr) => (
                         <div key={idx} className="flex items-center gap-2">
                           <div className="group relative">
                             <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 hover:shadow-md">
                               <span className="text-foreground/90 font-medium">{narrator}</span>
                             </div>
                             {/* Tooltip with position info */}
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border shadow-lg">
                               {idx === 0 ? 'First Narrator' : idx === arr.length - 1 ? 'Final Narrator' : `Narrator ${idx + 1}`}
                             </div>
                           </div>
                           {idx < arr.length - 1 && (
                             <svg className="w-5 h-5 text-amber-500/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                             </svg>
                           )}
                         </div>
                       ))}
                     </div>
                     <p className="text-xs text-muted-foreground mt-3 italic">
                       Chain of transmission from the Prophet ﷺ to the final narrator
                     </p>
                   </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            className="group"
            onClick={() => setPage(p => p + 1)}
          >
            {t('loadMore')}
            <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
}
