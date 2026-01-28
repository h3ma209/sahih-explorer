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
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

import * as dagre from 'dagre';

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 350, height: 100 }); // Node width/height including spacing
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - 350 / 2,
        y: nodeWithPosition.y - 100 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function NetworkGraph({ scholar, teachers, students }: NetworkGraphProps) {
  // Create nodes and edges first
  // Create nodes and edges first
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = []; // ... (truncated for brevity in search, but logic is inside) ... to ...
    
    // Main scholar node (center)
    nodes.push({
      id: scholar.id,
      type: "scholarNode",
      position: { x: 0, y: 0 }, // Position handled by dagre
      data: {
        label: scholar.name,
        grade: scholar.grade,
        type: "main",
      },
    });

    // Teacher nodes (sources)
    teachers.slice(0, 15).forEach((teacher) => {
        nodes.push({
            id: teacher.id,
            type: "scholarNode",
            position: { x: 0, y: 0 },
            data: { label: teacher.name, grade: teacher.grade, type: "teacher" },
        });
        edges.push({
            id: `${teacher.id}-${scholar.id}`,
            source: teacher.id,
            target: scholar.id,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#3b82f6", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
        });
    });

    // Student nodes (targets)
    students.slice(0, 15).forEach((student) => {
        nodes.push({
            id: student.id,
            type: "scholarNode",
            position: { x: 0, y: 0 },
            data: { label: student.name, grade: student.grade, type: "student" },
        });
        edges.push({
            id: `${scholar.id}-${student.id}`,
            source: scholar.id,
            target: student.id,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#10b981", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
        });
    });

    return getLayoutedElements(nodes, edges);
  }, [scholar, teachers, students]);

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

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

      {/* Legend & Grading Criteria */}
      <div className="absolute top-4 right-4 bg-background/95 backdrop-blur border border-border p-4 rounded-lg shadow-lg max-w-xs z-10 text-xs">
        <h4 className="font-bold mb-2 text-sm">Legend</h4>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Main Scholar (Current)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>Teachers (Sources)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Students (Transmitters)</span>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <h4 className="font-bold mb-2 text-sm">Grading Criteria</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10">Thiqah</Badge>
             <span className="text-muted-foreground">Trustworthy & Precise</span>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10">Saduq</Badge>
             <span className="text-muted-foreground">Truthful, Good Memory</span>
          </div>
           <div className="flex items-center gap-2">
             <Badge variant="outline" className="border-rose-500 text-rose-500 bg-rose-500/10">Da'if</Badge>
             <span className="text-muted-foreground">Weak Narrator</span>
          </div>
        </div>
      </div>

    </div>
  );
}
