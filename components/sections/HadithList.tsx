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
import { useScholarLoader } from "@/components/providers/ScholarLoaderProvider";
import { translateValue } from "@/lib/translations";

interface Hadith {
  hadith_no: string;
  source: string;
  chapter: string;
  chapter_no: string;
  text_ar: string;
  text_en: string;
  usc_msa_ref?: string;
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
  const { simulateLoading } = useScholarLoader();
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
            <Card className="overflow-hidden bg-card/50 hover:bg-card transition-all duration-300 border-l-4 border-l-amber-500/50 hover:border-l-amber-500 hover:shadow-lg hover:shadow-amber-500/5 group">
              <CardContent className="p-6 space-y-6">
                {/* Metadata */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4 items-center">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800">
                    {translateValue(hadith.source.trim(), locale, 'tag')}
                  </Badge>
                  <Badge variant="secondary" className="font-mono">
                    {t('label')} {hadith.hadith_no}
                  </Badge>
                  {hadith.usc_msa_ref && (
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" title="USC-MSA Reference">
                      USC {hadith.usc_msa_ref}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 ml-auto font-medium text-amber-600/80">
                    <BookOpen className="w-3 h-3" />
                    {hadith.chapter}
                  </span>
                </div>

                {/* Arabic Text */}
                <div 
                  className="text-right font-amiri text-2xl leading-[2.2] text-foreground/90 bg-gradient-to-l from-amber-500/10 to-transparent p-6 rounded-r-xl border-r-2 border-amber-500/20 shadow-sm"
                  dir="rtl"
                >
                  {hadith.text_ar}
                </div>

                {/* English Text */}
                <div className="text-muted-foreground leading-relaxed text-lg pl-4 border-l-2 border-muted">
                  <span className="font-semibold text-foreground/80 block mb-2 text-sm uppercase tracking-wide opacity-70">{t('translation')}</span>
                  {hadith.text_en}
                </div>
                
                {/* Isnad Chain - Enhanced Display */}
                   <div className="pt-4 mt-4 border-t border-border/50">
                     <div className="flex items-center gap-2 mb-4">
                       <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                         </svg>
                         {t('isnad')}
                       </div>
                       <Badge variant="outline" className="text-xs">
                         {t('narratorCount', {count: hadith.chain.length})}
                       </Badge>
                     </div>
                     
                     {/* Vertical Chain Layout */}
                      <div className="space-y-2">
                        {/* Wrapper for chain resolution to handle types correctly */}
                        {(searchIndex ? resolveIsnadChainSync(hadith.chain, searchIndex) : hadith.chain.map(id => ({ id, name: id, grade: '', reliability_grade: '', grade_display: undefined }))).slice().reverse().map((narrator, idx, arr) => {
                          const originalIdx = arr.length - 1 - idx;
                          // Handle string vs object (fallback)
                          const rawName = typeof narrator === 'string' ? narrator : narrator.name;
                          
                          // Localized Name Logic
                          let narratorName = rawName;
                          if (locale === 'en') {
                             narratorName = rawName.split('(')[0].trim();
                          }
                          // For Ar/Ckb, we keep the full name if it contains Arabic, 
                          // or if we could parse it better we would. 
                          // The raw name often contains "English ( Arabic )".

                          const narratorGradeObj = typeof narrator === 'object' ? narrator : null;
                          const reliability = narratorGradeObj?.reliability_grade || '';
                          const grade = narratorGradeObj?.grade || '';
                          
                          // Use translated grade if available
                          let displayGrade = '';
                          if (narratorGradeObj?.grade_display && narratorGradeObj.grade_display[locale]) {
                              displayGrade = narratorGradeObj.grade_display[locale];
                          } else {
                              displayGrade = [reliability, grade].filter(Boolean).join(' - ');
                          }
                          
                          const narratorId = typeof narrator === 'object' ? narrator.id : hadith.chain[hadith.chain.length - 1 - idx];
                          
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
                            <div className="flex-1 group/narrator">
                              <button
                                onClick={() => {
                                  if (narratorId) {
                                    simulateLoading(() => {
                                      router.push(`/${locale}/scholar/${narratorId}`);
                                    });
                                  }
                                }}
                                className="w-full text-left px-4 py-2.5 rounded-lg bg-gradient-to-br from-amber-500/5 to-amber-600/5 border border-amber-500/20 hover:border-amber-500/40 hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-foreground/90 group-hover/narrator:text-amber-600 dark:group-hover/narrator:text-amber-400 transition-colors">
                                    {narratorName}
                                    {displayGrade && (
                                      <span className="text-xs text-muted-foreground ml-2">
                                        [{t('gradePrefix')}{displayGrade}]
                                      </span>
                                    )}
                                  </span>
                                  <svg className="w-4 h-4 text-amber-500/60 opacity-0 group-hover/narrator:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 opacity-70 group-hover/narrator:opacity-100 transition-opacity">
                                  {idx === 0 ? t('firstNarrator') : idx === arr.length - 1 ? t('finalNarrator') : t('narratorNum', { num: idx + 1 })}
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
                       {t('chainDescription')}
                     </p>
                   </div>
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
