"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import NetworkGraph from "@/components/visualizations/NetworkGraph";
import FamilyTreeGraph from "@/components/visualizations/FamilyTreeGraph";
import TimelineChart from "@/components/visualizations/TimelineChart";
import AnalyticsDashboard from "@/components/visualizations/AnalyticsDashboard";
import HadithList from "@/components/sections/HadithList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function ScholarPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    setError(false);
    
    // Fetch individual scholar JSON
    fetch(`/data/scholars/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Scholar not found");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 space-y-8">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full rounded-3xl" />
            <Skeleton className="h-96 w-full rounded-3xl col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Scholar Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            This scholar's detailed profile hasn't been generated yet or doesn't exist.
            The production build currently includes the top 200 influential scholars.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/")} variant="default">
              Go Home
            </Button>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // The rest of the component is identical to page.tsx but using the fetched data
  // I will refactor this to be shared later, but for now copying ensures stability
  const { id: scholarId, name, full_name, grade, biography, parents, spouses, siblings, children, teachers, students, hadiths } = data;

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <HeroSection
        scholarName={name}
        scholarTitle={grade ? `${grade}` : "Islamic Scholar"}
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
      <section id="family" className="py-24 bg-gradient-to-b from-accent/5 to-background">
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
                id: scholarId,
                name: name,
                grade: grade,
              }}
              teachers={teachers}
              students={students}
            />
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

            <TimelineChart biography={biography} name={name} />
          </motion.div>
        </div>
      </section>

      {/* Hadiths Section */}
      <section id="hadiths" className="py-24 bg-gradient-to-b from-background to-accent/5">
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
