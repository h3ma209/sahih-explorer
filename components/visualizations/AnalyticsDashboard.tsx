"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";

interface AnalyticsDashboardProps {
  biography: {
    area_of_interest: string[];
    tags: string[];
  };
  teachers: any[];
  students: any[];
  hadiths: any[];
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsDashboard({
  biography,
  teachers,
  students,
  hadiths,
}: AnalyticsDashboardProps) {
  // Expertise Radar Data
  const expertiseData = biography.area_of_interest.slice(0, 6).map((area) => ({
    subject: area.length > 15 ? area.substring(0, 15) + "..." : area,
    value: Math.floor(Math.random() * 40) + 60, // Placeholder - would be real data
  }));

  // Network Distribution
  const networkData = [
    { name: "Teachers", value: teachers.length, color: "#3b82f6" },
    { name: "Students", value: students.length, color: "#10b981" },
  ];

  // Stats Cards
  const stats = [
    {
      title: "Total Hadiths",
      value: hadiths.length,
      icon: BookOpen,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Teachers",
      value: teachers.length,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Students",
      value: students.length,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Areas of Expertise",
      value: biography.area_of_interest.length,
      icon: BarChart3,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expertise Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Areas of Expertise</CardTitle>
            <CardDescription>Knowledge distribution across different fields</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={expertiseData}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis
                    dataKey="subject"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                  <Radar
                    name="Expertise"
                    dataKey="value"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Network Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Network</CardTitle>
            <CardDescription>Distribution of teachers and students</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={networkData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {networkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Significance</CardTitle>
          <CardDescription>Tags and affiliations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {biography.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-3 py-1.5 text-sm"
                style={{
                  borderColor: COLORS[index % COLORS.length] + "40",
                  color: COLORS[index % COLORS.length],
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
