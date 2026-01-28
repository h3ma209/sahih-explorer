"use client";

import { motion } from "framer-motion";
import { User, Users, Heart } from "lucide-react";

interface PersonProps {
  name: string;
  role: string;
  isMain?: boolean;
  relationLabel?: string;
}

export function PersonCard({ name, role, isMain = false, relationLabel }: PersonProps) {
  // Extract clean name (remove Arabic and extra info)
  const cleanName = name.split('(')[0].trim();
  const shortName = cleanName.length > 30 ? cleanName.substring(0, 30) + '...' : cleanName;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative group cursor-pointer
        ${isMain 
          ? "w-72 h-40" 
          : "w-56 h-32"
        }
      `}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isMain ? 'glow-gold-strong opacity-100' : 'glow-gold opacity-0 group-hover:opacity-100'}`} />
      
      {/* Card content */}
      <div className={`
        relative h-full flex flex-col items-center justify-center p-6 rounded-2xl
        border transition-all duration-300
        ${isMain 
          ? "glass border-amber-500/50 bg-gradient-to-br from-amber-900/30 to-amber-950/20" 
          : "glass border-slate-700/50 hover:border-amber-600/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40"
        }
      `}>
        
        {/* Icon */}
        <div className={`mb-3 p-3 rounded-full ${isMain ? 'bg-amber-500/20' : 'bg-slate-700/30'}`}>
          {isMain ? (
            <User className={`w-6 h-6 ${isMain ? 'text-amber-400' : 'text-slate-400'}`} />
          ) : relationLabel === 'Parent' ? (
            <Users className="w-5 h-5 text-slate-400" />
          ) : relationLabel === 'Spouse' ? (
            <Heart className="w-5 h-5 text-rose-400" />
          ) : (
            <User className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {/* Name */}
        <h3 className={`font-semibold text-center leading-tight ${isMain ? "text-xl text-amber-100" : "text-sm text-slate-100"}`}>
          {shortName}
        </h3>
        
        {/* Role badge */}
        {role && (
          <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${isMain ? "bg-amber-900/60 text-amber-300" : "bg-slate-900/60 text-slate-400"}`}>
            {role}
          </div>
        )}

        {/* Decorative corner accents */}
        <div className={`absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 rounded-tl ${isMain ? 'border-amber-500/50' : 'border-slate-600/30'}`} />
        <div className={`absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 rounded-br ${isMain ? 'border-amber-500/50' : 'border-slate-600/30'}`} />
      </div>

      {/* Relation label */}
      {relationLabel && !isMain && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900/80 rounded text-xs text-slate-500 whitespace-nowrap">
          {relationLabel}
        </div>
      )}
    </motion.div>
  );
}

export default function FamilyTreeVis({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="w-full min-h-[700px] flex flex-col items-center justify-center gap-20 py-16 px-4 relative">
      
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Parents Generation */}
      {data.parents && data.parents.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="flex gap-12 flex-wrap justify-center items-center relative z-10">
            {data.parents.map((p: any, idx: number) => (
              <PersonCard key={p.id} name={p.name} role={p.role} relationLabel="Parent" />
            ))}
          </div>
          
          {/* Connecting line to main person */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full h-16 w-0.5 bg-gradient-to-b from-amber-500/50 to-transparent" />
        </motion.div>
      )}

      {/* Main Person + Spouses */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10"
      >
        <div className="flex gap-8 items-center justify-center flex-wrap">
          {/* Spouses */}
          {data.spouses && data.spouses.length > 0 && (
            <div className="flex gap-6 flex-wrap justify-center items-center">
              {data.spouses.map((s: any, idx: number) => (
                <PersonCard key={s.id} name={s.name} role="Spouse" relationLabel="Spouse" />
              ))}
            </div>
          )}
          
          {/* Main Scholar - Centered and prominent */}
          <div className="relative">
            <PersonCard name={data.name} role="Scholar" isMain />
            
            {/* Decorative rings around main person */}
            <div className="absolute inset-0 -m-4 rounded-full border border-amber-500/20 animate-pulse" />
            <div className="absolute inset-0 -m-8 rounded-full border border-amber-500/10" />
          </div>
        </div>

        {/* Connecting line to children */}
        {data.children && data.children.length > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full h-16 w-0.5 bg-gradient-to-b from-amber-500/50 to-transparent" />
        )}
      </motion.div>

      {/* Children Generation */}
      {data.children && data.children.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 max-w-7xl">
            {data.children.map((c: any, idx: number) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
              >
                <PersonCard name={c.name} role="Child" relationLabel="Child" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats summary */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-8 text-center mt-8"
      >
        <div className="glass px-6 py-3 rounded-xl">
          <div className="text-2xl font-bold text-amber-400">{data.parents?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Parents</div>
        </div>
        <div className="glass px-6 py-3 rounded-xl">
          <div className="text-2xl font-bold text-rose-400">{data.spouses?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Spouses</div>
        </div>
        <div className="glass px-6 py-3 rounded-xl">
          <div className="text-2xl font-bold text-blue-400">{data.children?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Children</div>
        </div>
      </motion.div>
    </div>
  );
}

