"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useScholarLoader } from "@/components/providers/ScholarLoaderProvider";
import Navigation from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  BookOpen,
  Network,
  Search,
  TrendingUp,
  Award,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Stats {
  totalScholars: number;
  totalHadiths: number;
  hadithsByBook: { [key: string]: number };
}

export default function Home() {
  const locale = useLocale();
  const router = useRouter();
  const { simulateLoading } = useScholarLoader();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load pre-calculated statistics
    fetch("/data/stats.json")
      .then(res => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading stats:", error);
        setLoading(false);
      });
  }, []);

  const hadithCollections = [
    { name: "Sahih Bukhari", icon: "📖", color: "from-emerald-500 to-emerald-700" },
    { name: "Sahih Muslim", icon: "📗", color: "from-blue-500 to-blue-700" },
    { name: "Sunan an-Nasa'i", icon: "📘", color: "from-purple-500 to-purple-700" },
    { name: "Sunan Abi Da'ud", icon: "📙", color: "from-amber-500 to-amber-700" },
    { name: "Sunan Ibn Majah", icon: "📕", color: "from-rose-500 to-rose-700" },
    { name: "Jami' al-Tirmidhi", icon: "📔", color: "from-cyan-500 to-cyan-700" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 space-y-8">
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-background via-accent/5 to-background" />
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.08, 0.12, 0.08],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 px-4 py-2 text-sm" variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Explore the Golden Chain of Islamic Scholarship
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
              Sahih Explorer
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the interconnected world of Islamic scholars and authentic hadith narrations
            </p>

            {stats && (
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <div className="flex items-center gap-2 px-6 py-3 bg-card/50 rounded-full border border-border">
                  <Users className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-2xl">{stats.totalScholars.toLocaleString()}</span>
                  <span className="text-muted-foreground">Scholars</span>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 bg-card/50 rounded-full border border-border">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-2xl">{stats.totalHadiths.toLocaleString()}</span>
                  <span className="text-muted-foreground">Hadiths</span>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 bg-card/50 rounded-full border border-border">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-2xl">6</span>
                  <span className="text-muted-foreground">Collections</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="gap-2 bg-linear-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
                onClick={() => {
                  const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    metaKey: true,
                    bubbles: true
                  });
                  document.dispatchEvent(event);
                }}
              >
                <Search className="w-5 h-5" />
                Search Scholars & Hadiths
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  simulateLoading(() => {
                    router.push(`/${locale}/scholar/1`);
                  });
                }}
              >
                <Award className="w-5 h-5" />
                View Prophet Muhammad ﷺ
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hadith Collections Section */}
      <section className="py-24 ">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Hadith Collections</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore authentic narrations from the six major hadith collections
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {hadithCollections.map((collection, index) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-amber-500/50">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`text-4xl p-3 rounded-xl bg-linear-to-br ${collection.color} bg-opacity-10`}>
                        {collection.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                          {collection.name}
                        </CardTitle>
                        {stats && (
                          <Badge variant="secondary" className="mt-1">
                            {(stats.hadithsByBook[collection.name] || 0).toLocaleString()} hadiths
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Advanced tools to explore Islamic scholarship
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <Network className="w-8 h-8 text-blue-500" />
                </div>
                <CardTitle>Scholar Networks</CardTitle>
                <CardDescription className="mt-2">
                  Visualize teacher-student relationships and academic lineages
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-amber-500" />
                </div>
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription className="mt-2">
                  Search through 24,000+ scholars and 34,000+ hadiths instantly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
                <CardTitle>Narrator Grades</CardTitle>
                <CardDescription className="mt-2">
                  View reliability ratings and biographical details for each narrator
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-2 bg-linear-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
              Sahih Explorer
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Preserving and exploring the golden chain of Islamic scholarship
            </p>
            <p className="text-xs text-muted-foreground">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
