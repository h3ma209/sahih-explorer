"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import NetworkGraph from "@/components/visualizations/NetworkGraph";
import TimelineChart from "@/components/visualizations/TimelineChart";
import AnalyticsDashboard from "@/components/visualizations/AnalyticsDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Network,
  Calendar,
  BarChart3,
  BookOpen,
  MapPin,
  Award,
  GraduationCap,
  Users,
} from "lucide-react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load data</p>
      </div>
    );
  }

  const { scholar, hadiths } = data;

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <HeroSection
        scholarName={scholar.name}
        scholarTitle={`${scholar.grade} - Companion of the Prophet ﷺ`}
      />

      {/* Biography Section */}
      <section id="biography" className="py-24 bg-gradient-to-b from-background to-accent/5">
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
                <p className="text-muted-foreground">Life and legacy</p>
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
                  {scholar.biography.birth.date_display && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {scholar.biography.birth.date_display.join(" / ")}
                      </p>
                    </div>
                  )}
                  {scholar.biography.birth.place && (
                    <div>
                      <p className="text-sm text-muted-foreground">Place</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {scholar.biography.birth.place}
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
                  {scholar.biography.death.date_display && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {scholar.biography.death.date_display.join(" / ")}
                      </p>
                    </div>
                  )}
                  {scholar.biography.death.place && (
                    <div>
                      <p className="text-sm text-muted-foreground">Place</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {scholar.biography.death.place}
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
                    <Badge variant="outline">{scholar.teachers.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Students</span>
                    <Badge variant="outline">{scholar.students.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hadiths</span>
                    <Badge variant="outline">{hadiths.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Areas of Expertise */}
            {scholar.biography.area_of_interest.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Areas of Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {scholar.biography.area_of_interest.map((area: string, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1.5">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historical Tags */}
            {scholar.biography.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    Historical Significance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {scholar.biography.tags.map((tag: string, index: number) => (
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

      {/* Network Section */}
      <section id="network" className="py-24">
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
                id: scholar.id,
                name: scholar.name,
                grade: scholar.grade,
              }}
              teachers={scholar.teachers}
              students={scholar.students}
            />

            {/* Academic Lineage Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                    Teachers ({scholar.teachers.length})
                  </CardTitle>
                  <CardDescription>Scholars who taught {scholar.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scholar.teachers.slice(0, 10).map((teacher: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                      >
                        <p className="font-medium text-sm">{teacher.name}</p>
                        {teacher.grade && (
                          <p className="text-xs text-muted-foreground mt-1">{teacher.grade}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Students ({scholar.students.length})
                  </CardTitle>
                  <CardDescription>Scholars who learned from {scholar.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scholar.students.slice(0, 10).map((student: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                      >
                        <p className="font-medium text-sm">{student.name}</p>
                        {student.grade && (
                          <p className="text-xs text-muted-foreground mt-1">{student.grade}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-24 bg-gradient-to-b from-background to-accent/5">
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

            <TimelineChart biography={scholar.biography} name={scholar.name} />
          </motion.div>
        </div>
      </section>

      {/* Hadiths Section */}
      <section id="hadiths" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">Hadith Collection</h2>
                <p className="text-muted-foreground">
                  {hadiths.length} authentic narrations
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {hadiths.slice(0, 5).map((hadith: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          {hadith.source} - {hadith.hadith_no}
                        </CardTitle>
                        <CardDescription>{hadith.chapter}</CardDescription>
                      </div>
                      <Badge variant="outline">{hadith.chapter_no}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {hadith.text_ar && (
                      <p className="text-right font-amiri text-lg mb-4 leading-loose">
                        {hadith.text_ar}
                      </p>
                    )}
                    {hadith.text_en && (
                      <>
                        <Separator className="my-4" />
                        <p className="text-muted-foreground leading-relaxed">{hadith.text_en}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-24 bg-gradient-to-b from-background to-accent/5">
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
              biography={scholar.biography}
              teachers={scholar.teachers}
              students={scholar.students}
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
