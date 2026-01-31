import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Book, Network, ChevronDown, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Narrator {
  id: string;
  name: string;
  grade: string;
  reliability_grade?: string;
  death_year: string;
}

interface Hadith {
  id: string;
  book: string;
  hadith_no: string;
  chapter_no: string;
  chapter: string;
  matn: string;
  matn_en: string;
  narrators: Narrator[];
}

async function getHadithData(id: string): Promise<Hadith | null> {
  const filePath = path.join(process.cwd(), 'public/data/hadith-index.json');
  try {
    if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const hadiths: Hadith[] = JSON.parse(fileContents);
        return hadiths.find((h) => h.id === id) || null;
    }
  } catch (e) {
    console.error("Failed to load hadith index", e);
  }
  return null;
}

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getHadithData(resolvedParams.id);

  if (!data) {
    return {
      title: 'Hadith Not Found | Sahih Explorer',
      description: 'The requested hadith could not be found.',
    };
  }

  const description = data.matn_en 
    ? `${data.matn_en.substring(0, 150)}... - Read authentic hadith from ${data.book}`
    : `Read Hadith ${data.hadith_no} from ${data.book}. ${data.chapter}`;

  return {
    title: `${data.book} #${data.hadith_no} - Sahih Explorer`,
    description: description,
    openGraph: {
      title: `${data.book} #${data.hadith_no}`,
      description: description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.book} #${data.hadith_no}`,
      description: description,
    }
  };
}

// Optimization: In production, generate static params for all hadiths.
// In dev, we can skip this or limit it to avoid parsing heavy JSON repeatedly.
export async function generateStaticParams() {
   if (process.env.NODE_ENV === 'development') {
     return []; // Skip static generation in dev to speed up updates
   }

   const filePath = path.join(process.cwd(), 'public/data/hadith-index.json');
   try {
     if (fs.existsSync(filePath)) {
         const fileContents = fs.readFileSync(filePath, 'utf8');
         const hadiths: Hadith[] = JSON.parse(fileContents);
         // Limit static generation to top 100 to reduce build time significantly (from hours to minutes)
         // The rest will be statically generated on demand (ISR)
         return hadiths.slice(0, 100).map((h) => ({ id: h.id }));
     }
   } catch (error) {
     console.error("Error generating static params:", error);
   }
   return [];
}

export default async function HadithPage({ params }: PageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const data = await getHadithData(resolvedParams.id);

  if (!data) notFound();

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${data.book} Hadith ${data.hadith_no}`,
    "articleSection": data.chapter,
    "articleBody": data.matn_en || data.matn,
    "inLanguage": locale,
    "author": {
      "@type": "Person",
      "name": data.narrators[0]?.name || "Unknown" // First narrator usually source
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sahih Explorer",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sahih-explorer.com/logo.png" // Update with real URL
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section - Matching Scholar Page */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Book className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{data.book} #{data.hadith_no}</h1>
                <p className="text-muted-foreground">{data.chapter}</p>
                {data.chapter_no && (
                   <Badge variant="outline" className="mt-2">
                     Chapter {data.chapter_no}
                   </Badge>
                )}
              </div>
            </div>

            {/* Matn Card */}
            <Card className="mb-8 border-bg-accent/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Text (Matn)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" title="Copy Text">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Share">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-right font-amiri text-2xl md:text-3xl leading-loose py-4 px-2" dir="rtl">
                  {data.matn}
                </p>
                {data.matn_en && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {data.matn_en}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Network Section - EXACTLY like Scholar Page */}
      <section id="network" className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Network className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">Sanad (Chain)</h2>
                <p className="text-muted-foreground">
                  The chain of narration linking to the source.
                </p>
              </div>
            </div>

            {/* Narrators List - EXACTLY matching Scholar Page Network Lists */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Narrators ({data.narrators.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2">
                  {data.narrators.map((narrator, index) => {
                    const isScholar = narrator.id && narrator.id !== 'Unknown' && /^\d+$/.test(narrator.id);
                    
                    return (
                      <Link
                        key={index}
                        href={isScholar ? `/${locale}/scholar/${narrator.id}` : '#'}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 group border border-transparent hover:border-border ${
                          isScholar 
                            ? 'hover:bg-accent/50 cursor-pointer' 
                            : 'opacity-70 pointer-events-none'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-offset-2 ring-offset-background ${
                            index === 0 
                              ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20' 
                              : index === data.narrators.length - 1
                              ? 'bg-amber-500/10 text-amber-500 ring-amber-500/20'
                              : 'bg-blue-500/10 text-blue-500 ring-blue-500/20'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-medium text-base ${
                              isScholar ? 'group-hover:text-primary transition-colors' : ''
                            }`}>
                              {narrator.name}
                            </span>
                            {(narrator.reliability_grade || narrator.grade) && (
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                  {[narrator.reliability_grade, narrator.grade].filter(Boolean).join(' • ')}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        {isScholar && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronDown className="w-4 h-4 -rotate-90 text-muted-foreground" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
