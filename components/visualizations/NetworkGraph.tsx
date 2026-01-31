"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";

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
         textStyle: { color: isDark ? '#fff' : '#000', fontSize: 14 },
         top: 10,
         left: 10
      },
      tooltip: {
        formatter: (params: any) => {
            if (params.dataType === 'node') {
                return params.data.originalName || params.name;
            }
            return '';
        }
      },
      legend: [
        {
          data: categories.map(a => a.name),
          textStyle: { color: isDark ? "#ccc" : "#333" },
          bottom: 10
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
            formatter: "{b}"
          },
          force: {
            repulsion: 400,      // Increase repulsion to separate nodes
            gravity: 0.05,       // Increase gravity slightly to pull them in
            edgeLength: [50, 150],
            friction: 0.6
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: { width: 4 }
          }
        }
      ]
    };
  }, [scholar, teachers, students, theme, t]);

  const onChartClick = (params: any) => {
    if (params.dataType === 'node' && params.data.id && params.data.id !== scholar.id) {
       // Navigate to the scholar's page with locale
       router.push(`/${locale}/scholar/${params.data.id}`);
    }
  };

  return (
    <Card className="w-full h-[500px] md:h-[800px] overflow-hidden bg-card/50 border-border p-4">
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
