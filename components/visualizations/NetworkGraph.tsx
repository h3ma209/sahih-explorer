"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { useScholarLoader } from "@/components/providers/ScholarLoaderProvider";

interface Person {
  id: string;
  name: string;
  grade?: string;
}

interface NetworkGraphProps {
  scholar: {
    id: string;
    name: string;
    grade: string;
  };
  teachers: Person[];
  students: Person[];
}

export default function NetworkGraph({ scholar, teachers, students }: NetworkGraphProps) {
  const t = useTranslations('Network');
  const { theme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const { simulateLoading } = useScholarLoader();

  // Helper to wrap text
  const wrapText = (str: string, maxLen: number = 15) => {
    if (!str) return "";
    const words = str.split(" ");
    let currentLine = "";
    const lines = [];
    
    words.forEach((word) => {
      if ((currentLine + word).length > maxLen) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    });
    lines.push(currentLine.trim());
    return lines.join("\n");
  };

  const options = useMemo(() => {
    const isDark = theme === "dark";

    const categories = [
        { name: t('scholar'), itemStyle: { color: "#f59e0b" } },
        { name: t('teacher'), itemStyle: { color: "#3b82f6" } },
        { name: t('student'), itemStyle: { color: "#10b981" } },
    ];

    const nodes: any[] = [];
    const links: any[] = [];

    const addedIds = new Set<string>();

    // Main Scholar
    nodes.push({
        id: scholar.id,
        name: wrapText(scholar.name),
        originalName: scholar.name,
        category: 0,
        symbolSize: 50,
        value: 20,
        fixed: true,
        x: 400, // Center of 800px width
        y: 400, // Center of 800px height
        label: {
            show: true,
            position: "top",
            fontSize: 14,
            fontWeight: "bold",
            color: isDark ? "#fff" : "#000",
            formatter: "{b}",
            overflow: "truncate",
            width: 100
        }
    });
    addedIds.add(scholar.id);

    // Teachers
    teachers.slice(0, 30).forEach((t) => {
        if (!addedIds.has(t.id)) {
            nodes.push({
                id: t.id,
                name: wrapText(t.name),
                originalName: t.name,
                category: 1,
                symbolSize: 20,
                value: 10,
                label: { 
                    show: teachers.length < 20, 
                    position: "right",
                    color: isDark ? "#ccc" : "#333",
                    overflow: "truncate",
                    width: 80
                }
            });
            addedIds.add(t.id);
        }
        links.push({
            source: t.id,
            target: scholar.id,
            lineStyle: { color: "#3b82f6", curveness: 0.1 }
        });
    });

    // Students
    students.slice(0, 50).forEach((s) => {
        if (!addedIds.has(s.id)) {
            nodes.push({
                id: s.id,
                name: wrapText(s.name),
                originalName: s.name,
                category: 2,
                symbolSize: 15,
                value: 5,
                label: { show: false } 
            });
            addedIds.add(s.id);
        }
        links.push({
            source: scholar.id,
            target: s.id,
            lineStyle: { color: "#10b981", curveness: 0.1 }
        });
    });

    return {
      title: {
         text: t('title'),
         textStyle: { color: isDark ? '#fff' : '#000', fontSize: 16, fontWeight: 'bold', fontFamily: 'Inter' },
         top: 20,
         left: 20
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark ? '#475569' : '#e2e8f0',
        textStyle: { color: isDark ? '#f8fafc' : '#0f172a' },
        padding: [10, 15],
        borderRadius: 8,
        backdropFilter: 'blur(4px)',
        formatter: (params: any) => {
            if (params.dataType === 'node') {
                return `<div class="font-bold">${params.data.originalName || params.name}</div>
                        ${params.data.category === 0 ? '<div class="text-xs text-amber-500 mt-1">Scholar</div>' : ''}
                        ${params.data.category === 1 ? '<div class="text-xs text-blue-500 mt-1">Teacher</div>' : ''}
                        ${params.data.category === 2 ? '<div class="text-xs text-emerald-500 mt-1">Student</div>' : ''}`;
            }
            return '';
        }
      },
      legend: [
        {
          data: categories.map(a => a.name),
          textStyle: { color: isDark ? "#ccc" : "#333" },
          bottom: 20,
          itemGap: 20
        }
      ],
      series: [
        {
          type: "graph",
          layout: "force",
          data: nodes,
          links: links,
          categories: categories,
          roam: true,
          label: {
            show: true,
            position: "right",
            formatter: "{b}",
            color: isDark ? "#e2e8f0" : "#1e293b"
          },
          force: {
            repulsion: 800,
            gravity: 0.1,
            edgeLength: [80, 200],
            friction: 0.6
          },
          emphasis: {
            focus: "adjacency",
            scale: true,
            itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0,0,0,0.3)'
            },
            lineStyle: { width: 3, opacity: 0.8 }
          },
          lineStyle: {
            color: 'source',
            curveness: 0.2,
            opacity: 0.4
          },
          itemStyle: {
            borderColor: isDark ? '#1e293b' : '#fff',
            borderWidth: 2,
            shadowBlur: 5,
            shadowColor: 'rgba(0,0,0,0.1)'
          }
        }
      ]
    };
  }, [scholar, teachers, students, theme, t]);

  const onChartClick = (params: any) => {
    if (params.dataType === 'node' && params.data.id && params.data.id !== scholar.id) {
       // Navigate to the scholar's page with locale
       simulateLoading(() => {
         router.push(`/${locale}/scholar/${params.data.id}`);
       });
    }
  };

  return (
    <Card className="w-full h-[500px] md:h-[800px] overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-border p-4 shadow-sm relative group">
       <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
       <ReactECharts 
         option={options} 
         style={{ height: "100%", width: "100%" }}
         opts={{ renderer: 'canvas' }}
         onEvents={{
            click: onChartClick
         }}
       />
    </Card>
  );
}
