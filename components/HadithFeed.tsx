"use client";

import { motion } from "framer-motion";
import { BookOpen, Link2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Hadith {
  hadith_no: string;
  chapter: string;
  text_en: string;
  usc_msa_ref?: string;
  chain: string[];
}

function HadithCard({ hadith, index }: { hadith: Hadith; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = hadith.text_en.length > 400;
  const displayText = isExpanded || !isLong 
    ? hadith.text_en 
    : hadith.text_en.substring(0, 400) + "...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
      className="group relative"
    >
      {/* Decorative side accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 via-amber-600 to-transparent rounded-full opacity-60" />
      
      <div className="glass rounded-2xl p-8 hover:border-amber-500/30 transition-all duration-300 ml-4 relative overflow-hidden">
        
        {/* Subtle background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <BookOpen className="w-full h-full text-amber-500" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold font-mono text-lg">#{hadith.hadith_no.trim()}</span>
                {hadith.usc_msa_ref && (
                  <span className="text-slate-500 text-sm ml-2 font-mono" title="USC-MSA Reference">
                    (USC {hadith.usc_msa_ref})
                  </span>
                )}
              </div>
              <h3 className="text-slate-400 text-xs mt-1 max-w-md line-clamp-1">
                {hadith.chapter}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Hadith Text */}
        <div className="relative z-10">
          <p className="text-slate-200 leading-relaxed text-base font-serif">
            {displayText}
          </p>
          
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-sm font-medium"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Read more
                </>
              )}
            </button>
          )}
        </div>

        {/* Chain of Narration */}
        <div className="mt-6 pt-6 border-t border-slate-800/50 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Chain of Narration ({hadith.chain.length} narrators)
            </span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {hadith.chain.map((id, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.03 }}
                className="relative group/chain"
              >
                <div className="px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-900/50 rounded-lg font-mono text-xs text-slate-400 hover:text-amber-400 transition-all cursor-pointer">
                  {id}
                </div>
                {idx < hadith.chain.length - 1 && (
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-slate-700" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HadithFeed({ hadiths }: { hadiths: Hadith[] }) {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto px-4">
      {hadiths.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No hadiths found for this narrator</p>
        </div>
      ) : (
        hadiths.map((h, i) => (
          <HadithCard key={i} hadith={h} index={i} />
        ))
      )}
    </div>
  );
}

