"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";

interface Person {
  id: string;
  name: string;
  grade?: string;
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
  const { theme } = useTheme();

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

    // Transform Data into a Hierarchy
    // Strategy: Virtual Root -> Parents -> Scholar -> [Spouses, Siblings, Children]
    // To make it look like a tree, we anchor everything around the scholar
    
    const childrenNodes = children.map(c => ({
        name: wrapText(c.name),
        originalName: c.name,
        value: "Child",
        itemStyle: { color: "#10b981", borderColor: "#10b981" },
        label: { color: isDark ? "#eee" : "#333", position: "bottom" }
    }));

    const spousesNodes = spouses.map(s => ({
        name: wrapText(s.name),
        originalName: s.name,
        value: "Spouse",
        itemStyle: { color: "#e11d48", borderColor: "#e11d48" },
        label: { color: isDark ? "#eee" : "#333", position: "right" }
    }));

    const siblingsNodes = siblings.map(s => ({
        name: wrapText(s.name),
        originalName: s.name,
        value: "Sibling",
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
                name: "Spouses",
                collapsed: false,
                itemStyle: { opacity: 0 }, // Invisible grouper
                label: { show: false },
                children: spousesNodes
            }] : []),
            ...(childrenNodes.length ? [{
                name: "Children",
                collapsed: false,
                itemStyle: { opacity: 0 },
                label: { show: false },
                children: childrenNodes
            }] : []),
            ...(siblingsNodes.length ? [{
                name: "Siblings",
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
            value: "Parent",
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
          orient: "TB", // Top to Bottom Orientation
          
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
  }, [scholar, parents, spouses, children, siblings, theme]);

  return (
    <Card className="w-full h-[600px] overflow-hidden bg-card/50 border-border p-4">
       <ReactECharts 
         option={options} 
         style={{ height: "100%", width: "100%" }}
         opts={{ renderer: 'canvas' }}
       />
    </Card>
  );
}
