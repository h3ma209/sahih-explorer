"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, ChevronDown, ChevronUp, Quote } from "lucide-react";

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
}

export default function HadithList({ hadiths }: HadithListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  if (!hadiths || hadiths.length === 0) {
    return (
      <Card className="bg-muted/5 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mb-4 opacity-20" />
          <p>No narrated hadiths recorded in this collection for this scholar.</p>
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
          Recorded Narrations
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
                    Hadith {hadith.hadith_no}
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
                  <span className="font-semibold text-foreground/80 block mb-2">Translation:</span>
                  {hadith.text_en}
                </div>
                
                {/* Chain Expand (Optional Future Feature) */}
                {hadith.chain && hadith.chain.length > 0 && (
                   <div className="pt-2 border-t border-border/50 mt-4">
                     <p className="text-xs text-muted-foreground">
                       Isnad Chain ID: {hadith.chain.join(" → ")}
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
            Load More Narrations
            <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
}
