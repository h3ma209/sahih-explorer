"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

interface BiographyData {
  birth: {
    date_hijri: string;
    date_gregorian: string;
    date_display: string[] | null;
    place: string;
    place_display?: Record<string, string>;
  };
  death: {
    date_hijri: string;
    date_gregorian: string;
    date_display: string[] | null;
    place: string;
    place_display?: Record<string, string>;
    reason: string;
  };
  places_of_stay: string[];
  places_of_stay_display?: Record<string, string>[];
}

interface TimelineChartProps {
  biography: BiographyData;
  name: string;
}

export default function TimelineChart({ biography, name }: TimelineChartProps) {
  const t = useTranslations('Timeline');
  const locale = useLocale();

  const getPlace = (place: string, display?: Record<string, string>) => {
    if (display && display[locale]) return display[locale];
    return place;
  };

  const timelineData = useMemo(() => {
    const data = [];

    // Birth event
    if (biography.birth.place) {
      data.push({
        event: t('birth'),
        year: biography.birth.date_hijri || t('unknown'),
        location: getPlace(biography.birth.place, biography.birth.place_display),
        value: 1,
        color: "#10b981",
      });
    }

    // Major life events (placeholder - would come from data)
    data.push({
      event: t('earlyEducation'),
      year: t('youth'),
      location: (biography.places_of_stay_display && biography.places_of_stay_display[0] && biography.places_of_stay_display[0][locale]) 
                || biography.places_of_stay[0] 
                || t('unknown'),
      value: 2,
      color: "#3b82f6",
    });

    data.push({
      event: t('scholarlyWork'),
      year: t('adulthood'),
      location: (biography.places_of_stay_display && biography.places_of_stay_display[1] && biography.places_of_stay_display[1][locale])
                || biography.places_of_stay[1] 
                || getPlace(biography.birth.place, biography.birth.place_display),
      value: 3,
      color: "#f59e0b",
    });

    // Death event
    if (biography.death.place) {
      data.push({
        event: t('death'),
        year: biography.death.date_hijri || t('unknown'),
        location: getPlace(biography.death.place, biography.death.place_display),
        value: 1,
        color: "#ef4444",
      });
    }

    return data;
  }, [biography, t, locale]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">{data.event}</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{data.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{data.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('lifeTimeline')}</CardTitle>
        <CardDescription>{t('majorEvents', { name: name })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="event"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {timelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h4 className="font-semibold text-sm">{t('birth')}</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {biography.birth.date_display?.join(" / ") || t('dateUnknown')}
            </p>
            <p className="text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 inline mr-1" />
              {getPlace(biography.birth.place, biography.birth.place_display) || t('locationUnknown')}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <h4 className="font-semibold text-sm">{t('death')}</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {biography.death.date_display?.join(" / ") || t('dateUnknown')}
            </p>
            <p className="text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 inline mr-1" />
              {getPlace(biography.death.place, biography.death.place_display) || t('locationUnknown')}
            </p>
            {biography.death.reason && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {biography.death.reason}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
