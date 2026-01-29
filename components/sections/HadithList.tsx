"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
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
  const locale = useLocale();
  const router = useRouter();
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
                     <div className="flex items-center gap-2 mb-4">
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
                     
                     {/* Vertical Chain Layout */}
                     <div className="space-y-2">
                       {(searchIndex ? resolveIsnadChainSync(hadith.chain, searchIndex) : hadith.chain).slice().reverse().map((narrator, idx, arr) => {
                         const originalIdx = arr.length - 1 - idx; // Get original index for ID lookup
                         return (
                         <div key={idx} className="flex items-start gap-3">
                           {/* Position Indicator */}
                           <div className="flex flex-col items-center flex-shrink-0">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-2 border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-600 dark:text-amber-400">
                               {idx + 1}
                             </div>
                             {idx < arr.length - 1 && (
                               <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500/40 to-amber-500/20 my-1" />
                             )}
                           </div>
                           
                           {/* Narrator Card */}
                           <div className="flex-1 group">
                             <button
                               onClick={() => {
                                 const narratorId = hadith.chain[hadith.chain.length - 1 - idx]; // Reverse lookup
                                 if (narratorId) {
                                   router.push(`/${locale}/scholar/${narratorId}`);
                                 }
                               }}
                               className="w-full text-left px-4 py-2.5 rounded-lg bg-gradient-to-br from-amber-500/5 to-amber-600/5 border border-amber-500/20 hover:border-amber-500/40 hover:shadow-md transition-all duration-200"
                             >
                               <div className="flex items-center justify-between">
                                 <span className="text-sm font-medium text-foreground/90 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                   {narrator}
                                 </span>
                                 <svg className="w-4 h-4 text-amber-500/60 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                 </svg>
                               </div>
                               <div className="text-xs text-muted-foreground mt-1">
                                 {idx === 0 ? 'Prophet ﷺ' : idx === arr.length - 1 ? 'Final Narrator' : `Narrator ${idx + 1}`}
                               </div>
                             </button>
                           </div>
                         </div>
                       );
                       })}
                     </div>
                     
                     <p className="text-xs text-muted-foreground mt-4 italic flex items-center gap-1.5">
                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
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
