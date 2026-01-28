"use client";

import { useMemo } from "react";
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
import { Heart, Users2, Baby, Crown } from "lucide-react";

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

function FamilyNode({ data }: any) {
  const isMain = data.type === "main";
  const isParent = data.type === "parent";
  const isSpouse = data.type === "spouse";
  const isChild = data.type === "child";
  const isSibling = data.type === "sibling";

  const getIcon = () => {
    if (isMain) return <Crown className="w-4 h-4 text-amber-500" />;
    if (isParent) return <Users2 className="w-4 h-4 text-blue-500" />;
    if (isSpouse) return <Heart className="w-4 h-4 text-rose-500" />;
    if (isChild) return <Baby className="w-4 h-4 text-emerald-500" />;
    return <Users2 className="w-4 h-4 text-purple-500" />;
  };

  const getColor = () => {
    if (isMain) return "from-amber-500/20 to-amber-600/20";
    if (isParent) return "from-blue-500/10 to-blue-600/10";
    if (isSpouse) return "from-rose-500/10 to-rose-600/10";
    if (isChild) return "from-emerald-500/10 to-emerald-600/10";
    return "from-purple-500/10 to-purple-600/10";
  };

  return (
    <Card className={`px-4 py-3 min-w-[200px] transition-all hover:shadow-lg bg-gradient-to-br ${getColor()}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-background/50">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{data.label}</h3>
          <Badge
            variant="outline"
            className="mt-2 text-xs opacity-70"
          >
            {data.role}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

const nodeTypes = {
  familyNode: FamilyNode,
};

export default function FamilyTreeGraph({ scholar, parents, spouses, children, siblings }: FamilyTreeGraphProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let yOffset = 0;

    // 1. Parents (Top Level)
    const parentWidth = 250;
    const parentsStartX = 400 - ((parents.length - 1) * parentWidth) / 2;
    
    parents.forEach((parent, index) => {
      nodes.push({
        id: parent.id,
        type: "familyNode",
        position: { x: parentsStartX + index * parentWidth, y: 0 },
        data: { label: parent.name, role: "Parent", type: "parent" },
      });
      
      edges.push({
        id: `parent-${parent.id}`,
        source: parent.id,
        target: scholar.id,
        type: "smoothstep",
        style: { stroke: "#3b82f6", strokeWidth: 2 },
      });
    });

    // 2. Siblings & Main Scholar & Spouses (Middle Level)
    const middleY = 250;
    
    // Main Scholar Center
    nodes.push({
      id: scholar.id,
      type: "familyNode",
      position: { x: 400, y: middleY },
      data: { label: scholar.name, role: "Scholar", type: "main" },
    });

    // Siblings (Left of Main)
    siblings.forEach((sibling, index) => {
      nodes.push({
        id: sibling.id,
        type: "familyNode",
        position: { x: 100 - (index * 250), y: middleY },
        data: { label: sibling.name, role: "Sibling", type: "sibling" },
      });
      
      // Connect siblings to parents if exist, otherwise dashed line to main
      if (parents.length > 0) {
        edges.push({
          id: `sibling-${sibling.id}`,
          source: parents[0].id, // Connect to first parent roughly
          target: sibling.id,
          type: "smoothstep",
          style: { stroke: "#a855f7", strokeWidth: 1, strokeDasharray: "5,5" },
        });
      }
    });

    // Spouses (Right of Main)
    spouses.forEach((spouse, index) => {
      nodes.push({
        id: spouse.id,
        type: "familyNode",
        position: { x: 700 + (index * 250), y: middleY },
        data: { label: spouse.name, role: "Spouse", type: "spouse" },
      });
      
      edges.push({
        id: `spouse-${spouse.id}`,
        source: scholar.id,
        target: spouse.id,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#e11d48", strokeWidth: 2 },
        label: "Married"
      });
    });

    // 3. Children (Bottom Level)
    const childrenY = 500;
    const childWidth = 250;
    
    // Helper to group children by mother if possible, otherwise simple list
    // For now simple list under main scholar
    if (children.length > 0) {
        const childrenStartX = 400 - ((children.length - 1) * childWidth) / 2;
        
        children.forEach((child, index) => {
            nodes.push({
                id: child.id,
                type: "familyNode",
                position: { x: childrenStartX + index * childWidth, y: childrenY },
                data: { label: child.name, role: "Child", type: "child" },
            });
            
            edges.push({
                id: `child-${child.id}`,
                source: scholar.id,
                target: child.id,
                type: "smoothstep",
                style: { stroke: "#10b981", strokeWidth: 2 },
            });
        });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [scholar, parents, spouses, children, siblings]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (nodes.length <= 1) {
      return (
          <div className="w-full h-[400px] flex items-center justify-center bg-accent/5 rounded-xl border border-border">
              <p className="text-muted-foreground">No family data available</p>
          </div>
      )
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-border bg-card/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background className="bg-background" gap={20} size={1} />
        <Controls className="bg-card border-border" />
      </ReactFlow>
    </div>
  );
}
