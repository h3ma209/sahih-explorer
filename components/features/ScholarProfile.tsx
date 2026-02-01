"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import WikipediaSummary from "@/components/features/WikipediaSummary";
import NetworkGraph from "@/components/visualizations/NetworkGraph";
import FamilyTreeGraph from "@/components/visualizations/FamilyTreeGraph";
import TimelineChart from "@/components/visualizations/TimelineChart";
import AnalyticsDashboard from "@/components/visualizations/AnalyticsDashboard";
import HadithList from "@/components/sections/HadithList";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { translateValue, translateArray } from "@/lib/translations";
import {
  User,
  Network,
  Calendar,
  BarChart3,
  BookOpen,
  MapPin,
  Award,
  Users,
  ChevronDown,
} from "lucide-react";
import { useScholarLoader } from "@/components/providers/ScholarLoaderProvider";

interface ScholarProfileProps {
  initialData: any;
  searchIndex?: any[];
}

export default function ScholarProfile({ initialData, searchIndex = [] }: ScholarProfileProps) {
  const router = useRouter();
  const locale = useLocale();
  const { simulateLoading } = useScholarLoader();
  const tStats = useTranslations('Stats');
  const tNetwork = useTranslations('Network');
  const tBio = useTranslations('Biography');
  const tFamily = useTranslations('Family');
  const tTime = useTranslations('Timeline');
  const tHadith = useTranslations('Hadiths');
  const tAnalytic = useTranslations('Analytics');
  const tFooter = useTranslations('Footer');
  const tCommon = useTranslations('Common');
  const tHero = useTranslations('Hero');

  // If initialData is missing (e.g. error in server fetch), show error state
  if (!initialData) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">{tCommon('scholarNotFound')}</h2>
            <p className="text-muted-foreground max-w-md">
              {tCommon('scholarNotFoundDesc')}
            </p>
          </div>
        </div>
      );
  }

  const { id: scholarId, name, full_name, grade, biography, parents, spouses, siblings, children, teachers, students, hadiths } = initialData;

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <HeroSection
        scholarName={name}
        scholarTitle={
            initialData.grade_display && initialData.grade_display[locale] 
                ? initialData.grade_display[locale] 
                : (grade ? `${grade}` : tHero('scholarTitleFallback'))
        }
      />
      
      {/* Wikipedia Summary */}
      <WikipediaSummary 
          scholarName={name} 
          deathYear={biography?.death?.date_gregorian || biography?.death?.date_hijri}
          scholarGrade={grade}
          locale={locale}
      />

      {/* Biography Section */}
      <section id="biography" className="py-12 md:py-24 ">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <User className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">{tBio('title')}</h2>
                <p className="text-muted-foreground text-lg">{full_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Birth Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    {tStats('born')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {biography.birth.date_display && (
                    <div>
                      <p className="text-sm text-muted-foreground">{tStats('date')}</p>
                      <p className="font-medium">
                        {biography.birth.date_display.join(" / ")}
                      </p>
                    </div>
                  )}
                  {biography.birth.place && (
                    <div>
                      <p className="text-sm text-muted-foreground">{tStats('place')}</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {biography.birth.place_display && biography.birth.place_display[locale] 
                            ? biography.birth.place_display[locale] 
                            : translateValue(biography.birth.place, locale, 'city')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Death Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    {tStats('died')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {biography.death.date_display && (
                    <div>
                      <p className="text-sm text-muted-foreground">{tStats('date')}</p>
                      <p className="font-medium">
                        {biography.death.date_display.join(" / ")}
                      </p>
                    </div>
                  )}
                  {biography.death.place && (
                    <div>
                      <p className="text-sm text-muted-foreground">{tStats('place')}</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {biography.death.place_display && biography.death.place_display[locale]
                            ? biography.death.place_display[locale]
                            : translateValue(biography.death.place, locale, 'city')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-amber-500" />
                    {tStats('overview')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{tNetwork('teachers')}</span>
                    <Badge variant="outline">{teachers.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{tNetwork('students')}</span>
                    <Badge variant="outline">{students.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{tHadith('title')}</span>
                    <Badge variant="outline">{hadiths.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            {(biography.tags_display?.length > 0 || biography.tags.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    {tBio('historicalSignificance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(biography.tags_display 
                        ? biography.tags_display.map((t: any) => t[locale] || t.en)
                        : translateArray(biography.tags, locale, 'tag')
                     ).map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(biography.places_of_stay_display?.length > 0 || (biography.places_of_stay && biography.places_of_stay.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      {tStats('residence')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(biography.places_of_stay_display
                          ? biography.places_of_stay_display.map((p: any) => p[locale] || p.en)
                          : translateArray(biography.places_of_stay, locale, 'city')
                       ).map((place: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1.5"
                        >
                          {place}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
            )}
          </motion.div>
        </div>
      </section>

      {/* Family Tree Section */}
      <section id="family" className="py-12 md:py-24 bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-500/10 rounded-xl">
                <Users className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">{tFamily('title')}</h2>
                <p className="text-muted-foreground">
                  {tFamily('subtitle')}
                </p>
              </div>
            </div>

            <FamilyTreeGraph
              scholar={{
                id: scholarId,
                name: name,
                grade: grade,
              }}
              parents={parents}
              spouses={spouses}
              children={children}
              siblings={siblings}
            />
          </motion.div>
        </div>
      </section>

      {/* Network Section */}
      <section id="network" className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Network className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">{tNetwork('title')}</h2>
                <p className="text-muted-foreground">
                   {tNetwork('subtitle')}
                </p>
              </div>
            </div>

            <NetworkGraph
              scholar={{
                id: scholarId,
                name: name,
                grade: grade,
              }}
              teachers={teachers}
              students={students}
            />

            {/* Network Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
               {/* Teachers List */}
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      {tNetwork('teachers')} ({teachers.length})
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                      {teachers.length > 0 ? Array.from(new Map(teachers.map((t: any) => [t.id, t])).values()).map((t: any) => (
                        <div 
                          key={t.id} 
                          onClick={() => {
                            simulateLoading(() => {
                                router.push(`/${locale}/scholar/${t.id}`);
                            });
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500">
                               T
                             </div>
                             <span className="font-medium group-hover:text-blue-500 transition-colors">{t.name}</span>
                          </div>
                          {t.id && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                              <span className="sr-only">View</span>
                              <ChevronDown className="w-4 h-4 -rotate-90" />
                            </Button>
                          )}
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground p-4 text-center">{tNetwork('noTeachers')}</p>
                      )}
                   </div>
                 </CardContent>
               </Card>

               {/* Students List */}
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      {tNetwork('students')} ({students.length})
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                      {students.length > 0 ? Array.from(new Map(students.map((s: any) => [s.id, s])).values()).map((s: any) => (
                        <div 
                          key={s.id} 
                          onClick={() => {
                            simulateLoading(() => {
                                router.push(`/${locale}/scholar/${s.id}`);
                            });
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-500">
                               S
                             </div>
                             <span className="font-medium group-hover:text-emerald-500 transition-colors">{s.name}</span>
                          </div>
                          {s.id && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                              <span className="sr-only">View</span>
                              <ChevronDown className="w-4 h-4 -rotate-90" />
                            </Button>
                          )}
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground p-4 text-center">{tNetwork('noStudents')}</p>
                      )}
                   </div>
                 </CardContent>
               </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-12 md:py-24 ">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">{tTime('title')}</h2>
                <p className="text-muted-foreground">{tTime('subtitle')}</p>
              </div>
            </div>

            <TimelineChart biography={biography} name={name} />
          </motion.div>
        </div>
      </section>

      {/* Hadiths Section */}
      <section id="hadiths" className="py-12 md:py-24 ">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">{tHadith('title')}</h2>
                <p className="text-muted-foreground">
                  {tHadith('countSubtitle', { count: hadiths.length })}
                </p>
              </div>
            </div>

            <HadithList hadiths={hadiths} searchIndex={searchIndex} />
          </motion.div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-12 md:py-24 ">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-500/10 rounded-xl">
                <BarChart3 className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">{tAnalytic('title')}</h2>
                <p className="text-muted-foreground">{tAnalytic('subtitle')}</p>
              </div>
            </div>

            <AnalyticsDashboard
              biography={biography}
              teachers={teachers}
              students={students}
              hadiths={hadiths}
            />
          </motion.div>
        </div>
      </section>

       {/* Footer */}
       <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
              {tFooter('title')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {tFooter('tagline')}
            </p>
            <Separator className="my-6" />
            <p className="text-xs text-muted-foreground">
              {tFooter('attribution')}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
