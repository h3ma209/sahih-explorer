"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Search, 
  BookOpen, 
  Network, 
  Users, 
  TrendingUp,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Fuse from "fuse.js";

interface SearchResult {
  id: string;
  name: string;
  grade: string;
  death_year: string;
}

export default function LandingPage() {
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allScholars, setAllScholars] = useState<SearchResult[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchResult> | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load search index
  useEffect(() => {
    fetch("/data/search-index.json")
      .then((res) => res.json())
      .then((data) => {
        setAllScholars(data);
        const fuseInstance = new Fuse(data, {
          keys: ["name", "id"],
          threshold: 0.3,
        });
        setFuse(fuseInstance as unknown as Fuse<SearchResult>);
      })
      .catch((err) => console.error("Failed to load search index", err));
  }, []);

  // Perform search
  useEffect(() => {
    if (fuse && searchQuery.length > 0) {
      const results = fuse.search(searchQuery, { limit: 5 });
      setSearchResults(results.map((result) => result.item));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, fuse]);

  const handleSelectScholar = (id: string) => {
    router.push(`/${locale}/scholar/${id}`);
  };

  const features = [
    {
      icon: BookOpen,
      title: locale === 'ar' ? 'قاعدة بيانات شاملة' : locale === 'ckb' ? 'بنکەی زانیاری تەواو' : 'Comprehensive Database',
      description: locale === 'ar' ? '1,940+ عالم إسلامي مع سير ذاتية مفصلة' : locale === 'ckb' ? '1,940+ زانای موسڵمان لەگەڵ ژیاننامەی ورد' : '1,940+ Islamic scholars with detailed biographies',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: Network,
      title: locale === 'ar' ? 'الشبكات الأكاديمية' : locale === 'ckb' ? 'تۆڕە زانستییەکان' : 'Academic Networks',
      description: locale === 'ar' ? 'استكشف علاقات الأستاذ والطالب التفاعلية' : locale === 'ckb' ? 'پەیوەندییەکانی مامۆستا و قوتابی بگەڕێ' : 'Explore interactive teacher-student relationships',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: locale === 'ar' ? 'شجرة العائلة' : locale === 'ckb' ? 'ڕەگەزنامەی خێزانی' : 'Family Trees',
      description: locale === 'ar' ? 'تصور الروابط الأنساب والعائلية' : locale === 'ckb' ? 'پەیوەندییەکانی خێزانی و نەسڵ ببینە' : 'Visualize genealogical and family connections',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: locale === 'ar' ? 'سلاسل الأحاديث' : locale === 'ckb' ? 'زنجیرەی فەرموودەکان' : 'Hadith Chains',
      description: locale === 'ar' ? 'أحاديث موثقة مع سلاسل رواة كاملة' : locale === 'ckb' ? 'فەرموودە ڕاستەقینەکان لەگەڵ زنجیرەی تەواو' : 'Authenticated hadiths with complete narrator chains',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Globe,
      title: locale === 'ar' ? 'دعم متعدد اللغات' : locale === 'ckb' ? 'پشتگیری چەند زمانی' : 'Multi-language Support',
      description: locale === 'ar' ? 'الإنجليزية والعربية والكردية مع دعم RTL' : locale === 'ckb' ? 'ئینگلیزی، عەرەبی و کوردی لەگەڵ پشتگیری RTL' : 'English, Arabic, and Kurdish with RTL support',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Sparkles,
      title: locale === 'ar' ? 'واجهة حديثة' : locale === 'ckb' ? 'ڕووکاری نوێ' : 'Modern Interface',
      description: locale === 'ar' ? 'تصميم متميز مع الوضع المظلم والرسوم المتحركة' : locale === 'ckb' ? 'دیزاینی نوێ لەگەڵ دۆخی تاریک و جوڵە' : 'Premium design with dark mode and animations',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const stats = [
    { value: '1,940+', label: locale === 'ar' ? 'علماء' : locale === 'ckb' ? 'زانا' : 'Scholars' },
    { value: '10,000+', label: locale === 'ar' ? 'أحاديث' : locale === 'ckb' ? 'فەرموودە' : 'Hadiths' },
    { value: '3', label: locale === 'ar' ? 'لغات' : locale === 'ckb' ? 'زمان' : 'Languages' },
    { value: '100%', label: locale === 'ar' ? 'مجاني' : locale === 'ckb' ? 'بێبەرامبەر' : 'Free' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 px-4 py-2 text-sm" variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'استكشف التراث الإسلامي' : locale === 'ckb' ? 'میراتی ئیسلامی بگەڕێ' : 'Explore Islamic Heritage'}
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
              {locale === 'ar' ? 'مستكشف السند' : locale === 'ckb' ? 'گەڕانی سەحیح' : 'Sahih Explorer'}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              {locale === 'ar' 
                ? 'اكتشف حياة العلماء الإسلاميين وشبكاتهم الأكاديمية وسلاسل الأحاديث الموثقة'
                : locale === 'ckb'
                ? 'ژیانی زانایانی موسڵمان و تۆڕە زانستییەکان و زنجیرەی فەرموودە ڕاستەقینەکان بگەڕێ'
                : 'Discover the lives of Islamic scholars, their academic networks, and authenticated hadith chains'}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'ابحث عن عالم... (مثل: أبو هريرة)' : locale === 'ckb' ? 'گەڕان بۆ زانایەک... (وەک: ئەبووهورەیرە)' : 'Search for a scholar... (e.g., Abu Huraira)'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 text-lg rounded-2xl border-2 border-border bg-background/80 backdrop-blur-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 w-full bg-background/95 backdrop-blur-xl border-2 border-border rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {searchResults.map((scholar) => (
                  <button
                    key={scholar.id}
                    onClick={() => handleSelectScholar(scholar.id)}
                    className="w-full px-6 py-4 text-left hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0 flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-amber-600 transition-colors">
                        {scholar.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{scholar.grade}</p>
                    </div>
                    {scholar.death_year && (
                      <Badge variant="outline" className="text-xs">
                        d. {scholar.death_year} AH
                      </Badge>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
                <p className="text-3xl font-bold text-amber-600">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {locale === 'ar' ? 'الميزات الرئيسية' : locale === 'ckb' ? 'تایبەتمەندییە سەرەکییەکان' : 'Powerful Features'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {locale === 'ar' 
                ? 'كل ما تحتاجه لاستكشاف التراث الإسلامي'
                : locale === 'ckb'
                ? 'هەموو ئەوەی پێویستە بۆ گەڕانی میراتی ئیسلامی'
                : 'Everything you need to explore Islamic heritage'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-amber-500/50 group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-accent/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {locale === 'ar' ? 'كيف يعمل' : locale === 'ckb' ? 'چۆن کاردەکات' : 'How It Works'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {locale === 'ar' 
                ? 'ابدأ استكشافك في ثلاث خطوات بسيطة'
                : locale === 'ckb'
                ? 'گەڕانەکەت بە سێ هەنگاوی سادە دەست پێبکە'
                : 'Start exploring in three simple steps'}
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: locale === 'ar' ? 'ابحث عن عالم' : locale === 'ckb' ? 'گەڕان بۆ زانایەک' : 'Search for a Scholar',
                description: locale === 'ar' 
                  ? 'استخدم شريط البحث للعثور على أي عالم من قاعدة بياناتنا التي تضم أكثر من 1,940 عالمًا'
                  : locale === 'ckb'
                  ? 'شریتی گەڕان بەکاربهێنە بۆ دۆزینەوەی هەر زانایەک لە بنکەی زانیاریمان کە زیاتر لە 1,940 زانای تێدایە'
                  : 'Use the search bar to find any scholar from our database of 1,940+ scholars'
              },
              {
                step: '2',
                title: locale === 'ar' ? 'استكشف الملف الشخصي' : locale === 'ckb' ? 'پرۆفایل بگەڕێ' : 'Explore the Profile',
                description: locale === 'ar'
                  ? 'اطلع على السيرة الذاتية التفصيلية والشبكة الأكاديمية وشجرة العائلة والأحاديث'
                  : locale === 'ckb'
                  ? 'ژیاننامەی ورد و تۆڕی زانستی و ڕەگەزنامەی خێزانی و فەرموودەکان ببینە'
                  : 'View detailed biography, academic network, family tree, and hadiths'
              },
              {
                step: '3',
                title: locale === 'ar' ? 'اكتشف الروابط' : locale === 'ckb' ? 'پەیوەندییەکان بدۆزەوە' : 'Discover Connections',
                description: locale === 'ar'
                  ? 'انقر على العلماء المرتبطين لاستكشاف الشبكة الواسعة من المعرفة الإسلامية'
                  : locale === 'ckb'
                  ? 'کرتە لە زانایە پەیوەستەکان بکە بۆ گەڕانی تۆڕە فراوانەکەی زانیاری ئیسلامی'
                  : 'Click on connected scholars to explore the vast network of Islamic knowledge'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex items-start gap-6 p-6 rounded-2xl bg-background border-2 border-border hover:border-amber-500/50 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {locale === 'ar' ? 'ابدأ رحلتك اليوم' : locale === 'ckb' ? 'ئەمڕۆ گەشتەکەت دەست پێبکە' : 'Start Your Journey Today'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {locale === 'ar'
                ? 'مجاني تمامًا ومفتوح المصدر ومتاح للجميع'
                : locale === 'ckb'
                ? 'تەواو بێبەرامبەر و سەرچاوە کراوە و بۆ هەمووان بەردەستە'
                : 'Completely free, open-source, and available to everyone'}
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              onClick={() => {
                const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                searchInput?.focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {locale === 'ar' ? 'ابدأ الاستكشاف' : locale === 'ckb' ? 'گەڕان دەست پێبکە' : 'Start Exploring'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
