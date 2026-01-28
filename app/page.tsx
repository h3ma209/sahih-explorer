"use client";

import { useEffect, useState } from "react";
import InteractiveFamilyTree from "@/components/InteractiveFamilyTree";
import HadithFeed from "@/components/HadithFeed";
import BiographyCard from "@/components/BiographyCard";
import { BookOpen, Users, Scroll, ChevronDown, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full"
        />
        <p className="mt-6 text-amber-500 font-medium animate-pulse">Loading Sacred Archives...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full glass z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-gold">
                Sahih Explorer
              </h1>
              <p className="text-xs text-slate-500">Hadith Narrator Database</p>
            </div>
          </motion.div>
          
          <nav className="hidden md:flex gap-6">
            <button 
              onClick={() => scrollToSection("biography")}
              className="text-sm text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Biography
            </button>
            <button 
              onClick={() => scrollToSection("family")}
              className="text-sm text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Family Tree
            </button>
            <button 
              onClick={() => scrollToSection("hadiths")}
              className="text-sm text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2"
            >
              <Scroll className="w-4 h-4" />
              Narrations
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10 max-w-4xl"
        >
          <div className="inline-block mb-6 px-4 py-2 glass rounded-full">
            <span className="text-amber-500 text-sm font-medium">Islamic Scholar Database</span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gradient-gold">
              {data.scholar.name.split('(')[0].trim()}
            </span>
          </h2>
          
          <p className="text-xl text-slate-400 mb-4 max-w-2xl mx-auto leading-relaxed">
            Explore the life, family connections, and authentic narrations of one of Islam's most respected companions
          </p>

          <div className="flex gap-4 justify-center mt-12 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection("biography")}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl font-semibold text-white shadow-lg glow-gold transition-all"
            >
              View Biography
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection("family")}
              className="px-8 py-4 glass hover:border-amber-500/50 rounded-xl font-semibold text-slate-200 transition-all"
            >
              Family Tree
            </motion.button>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-20"
          >
            <ChevronDown className="w-8 h-8 text-amber-500/50 mx-auto" />
          </motion.div>
        </motion.div>
      </section>

      {/* Biography Section */}
      <section id="biography" className="min-h-screen py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <User className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500 text-sm font-medium">Biography</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-100 mb-4">Life & Legacy</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Comprehensive biographical information and scholarly contributions
            </p>
          </motion.div>
          
          <BiographyCard 
            name={data.scholar.name}
            fullName={data.scholar.full_name}
            grade={data.scholar.grade}
            biography={data.scholar.biography}
            teachers={data.scholar.teachers}
            students={data.scholar.students}
          />
        </div>
      </section>

      {/* Family Tree Section */}
      <section id="family" className="min-h-screen py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <Users className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500 text-sm font-medium">Genealogy</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-100 mb-4">Family Connections</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Explore the lineage and family relationships that shaped this scholar's life
            </p>
          </motion.div>
          
          <div className="glass rounded-3xl p-8 md:p-12 min-h-[800px] overflow-auto shadow-2xl shadow-black/50 relative">
            <InteractiveFamilyTree data={data.scholar} />
          </div>
        </div>
      </section>

      {/* Hadiths Section */}
      <section id="hadiths" className="min-h-screen py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <Scroll className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500 text-sm font-medium">Authentic Narrations</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-100 mb-4">Hadith Collection</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {data.hadiths.length} authentic reports transmitted through this narrator's chain
            </p>
          </motion.div>

          <HadithFeed hadiths={data.hadiths} />
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/5 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="text-gradient-gold font-bold text-lg">Sahih Explorer</span>
          </div>
          <p className="text-slate-500 text-sm">
            Preserving and exploring the chains of Islamic knowledge
          </p>
          <div className="mt-6 text-xs text-slate-600">
            Dataset: {Object.keys(data).length} collections • Version 1.0
          </div>
        </div>
      </footer>
    </main>
  );
}

