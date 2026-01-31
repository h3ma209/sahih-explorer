import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Book, Network, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Narrator {
  id: string;
  name: string;
  grade: string;
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

  return {
    title: `${data.book} #${data.hadith_no} | Sahih Explorer`,
    description: `Read Hadith ${data.hadith_no} from ${data.book}. ${data.chapter}`,
  };
}

export async function generateStaticParams() {
   const filePath = path.join(process.cwd(), 'public/data/hadith-index.json');
   if (fs.existsSync(filePath)) {
       const fileContents = fs.readFileSync(filePath, 'utf8');
       const hadiths: Hadith[] = JSON.parse(fileContents);
       return hadiths.map((h) => ({ id: h.id }));
   }
   return [];
}

export default async function HadithPage({ params }: PageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const data = await getHadithData(resolvedParams.id);

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-background">
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
              </div>
            </div>

            {/* Matn Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Text (Matn)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-right font-amiri text-2xl md:text-3xl leading-loose py-4" dir="rtl">
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
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                  {data.narrators.map((narrator, index) => {
                    const isScholar = narrator.id && narrator.id !== 'Unknown' && /^\d+$/.test(narrator.id);
                    
                    return (
                      <Link
                        key={index}
                        href={isScholar ? `/${locale}/scholar/${narrator.id}` : '#'}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors group ${
                          isScholar 
                            ? 'hover:bg-muted/50 cursor-pointer' 
                            : 'opacity-60 pointer-events-none'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : index === data.narrators.length - 1
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              isScholar ? 'group-hover:text-blue-500 transition-colors' : ''
                            }`}>
                              {narrator.name}
                              {narrator.grade && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  [Grade: {narrator.grade}]
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        {isScholar && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                            <span className="sr-only">View</span>
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                          </Button>
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
