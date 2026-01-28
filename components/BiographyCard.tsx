"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, BookOpen, Award, Users, GraduationCap } from "lucide-react";

interface BiographyData {
  birth: {
    date_hijri: string;
    date_gregorian: string;
    date_display: string[] | null;
    place: string;
  };
  death: {
    date_hijri: string;
    date_gregorian: string;
    date_display: string[] | null;
    place: string;
    reason: string;
  };
  places_of_stay: string[];
  area_of_interest: string[];
  tags: string[];
}

interface Person {
  id: string;
  name: string;
  grade?: string;
}

interface BiographyCardProps {
  name: string;
  fullName: string;
  grade: string;
  biography: BiographyData;
  teachers: Person[];
  students: Person[];
}

export default function BiographyCard({ name, fullName, grade, biography, teachers, students }: BiographyCardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 border border-amber-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <Award className="w-8 h-8 text-amber-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gradient-gold mb-2">{name}</h2>
            <p className="text-slate-400 text-sm mb-3">{fullName}</p>
            {grade && (
              <div className="inline-block px-4 py-2 glass rounded-lg">
                <span className="text-amber-500 text-sm font-medium">{grade}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Life Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          Life Timeline
        </h3>
        
        <div className="space-y-6">
          {/* Birth */}
          {biography.birth.place && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-200 mb-1">Birth</h4>
                <p className="text-slate-400 text-sm mb-2">{biography.birth.place}</p>
                {biography.birth.date_display && (
                  <div className="flex flex-wrap gap-2">
                    {biography.birth.date_display.map((date, i) => (
                      <span key={i} className="px-3 py-1 glass rounded-lg text-xs text-slate-300">
                        {date}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Places of Stay */}
          {biography.places_of_stay.length > 0 && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-200 mb-2">Places of Residence</h4>
                <div className="flex flex-wrap gap-2">
                  {biography.places_of_stay.map((place, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-lg text-sm">
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Death */}
          {biography.death.place && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-200 mb-1">Death</h4>
                <p className="text-slate-400 text-sm mb-2">
                  {biography.death.place}
                  {biography.death.reason && ` (${biography.death.reason})`}
                </p>
                {biography.death.date_display && (
                  <div className="flex flex-wrap gap-2">
                    {biography.death.date_display.map((date, i) => (
                      <span key={i} className="px-3 py-1 glass rounded-lg text-xs text-slate-300">
                        {date}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Areas of Expertise */}
      {biography.area_of_interest.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Areas of Expertise
          </h3>
          <div className="flex flex-wrap gap-3">
            {biography.area_of_interest.map((area, i) => (
              <span 
                key={i} 
                className="px-4 py-2 bg-gradient-to-r from-amber-900/40 to-amber-800/30 border border-amber-500/30 text-amber-300 rounded-xl text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Historical Tags */}
      {biography.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Historical Significance
          </h3>
          <div className="flex flex-wrap gap-2">
            {biography.tags.map((tag, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 glass hover:border-amber-500/50 transition-colors rounded-lg text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Academic Lineage */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Teachers */}
        {teachers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              Teachers ({teachers.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {teachers.slice(0, 10).map((teacher, i) => (
                <div key={i} className="p-3 glass rounded-lg hover:border-blue-500/30 transition-colors">
                  <p className="text-sm text-slate-300 font-medium">{teacher.name}</p>
                  {teacher.grade && (
                    <p className="text-xs text-slate-500 mt-1">{teacher.grade}</p>
                  )}
                </div>
              ))}
              {teachers.length > 10 && (
                <p className="text-xs text-slate-500 text-center pt-2">
                  +{teachers.length - 10} more teachers
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Students */}
        {students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Students ({students.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {students.slice(0, 10).map((student, i) => (
                <div key={i} className="p-3 glass rounded-lg hover:border-green-500/30 transition-colors">
                  <p className="text-sm text-slate-300 font-medium">{student.name}</p>
                  {student.grade && (
                    <p className="text-xs text-slate-500 mt-1">{student.grade}</p>
                  )}
                </div>
              ))}
              {students.length > 10 && (
                <p className="text-xs text-slate-500 text-center pt-2">
                  +{students.length - 10} more students
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
