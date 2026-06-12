import React from "react";
import { RegulationSection } from "../types";
import LucideIcon from "./LucideIcon";
import { BookOpen, FolderOpen, Tag, HelpCircle } from "lucide-react";

interface SidebarTOCProps {
  sections: RegulationSection[];
  activeSchoolId: string;
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
}

export default function SidebarTOC({
  sections,
  activeSchoolId,
  activeSectionId,
  onSelectSection,
}: SidebarTOCProps) {
  
  // Sort sections numerically by their sectionNumber hierarchy (e.g. 1, 1.1, 1.2.1, 2)
  const sortedSections = [...sections].sort((a, b) => {
    const aParts = a.sectionNumber.split(".").map(Number);
    const bParts = b.sectionNumber.split(".").map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      if (aVal !== bVal) return aVal - bVal;
    }
    return 0;
  });

  // Auto-scroll the active TOC item into view inside the sidebar container when it changes under scroll-spy
  React.useEffect(() => {
    if (activeSectionId) {
      const activeEl = document.getElementById(`toc-item-${activeSectionId}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeSectionId]);

  return (
    <aside className="w-full flex flex-col h-full bg-white lg:bg-transparent border border-gray-200 lg:border-none rounded-xl lg:rounded-none p-4 lg:p-0 shadow-3xs lg:shadow-none no-print">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 shrink-0">
        <BookOpen className="text-[#D6AD00]" size={16} />
        <h3 className="font-display font-bold text-[#2E2E2E] text-xs uppercase tracking-wider">
          Inhoudstabel
        </h3>
      </div>

      {/* Navigation Tree list */}
      <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-[calc(100vh-320px)] lg:max-h-none">
        {sortedSections.map((sec) => {
          // Check if visible for this school
          const isVisible = sec.visibleSchools.includes(activeSchoolId);
          if (!isVisible) return null;

          const isCurrentActive = activeSectionId === sec.id;
          const levelStyle =
            sec.level === 1
              ? "font-semibold text-gray-900 text-xs mt-3.5 bg-gray-50/50 p-1.5 rounded-md"
              : sec.level === 2
              ? "pl-4 text-gray-700 text-xs font-normal"
              : "pl-8 text-gray-500 text-[11px] font-normal";

          // Icons per level or category
          const hasSchooleigenOverride = sec.isSchoolSpecificText && sec.schoolSpecificText[activeSchoolId];

          return (
            <button
              key={sec.id}
              id={`toc-item-${sec.id}`}
              onClick={() => onSelectSection(sec.id)}
              className={`w-full text-left flex items-start gap-2 py-1 px-1.5 rounded transition-all cursor-pointer ${levelStyle} ${
                isCurrentActive
                  ? "bg-amber-50 text-[#D6AD00] border-l-2 border-[#D6AD00] font-medium"
                  : "hover:bg-gray-100"
              }`}
              title={`${sec.sectionNumber} ${sec.title}`}
            >
              {sec.level === 1 && (
                <div className="mt-0.5 text-gray-400">
                  <LucideIcon name={sec.icon} size={14} className={isCurrentActive ? "text-[#D6AD00]" : "text-gray-400"} />
                </div>
              )}
              
              <div className="flex-1 min-w-0 flex items-baseline gap-1 mr-1">
                <span className="font-mono text-[10px] text-gray-400 select-none">
                  {sec.sectionNumber}
                </span>
                <span className="truncate leading-normal">
                  {sec.title}
                </span>
                
                {/* Specific override badge indicator */}
                {hasSchooleigenOverride && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 self-center ml-1" title="Campus-specifieke inhoud" />
                )}
              </div>

              {/* Scroll tracking active badge */}
              {isCurrentActive && (
                <span className="shrink-0 text-[8px] tracking-wide font-extrabold text-amber-700 bg-amber-100/80 px-1 py-0.5 rounded leading-none select-none ml-auto animate-pulse">
                  Kijk
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Schooleigen detail</span>
        </span>
      </div>

    </aside>
  );
}
