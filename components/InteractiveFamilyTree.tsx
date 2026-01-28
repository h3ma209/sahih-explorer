"use client";

import { useCallback, useState } from "react";
import Tree from "react-d3-tree";
import { motion } from "framer-motion";
import { User, Users, Heart, BookOpen, MapPin, Calendar, Award } from "lucide-react";

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

interface ScholarData {
  id: string;
  name: string;
  full_name: string;
  grade: string;
  biography: BiographyData;
  parents: Person[];
  spouses: Person[];
  siblings: Person[];
  children: Person[];
  teachers: Person[];
  students: Person[];
}

interface TreeNode {
  name: string;
  attributes?: {
    id: string;
    grade: string;
    relation: string;
  };
  children?: TreeNode[];
}

function PersonTooltip({ person, biography }: { person: any; biography?: BiographyData }) {
  return (
    <div className="glass rounded-xl p-4 max-w-sm shadow-2xl border border-amber-500/30">
      <h3 className="font-bold text-amber-100 mb-2 text-sm">{person.name}</h3>
      {person.grade && (
        <p className="text-xs text-slate-400 mb-3">{person.grade}</p>
      )}
      
      {biography && (
        <div className="space-y-2 text-xs">
          {biography.birth.place && (
            <div className="flex items-start gap-2">
              <Calendar className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-slate-300">Born: {biography.birth.place}</div>
                {biography.birth.date_display && (
                  <div className="text-slate-500">{biography.birth.date_display.join(' / ')}</div>
                )}
              </div>
            </div>
          )}
          
          {biography.death.place && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-slate-300">Died: {biography.death.place}</div>
                {biography.death.reason && (
                  <div className="text-slate-500">({biography.death.reason})</div>
                )}
              </div>
            </div>
          )}
          
          {biography.area_of_interest.length > 0 && (
            <div className="flex items-start gap-2">
              <BookOpen className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-slate-300">
                {biography.area_of_interest.slice(0, 3).join(', ')}
              </div>
            </div>
          )}
          
          {biography.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {biography.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-amber-900/30 text-amber-400 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InteractiveFamilyTree({ data }: { data: ScholarData }) {
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Store biography separately to avoid TypeScript issues with react-d3-tree
  const biographyData = data.biography;

  // Convert our data structure to react-d3-tree format
  const convertToTreeData = useCallback((): TreeNode => {
    const mainNode: TreeNode = {
      name: data.name,
      attributes: {
        id: data.id,
        grade: data.grade,
        relation: "Scholar"
      },
      children: []
    };

    // Add parents as children (inverted tree)
    if (data.parents.length > 0) {
      const parentsNode: TreeNode = {
        name: "Parents",
        attributes: { id: "parents-group", grade: "", relation: "Parents" },
        children: data.parents.map(p => ({
          name: p.name,
          attributes: { id: p.id, grade: p.grade || "", relation: "Parent" }
        }))
      };
      mainNode.children!.push(parentsNode);
    }

    // Add spouses
    if (data.spouses.length > 0) {
      const spousesNode: TreeNode = {
        name: "Spouses",
        attributes: { id: "spouses-group", grade: "", relation: "Spouses" },
        children: data.spouses.map(s => ({
          name: s.name,
          attributes: { id: s.id, grade: s.grade || "", relation: "Spouse" }
        }))
      };
      mainNode.children!.push(spousesNode);
    }

    // Add children
    if (data.children.length > 0) {
      const childrenNode: TreeNode = {
        name: "Children",
        attributes: { id: "children-group", grade: "", relation: "Children" },
        children: data.children.map(c => ({
          name: c.name,
          attributes: { id: c.id, grade: c.grade || "", relation: "Child" }
        }))
      };
      mainNode.children!.push(childrenNode);
    }

    return mainNode;
  }, [data]);

  const treeData = convertToTreeData();

  // Custom node rendering
  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const isMainScholar = nodeDatum.attributes?.relation === "Scholar";
    const isGroupNode = nodeDatum.name.includes("Parents") || nodeDatum.name.includes("Spouses") || nodeDatum.name.includes("Children");
    
    const getIcon = () => {
      const relation = nodeDatum.attributes?.relation;
      if (isMainScholar) return <User className="w-4 h-4" />;
      if (relation === "Parent") return <Users className="w-3 h-3" />;
      if (relation === "Spouse") return <Heart className="w-3 h-3" />;
      return <User className="w-3 h-3" />;
    };

    const getColor = () => {
      const relation = nodeDatum.attributes?.relation;
      if (isMainScholar) return "border-amber-500 bg-amber-900/40";
      if (relation === "Parent") return "border-blue-500/50 bg-blue-900/20";
      if (relation === "Spouse") return "border-rose-500/50 bg-rose-900/20";
      if (relation === "Child") return "border-green-500/50 bg-green-900/20";
      return "border-slate-600 bg-slate-800/40";
    };

    if (isGroupNode) {
      return (
        <g>
          <circle r={8} fill="#334155" stroke="#64748b" strokeWidth={1} />
          <text fill="#94a3b8" strokeWidth={0} x={15} fontSize="10" fontWeight="500">
            {nodeDatum.name}
          </text>
        </g>
      );
    }

    const displayName = nodeDatum.name.length > 30 
      ? nodeDatum.name.substring(0, 30) + "..." 
      : nodeDatum.name;

    return (
      <g>
        <foreignObject
          x={isMainScholar ? -80 : -60}
          y={isMainScholar ? -40 : -30}
          width={isMainScholar ? 160 : 120}
          height={isMainScholar ? 80 : 60}
        >
          <div
            className={`
              glass rounded-lg p-2 border-2 transition-all cursor-pointer
              ${getColor()}
              ${isMainScholar ? "glow-gold" : ""}
            `}
            onMouseEnter={() => setHoveredNode(nodeDatum)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={toggleNode}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${isMainScholar ? "text-amber-400" : "text-slate-400"}`}>
                {getIcon()}
              </div>
              <span className={`text-xs font-semibold ${isMainScholar ? "text-amber-100" : "text-slate-200"}`}>
                {displayName}
              </span>
            </div>
            {nodeDatum.attributes?.grade && (
              <div className="text-xs text-slate-500 truncate">
                {nodeDatum.attributes.grade}
              </div>
            )}
          </div>
        </foreignObject>
      </g>
    );
  };

  // Initialize dimensions
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const { width, height } = node.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: 100 });
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-[800px]">
      {/* Tooltip */}
      {hoveredNode && hoveredNode.attributes?.relation === "Scholar" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-50"
        >
          <PersonTooltip 
            person={hoveredNode} 
            biography={biographyData}
          />
        </motion.div>
      )}

      {/* Controls hint */}
      <div className="absolute top-4 left-4 glass rounded-lg p-3 text-xs text-slate-400 z-10">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-slate-300">Interactive Family Tree</span>
        </div>
        <div>• Drag to pan</div>
        <div>• Scroll to zoom</div>
        <div>• Click nodes to expand/collapse</div>
        <div>• Hover for details</div>
      </div>

      {/* Tree container */}
      <div ref={containerRef} className="w-full h-full">
        {dimensions.width > 0 && (
          <Tree
            data={treeData}
            translate={translate}
            orientation="vertical"
            pathFunc="step"
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            nodeSize={{ x: 200, y: 150 }}
            renderCustomNodeElement={renderCustomNode}
            zoom={0.8}
            scaleExtent={{ min: 0.3, max: 2 }}
            enableLegacyTransitions
            transitionDuration={500}
            pathClassFunc={() => "stroke-amber-500/30 stroke-2"}
          />
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg p-4 text-xs z-10">
        <div className="font-semibold text-slate-300 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-amber-500 bg-amber-900/40" />
            <span className="text-slate-400">Main Scholar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-blue-500/50 bg-blue-900/20" />
            <span className="text-slate-400">Parents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-rose-500/50 bg-rose-900/20" />
            <span className="text-slate-400">Spouses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-green-500/50 bg-green-900/20" />
            <span className="text-slate-400">Children</span>
          </div>
        </div>
      </div>
    </div>
  );
}
