"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, BookOpen } from "lucide-react";

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

// Custom Node Component
function ScholarNode({ data }: any) {
  const isMain = data.type === "main";
  const isTeacher = data.type === "teacher";

  return (
    <Card
      className={`px-4 py-3 min-w-[200px] transition-all hover:shadow-lg ${
        isMain
          ? "bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/50 shadow-amber-500/20"
          : isTeacher
          ? "bg-blue-500/10 border-blue-500/30"
          : "bg-emerald-500/10 border-emerald-500/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            isMain
              ? "bg-amber-500/20"
              : isTeacher
              ? "bg-blue-500/20"
              : "bg-emerald-500/20"
          }`}
        >
          {isMain ? (
            <BookOpen className="w-4 h-4 text-amber-500" />
          ) : isTeacher ? (
            <GraduationCap className="w-4 h-4 text-blue-500" />
          ) : (
            <Users className="w-4 h-4 text-emerald-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{data.label}</h3>
          {data.grade && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{data.grade}</p>
          )}
          <Badge
            variant="outline"
            className={`mt-2 text-xs ${
              isMain
                ? "border-amber-500/50 text-amber-500"
                : isTeacher
                ? "border-blue-500/50 text-blue-500"
                : "border-emerald-500/50 text-emerald-500"
            }`}
          >
            {isMain ? "Scholar" : isTeacher ? "Teacher" : "Student"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

const nodeTypes = {
  scholarNode: ScholarNode,
};

export default function NetworkGraph({ scholar, teachers, students }: NetworkGraphProps) {
  // Create nodes
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];

    // Main scholar node (center)
    nodes.push({
      id: scholar.id,
      type: "scholarNode",
      position: { x: 400, y: 300 },
      data: {
        label: scholar.name,
        grade: scholar.grade,
        type: "main",
      },
    });

    // Teacher nodes (top)
    teachers.slice(0, 8).forEach((teacher, index) => {
      const angle = (index / 8) * Math.PI - Math.PI / 2;
      const radius = 250;
      nodes.push({
        id: teacher.id,
        type: "scholarNode",
        position: {
          x: 400 + Math.cos(angle) * radius,
          y: 100 + Math.sin(angle) * radius,
        },
        data: {
          label: teacher.name,
          grade: teacher.grade,
          type: "teacher",
        },
      });
    });

    // Student nodes (bottom)
    students.slice(0, 12).forEach((student, index) => {
      const angle = (index / 12) * Math.PI + Math.PI / 2;
      const radius = 280;
      nodes.push({
        id: student.id,
        type: "scholarNode",
        position: {
          x: 400 + Math.cos(angle) * radius,
          y: 500 + Math.sin(angle) * radius,
        },
        data: {
          label: student.name,
          grade: student.grade,
          type: "student",
        },
      });
    });

    return nodes;
  }, [scholar, teachers, students]);

  // Create edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    // Teacher edges
    teachers.slice(0, 8).forEach((teacher) => {
      edges.push({
        id: `${teacher.id}-${scholar.id}`,
        source: teacher.id,
        target: scholar.id,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3b82f6",
        },
      });
    });

    // Student edges
    students.slice(0, 12).forEach((student) => {
      edges.push({
        id: `${scholar.id}-${student.id}`,
        source: scholar.id,
        target: student.id,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#10b981", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
        },
      });
    });

    return edges;
  }, [scholar, teachers, students]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[800px] rounded-xl overflow-hidden border border-border bg-card/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background className="bg-background" gap={20} size={1} />
        <Controls className="bg-card border-border" />
        <MiniMap
          className="bg-card border-border"
          nodeColor={(node) => {
            if (node.data.type === "main") return "#f59e0b";
            if (node.data.type === "teacher") return "#3b82f6";
            return "#10b981";
          }}
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
        <h4 className="font-semibold text-sm mb-3">Network Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>Main Scholar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Teachers ({teachers.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Students ({students.length})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
