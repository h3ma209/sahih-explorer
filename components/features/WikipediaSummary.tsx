"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WikipediaSummaryProps {
  scholarName: string;
  deathYear?: string;
  scholarGrade?: string;
  locale: string;
}

export default function WikipediaSummary({ scholarName, deathYear, scholarGrade, locale }: WikipediaSummaryProps) {
  const t = useTranslations('Wikipedia');
  const [summary, setSummary] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWikiData = async () => {
      if (!scholarName) return;
      
      setLoading(true);
      setError(false);
      setSummary(null);

      // --- Grade Mapping ---
      // Map internal dataset grades to Wikipedia terminology
      const gradeMap: Record<string, string> = {
          "Comp.(RA)": "Sahabah",
          "Comp.(RA) [1st Generation]": "Sahabah",
          "Tabi'i": "Tabi'un",
          "Tabi' (RA)": "Tabi'un",
          "Tabi' at-Tabi'in": "Taba_al-Tabi'in",
          "Major Tabi'i": "Tabi'un"
      };

      // Determine "Role" Keyword based on grade
      let roleKeyword = "";
      if (scholarGrade) {
          // Normalize check
          const g = scholarGrade.trim();
          if (g.includes("Comp")) roleKeyword = "Sahabah";
          else if (g.includes("Tabi")) roleKeyword = "Tabi'un";
      }

      console.log(`Wikipedia: Grade "${scholarGrade}" mapped to keyword "${roleKeyword}"`);


      // --- Name Extraction ---
      let englishName = "";
      let arabicName = "";

      // Extract English (strip Arabic and special chars)
      englishName = scholarName
        .replace(/\s*\(.*?\)/g, "") // Remove parens
        .replace(/[\u0600-\u06FF]/g, "") // Remove Arabic
        .replace(/[^a-zA-Z\s'-]/g, "") // Remove remaining symbols
        .trim();

      // Extract Arabic (Capture Arabic chars)
      const arabicMatch = scholarName.match(/[\u0600-\u06FF\s]+/);
      if (arabicMatch) {
          arabicName = arabicMatch[0].trim();
      }

      console.log(`Wikipedia: English Name: "${englishName}", Arabic Name: "${arabicName}"`);

      // Helper: Search implementation
      const performSearch = async (lang: string, term: string, useSpecificFallback = false) => {
          if (!term || term.length < 2) return null;
          
          try {
            console.log(`Wikipedia [${lang}]: Searching for "${term}"`);
            const baseUrl = `https://${lang}.wikipedia.org`;
            
            // 1. Initial Search
            let searchUrl = `${baseUrl}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&format=json&origin=*`;
            let res = await fetch(searchUrl);
            let data = await res.json();
            
            // 1.5 CHECK FOR SUGGESTIONS (Retry logic)
            // If main results are empty but a suggestion exists (e.g. valid "Uthman ibn Affan" vs typo)
            if (!data.query?.search?.length && data.query?.searchinfo?.suggestion) {
                 const suggestion = data.query.searchinfo.suggestion;
                 console.log(`Wikipedia [${lang}]: No results for "${term}", but found suggestion: "${suggestion}". Retrying...`);
                 // Retry with suggestion
                 searchUrl = `${baseUrl}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(suggestion)}&format=json&origin=*`;
                 res = await fetch(searchUrl);
                 data = await res.json();
            }

            // 2. Specialized Fallback (if English and Role exists)
            // If generalized search failed, try specifically appending the role (e.g. "Name Sahaba")
            if (!data.query?.search?.length && lang === 'en' && useSpecificFallback && roleKeyword) {
                 console.log(`Wikipedia [en]: Generic search failed, trying with role: "${term} ${roleKeyword}"`);
                 searchUrl = `${baseUrl}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term + " " + roleKeyword)}&format=json&origin=*`;
                 res = await fetch(searchUrl);
                 data = await res.json();
            } else if (!data.query?.search?.length && lang === 'en') {
                 // Standard fallback
                 searchUrl = `${baseUrl}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term + " Islamic")}&format=json&origin=*`;
                 res = await fetch(searchUrl);
                 data = await res.json();
            }

            if (!data.query?.search?.length) return null;

            const bestTitle = data.query.search[0].title;
            const summaryUrl = `${baseUrl}/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`;
            
            const summaryRes = await fetch(summaryUrl);
            if (!summaryRes.ok) return null;
            
            const summaryData = await summaryRes.json();
            return { data: summaryData, title: bestTitle };

          } catch (e) {
              console.error(`Wikipedia [${lang}] Error:`, e);
              return null;
          }
      };

      // Helper: Validator
      const validateResult = (data: any, title: string, lang: string) => {
            const text = (data.extract || "").toLowerCase();
            const description = (data.description || "").toLowerCase();
            const lowerTitle = title.toLowerCase();
            const combinedText = `${text} ${description} ${lowerTitle}`;

            // 1. Era Check
            if (deathYear) {
                const yearNum = parseInt(deathYear);
                if (!isNaN(yearNum) && yearNum < 1800) {
                     // English modern keywords
                     const enModern = ["19th", "20th", "21st", "bengali", "pakistani", "indian politician"];
                     // Arabic modern keywords
                     const arModern = ["القرن التاسع عشر", "القرن العشرين", "سياسي", "باكستاني", "بنغالي"];
                     
                     const keywords = lang === 'en' ? enModern : arModern;
                     if (keywords.some(k => combinedText.includes(k))) {
                         console.log(`Wikipedia [${lang}]: Rejected "${title}" due to Era Mismatch.`);
                         return false;
                     }
                }
            }

            // 2. Context Check
            const enKeywords = [
                "islam", "muslim", "scholar", "hadith", "jurist", "theologian", 
                "imam", "fiqh", "sunni", "caliph", "companion", 
                "prophet", "narrator", "muhaddith", "shaykh", "ulama", "biography", "sahaba",
                "tabi", "successor"
            ];
            const arKeywords = [
                "إسلام", "مسلم", "عالم", "حديث", "فقيه", "إمام", "سني", "صحابي", 
                "نبي", "راوي", "محدث", "شيخ", "علماء", "سيرة", "تابعي", "خليفة"
            ];
            // Kurdish Keywords (Basic)
            const kuKeywords = [
                "îslam", "misilman", "çîrok", "pêxember", "sehabe", "oldar", "zanist"
            ];

            let keywords = enKeywords;
            if (lang === 'ar') keywords = arKeywords;
            if (lang === 'ku' || lang === 'ckb') keywords = kuKeywords;
            
            return keywords.some(k => combinedText.includes(k));
      };


      // --- Execution Flow ---
      
      // Strategy based on Locale
      // 1. If 'ar', try Arabic first.
      // 2. If 'ku', try Kurdish ('ku' or 'ckb'?) Wikipedia uses 'ku' (Kurmanji) and 'ckb' (Sorani).
      //    We'll assume 'ku' for now as generic.
      // 3. If 'en' or other, try English first.

      if (locale === 'ar') {
           // ARABIC PRIORITY
           if (arabicName) {
               const arResult = await performSearch('ar', arabicName);
               if (arResult && validateResult(arResult.data, arResult.title, 'ar')) {
                   setSummary(arResult.data.extract);
                   setUrl(arResult.data.content_urls?.desktop?.page);
                   setLoading(false);
                   return; 
               }
           }
      } else if (locale === 'ckb') {
           // KURDISH (SORANI) PRIORITY
           // Try searching with Arabic Name (often shared) or translate?
           // Central Kurdish Wikipedia uses Arabic script primarily.
           // Let's try searching with Arabic name first in Kurdish Wiki, then English name.
           if (arabicName) {
                const ckbResult = await performSearch('ckb', arabicName);
                if (ckbResult) {
                    setSummary(ckbResult.data.extract);
                    setUrl(ckbResult.data.content_urls?.desktop?.page);
                    setLoading(false);
                    return; 
                }
           }
           if (englishName) {
                const ckbResultEn = await performSearch('ckb', englishName);
                 if (ckbResultEn) {
                    setSummary(ckbResultEn.data.extract);
                    setUrl(ckbResultEn.data.content_urls?.desktop?.page);
                    setLoading(false);
                    return; 
                }
           }
      }

      // DEFAULT / FALLBACK FLOW (English First)
      if (englishName) {
          const enResult = await performSearch('en', englishName, true);
          if (enResult && validateResult(enResult.data, enResult.title, 'en')) {
              setSummary(enResult.data.extract);
              setUrl(enResult.data.content_urls?.desktop?.page);
              setLoading(false);
              return;
          }
      }

      // Attempt 2: Arabic (Fallback if English failed OR if we are in non-Arabic locale but still want results)
      if (arabicName && locale !== 'ar') { // processed above if ar
          console.log("Wikipedia: English search yield no valid results. Switching to Arabic fallback...");
          const arResult = await performSearch('ar', arabicName);
          if (arResult && validateResult(arResult.data, arResult.title, 'ar')) {
              setSummary(arResult.data.extract);
              setUrl(arResult.data.content_urls?.desktop?.page);
              setLoading(false);
              return; // Success
          }
      }

      // Failure
      setError(true);
      setLoading(false);
    };

    fetchWikiData();
  }, [scholarName, deathYear, scholarGrade, locale]);

  if (loading || error || !summary) return null;

  return (
    <section className="container mx-auto px-4 -mt-8 relative z-20 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-card/80 backdrop-blur-md border-amber-500/20 shadow-xl overflow-hidden">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 p-3 bg-amber-500/10 rounded-full">
              <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            
            <div className="space-y-4 flex-grow">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
                  {t('title')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center gap-1">
                  <Fingerprint className="w-3 h-3" />
                  {t('verified')}
                </span>
              </div>
              
              <p className="text-muted-foreground leading-relaxed text-lg text-start" dir="auto">
                {summary}
              </p>
              
              <div className="pt-2">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium group"
                  onClick={() => window.open(url!, "_blank")}
                >
                  {t('readMore')}
                  <ExternalLink className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
