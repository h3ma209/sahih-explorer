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
  children?: Person[];
}

interface FamilyTreeGraphProps {
  scholar: {
    id: string;
    name: string;
    grade: string;
  };
  parents: Person[];
  spouses: Person[];
  children: Person[];
  siblings: Person[];
}

export default function FamilyTreeGraph({
  scholar,
  parents,
  spouses,
  children,
  siblings,
}: FamilyTreeGraphProps) {
  const t = useTranslations('Family');
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

    // Recursive helper for descendants
    const mapDescendant = (p: Person): any => ({
        name: wrapText(p.name),
        originalName: p.name,
        id: p.id,
        value: t('descendant'),
        itemStyle: { color: "#10b981", borderColor: "#10b981" },
        label: { color: isDark ? "#eee" : "#333", position: "bottom" },
        children: p.children?.map(mapDescendant) || []
    });
    
    const childrenNodes = children.map(mapDescendant);

    const spousesNodes = spouses.map(s => ({
        name: wrapText(s.name),
        originalName: s.name,
        id: s.id,
        value: t('spouse'),
        itemStyle: { color: "#e11d48", borderColor: "#e11d48" },
        label: { color: isDark ? "#eee" : "#333", position: "right" }
    }));

    const siblingsNodes = siblings.map(s => ({
        name: wrapText(s.name),
        originalName: s.name,
        id: s.id,
        value: t('sibling'),
        itemStyle: { color: "#a855f7", borderColor: "#a855f7" },
        label: { color: isDark ? "#eee" : "#333", position: "right" }
    }));

    // Construct the central scholar node with branches
    const scholarNode = {
        name: wrapText(scholar.name),
        originalName: scholar.name,
        symbolSize: 20,
        itemStyle: { color: "#f59e0b", borderColor: "#f59e0b", borderWidth: 2 },
        label: { 
            fontSize: 14, 
            fontWeight: "bold",
            color: isDark ? "#fff" : "#000",
            position: "top"
        },
        children: [
            ...(spousesNodes.length ? [{
                name: t('spouses'),
                collapsed: false,
                itemStyle: { opacity: 0 }, // Invisible grouper
                label: { show: false },
                children: spousesNodes
            }] : []),
            ...(childrenNodes.length ? [{
                name: t('children'),
                collapsed: false,
                itemStyle: { opacity: 0 },
                label: { show: false },
                children: childrenNodes
            }] : []),
            ...(siblingsNodes.length ? [{
                name: t('siblings'),
                collapsed: false,
                itemStyle: { opacity: 0 },
                label: { show: false },
                children: siblingsNodes
            }] : [])
        ]
    };

    // Construct Parents (Ancestors)
    // If multiple parents, grouping them
    let rootData;
    if (parents.length > 0) {
        const mainParent = parents[0];
        rootData = {
            name: wrapText(mainParent.name),
            originalName: mainParent.name,
            id: mainParent.id,
            value: t('parent'),
            symbolSize: 15,
            itemStyle: { color: "#3b82f6", borderColor: "#3b82f6" },
            label: { color: isDark ? "#eee" : "#333", position: "top" },
            children: [scholarNode]
        };
    } else {
        rootData = scholarNode;
    }

    return {
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        formatter: (params: any) => {
            return params.data.originalName || params.name.replace(/\n/g, " ");
        }
      },
      legend: { show: false }, // Disable native legend
      series: [
        {
          type: "tree",
          data: [rootData],
          top: "5%", 
          left: "7%",
          bottom: "5%",
          right: "7%",
          symbolSize: 10,
          edgeShape: "curve",
          edgeForkPosition: "63%",
          initialTreeDepth: 3,
          orient: "TB",
          roam: true, // Enable Zoom & Pan
          
          label: {
            position: "left",
            verticalAlign: "middle",
            align: "right",
            fontSize: 12,
          },
          leaves: {
            label: {
              position: "bottom",
              verticalAlign: "middle",
              align: "center",
            },
          },
          emphasis: {
            focus: "descendant",
          },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    };
  }, [scholar, parents, spouses, children, siblings, theme, t]);

  const onChartClick = (params: any) => {
    if (params.dataType === 'node' && params.data.id && params.data.id !== scholar.id) {
       // Navigate to the scholar's page with locale
       router.push(`/${locale}/scholar/${params.data.id}`);
    }
  };

  const legendItems = [
    { label: t('scholar'), color: "bg-amber-500", desc: t('centralFigure') },
    { label: t('parents'), color: "bg-blue-500", desc: t('ancestors') },
    { label: t('spouses'), color: "bg-rose-500", desc: t('partners') },
    { label: t('siblings'), color: "bg-purple-500", desc: t('siblingsDesc') },
    { label: t('descendants'), color: "bg-emerald-500", desc: t('descendantsDesc') },
  ];

  return (
    <Card className="w-full h-[500px] md:h-[600px] overflow-hidden bg-card/50 border-border relative">
       {/* Custom Legend Overlay */}
       <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">{t('key')}</h4>
          <div className="space-y-2">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${item.color}`} />
                <div className="flex flex-col">
                   <span className="text-xs font-medium leading-none">{item.label}</span>
                   <span className="text-[10px] text-muted-foreground scale-90 origin-left">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
       </div>

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
