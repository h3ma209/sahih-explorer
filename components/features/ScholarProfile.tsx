"use client";

import { useEffect, useState } from "react";
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

interface ScholarProfileProps {
  initialData: any;
}

export default function ScholarProfile({ initialData }: ScholarProfileProps) {
  const router = useRouter();

  // If initialData is missing (e.g. error in server fetch), show error state
  if (!initialData) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Scholar Not Found</h2>
            <p className="text-muted-foreground max-w-md">
              This scholar's profile is not available.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/")} variant="default">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
  }

  const { id: scholarId, name, full_name, grade, biography, parents, spouses, siblings, children, teachers, students, hadiths } = initialData;

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <HeroSection
        scholarName={name}
        scholarTitle={grade ? `${grade}` : "Islamic Scholar"}
      />
      
      {/* Wikipedia Summary */}
      <WikipediaSummary 
          scholarName={name} 
          deathYear={biography?.death?.date_gregorian || biography?.death?.date_hijri}
          scholarGrade={grade}
      />

      {/* Biography Section */}
      <section id="biography" className="py-12 md:py-24 bg-gradient-to-b from-background to-accent/5">
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
                <h2 className="text-4xl font-bold">Biography</h2>
                <p className="text-muted-foreground text-lg">{full_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Birth Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    Birth
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {biography.birth.date_display && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {biography.birth.date_display.join(" / ")}
                      </p>
                    </div>
                  )}
                  {biography.birth.place && (
                    <div>
                      <p className="text-sm text-muted-foreground">Place</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {biography.birth.place}
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
                    Death
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {biography.death.date_display && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {biography.death.date_display.join(" / ")}
                      </p>
                    </div>
                  )}
                  {biography.death.place && (
                    <div>
                      <p className="text-sm text-muted-foreground">Place</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {biography.death.place}
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
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Teachers</span>
                    <Badge variant="outline">{teachers.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Students</span>
                    <Badge variant="outline">{students.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hadiths</span>
                    <Badge variant="outline">{hadiths.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            {biography.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    Historical Significance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {biography.tags.map((tag: string, index: number) => (
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
                <h2 className="text-4xl font-bold">Family Lineage</h2>
                <p className="text-muted-foreground">
                  Genealogical relationships and family connections
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
                <h2 className="text-4xl font-bold">Academic Network</h2>
                <p className="text-muted-foreground">
                  Interactive visualization of teachers and students
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
                      Teachers ({teachers.length})
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                      {Array.from(new Map(teachers.map((t: any) => [t.id, t])).values()).map((t: any) => (
                        <div 
                          key={t.id} 
                          onClick={() => router.push(`/scholar/${t.id}`)}
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
                      ))}
                      {teachers.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No teachers recorded.</p>}
                   </div>
                 </CardContent>
               </Card>

               {/* Students List */}
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      Students ({students.length})
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                      {Array.from(new Map(students.map((s: any) => [s.id, s])).values()).map((s: any) => (
                        <div 
                          key={s.id} 
                          onClick={() => router.push(`/scholar/${s.id}`)}
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
                      ))}
                      {students.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No students recorded.</p>}
                   </div>
                 </CardContent>
               </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-12 md:py-24 bg-gradient-to-b from-background to-accent/5">
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
                <h2 className="text-4xl font-bold">Historical Timeline</h2>
                <p className="text-muted-foreground">Life events and milestones</p>
              </div>
            </div>

            <TimelineChart biography={biography} name={name} />
          </motion.div>
        </div>
      </section>

      {/* Hadiths Section */}
      <section id="hadiths" className="py-12 md:py-24 bg-gradient-to-b from-background to-accent/5">
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
                <h2 className="text-4xl font-bold">Narrations</h2>
                <p className="text-muted-foreground">
                  Authentic hadiths reported by or attributing to this scholar
                </p>
              </div>
            </div>

            <HadithList hadiths={hadiths} />
          </motion.div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-12 md:py-24 bg-gradient-to-b from-background to-accent/5">
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
                <h2 className="text-4xl font-bold">Analytics & Insights</h2>
                <p className="text-muted-foreground">Statistical overview and data visualization</p>
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
              Sahih Explorer
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Preserving and exploring the chains of Islamic knowledge
            </p>
            <Separator className="my-6" />
            <p className="text-xs text-muted-foreground">
              Data sourced from authentic Islamic scholarly databases • Version 2.0
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
