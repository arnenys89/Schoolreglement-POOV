import React from "react";
import { RegulationSection } from "../types";
import LucideIcon from "./LucideIcon";
import { BookOpen, FolderOpen, Tag, HelpCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarTOCProps {
  sections: RegulationSection[];
  activeSchoolId: string;
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
  onClose?: () => void;
}

export default function SidebarTOC({
  sections,
  activeSchoolId,
  activeSectionId,
  onSelectSection,
  onClose,
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

  // State to track which chapter sections are expanded
  const [expandedChapters, setExpandedChapters] = React.useState<Record<number, boolean>>({});

  // Memoize the active section's chapter number to auto-expand it from scroll-spy
  const lastActiveChapterRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const activeSection = sections.find((s) => s.id === activeSectionId);
    if (activeSection) {
      const activeCh = activeSection.chapterNumber;
      if (activeCh !== lastActiveChapterRef.current) {
        setExpandedChapters((prev) => ({
          ...prev,
          [activeCh]: true,
        }));
        lastActiveChapterRef.current = activeCh;
      }
    }
  }, [activeSectionId, sections]);

  // Auto-scroll the active TOC item into view inside the sidebar container when it changes under scroll-spy
  React.useEffect(() => {
    if (activeSectionId) {
      const activeEl = document.getElementById(`toc-item-${activeSectionId}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeSectionId]);

  // Get all visible sections for this school
  const visibleSections = sortedSections.filter((s) => s.visibleSchools.includes(activeSchoolId));

  // Build list dynamically to handle parentless chapters (if any) and group nested ones under level 1 chapters
  const renderList: React.ReactNode[] = [];
  const renderedSectionIds = new Set<string>();

  visibleSections.forEach((sec) => {
    if (renderedSectionIds.has(sec.id)) return;

    if (sec.level === 1) {
      // It's a chapter! Let's find all visible sub-sections that belong to this chapter.
      const children = visibleSections.filter(
        (child) => child.level > 1 && child.chapterNumber === sec.chapterNumber
      );
      
      // Mark chapter and children as rendered
      renderedSectionIds.add(sec.id);
      children.forEach((child) => renderedSectionIds.add(child.id));

      const isCurrentActive = activeSectionId === sec.id;
      const isExpanded = !!expandedChapters[sec.chapterNumber];
      const hasSchooleigenOverride = sec.isSchoolSpecificText && sec.schoolSpecificText[activeSchoolId];

      renderList.push(
        <div key={`group-${sec.id}`} className="space-y-0.5">
          {/* Chapter Header Button */}
          <button
            id={`toc-item-${sec.id}`}
            onClick={() => {
              onSelectSection(sec.id);
              if (onClose) onClose();
              setExpandedChapters((prev) => ({
                ...prev,
                [sec.chapterNumber]: !prev[sec.chapterNumber],
              }));
            }}
            className={`w-full text-left flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer font-semibold text-gray-900 text-xs mt-3 mb-1 bg-gray-50/50 hover:bg-gray-100/80 border ${
              isCurrentActive
                ? "bg-amber-50 text-[#D6AD00] border-amber-200"
                : "border-transparent"
            }`}
            title={`${sec.sectionNumber} ${sec.title}`}
          >
            <div className="text-gray-400 shrink-0">
              <LucideIcon
                name={sec.iconName || sec.icon}
                size={14}
                className={isCurrentActive ? "text-[#D6AD00]" : "text-gray-400"}
              />
            </div>

            <div className="flex-1 min-w-0 flex items-baseline gap-1 mr-1">
              <span className="font-mono text-[10px] text-gray-400 select-none shrink-0">
                {sec.sectionNumber}
              </span>
              <span className="truncate leading-normal text-gray-800">
                {sec.title}
              </span>

              {hasSchooleigenOverride && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 self-center ml-1"
                  title="Campus-specifieke inhoud"
                />
              )}
            </div>

            {/* Scroll tracking active badge */}
            {isCurrentActive && (
              <span className="shrink-0 text-[8px] tracking-wide font-extrabold text-amber-700 bg-amber-100/80 px-1 py-0.5 rounded leading-none select-none ml-auto animate-pulse">
                Kijk
              </span>
            )}

            {children.length > 0 && (
              <ChevronRight
                size={12}
                className={`text-gray-400 shrink-0 transition-transform duration-200 ml-1 ${
                  isExpanded ? "rotate-90 text-[#D6AD00]" : ""
                }`}
              />
            )}
          </button>

          {/* Collapsible Children Wrapper */}
          {children.length > 0 && (
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden pl-2 border-l border-gray-100 ml-4 space-y-1 mt-0.5 mb-1.5"
                >
                  {children.map((child) => {
                    const isChildActive = activeSectionId === child.id;
                    const childHasOverride = child.isSchoolSpecificText && child.schoolSpecificText[activeSchoolId];
                    const childStyle =
                      child.level === 2
                        ? "pl-2 text-gray-700 text-xs font-normal"
                        : "pl-5 text-gray-500 text-[11px] font-normal";

                    return (
                      <button
                        key={child.id}
                        id={`toc-item-${child.id}`}
                        onClick={() => {
                          onSelectSection(child.id);
                          if (onClose) onClose();
                        }}
                        className={`w-full text-left flex items-start gap-2 py-1 px-1.5 rounded transition-all cursor-pointer ${childStyle} ${
                          isChildActive
                            ? "bg-amber-50/70 text-[#D6AD00] font-medium"
                            : "hover:bg-gray-50"
                        }`}
                        title={`${child.sectionNumber} ${child.title}`}
                      >
                        <div className="flex-1 min-w-0 flex items-baseline gap-1 mr-1">
                          <span className="font-mono text-[10px] text-gray-400 select-none">
                            {child.sectionNumber}
                          </span>
                          <span className="truncate leading-normal">
                            {child.title}
                          </span>

                          {childHasOverride && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 self-center ml-1"
                              title="Campus-specifieke inhoud"
                            />
                          )}
                        </div>

                        {/* Scroll tracking active badge */}
                        {isChildActive && (
                          <span className="shrink-0 text-[8px] tracking-wide font-extrabold text-amber-700 bg-amber-100/80 px-1 py-0.5 rounded leading-none select-none ml-auto animate-pulse">
                            Kijk
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      );
    } else {
      // Parentless fallback section
      renderedSectionIds.add(sec.id);
      const isCurrentActive = activeSectionId === sec.id;
      const levelStyle =
        sec.level === 2
          ? "pl-4 text-gray-700 text-xs font-normal"
          : "pl-8 text-gray-500 text-[11px] font-normal";
      const hasSchooleigenOverride = sec.isSchoolSpecificText && sec.schoolSpecificText[activeSchoolId];

      renderList.push(
        <button
          key={sec.id}
          id={`toc-item-${sec.id}`}
          onClick={() => {
            onSelectSection(sec.id);
            if (onClose) onClose();
          }}
          className={`w-full text-left flex items-start gap-2 py-1 px-1.5 rounded transition-all cursor-pointer ${levelStyle} ${
            isCurrentActive
              ? "bg-amber-50 text-[#D6AD00] border-l-2 border-[#D6AD00] font-medium"
              : "hover:bg-gray-100"
          }`}
          title={`${sec.sectionNumber} ${sec.title}`}
        >
          <div className="flex-1 min-w-0 flex items-baseline gap-1 mr-1">
            <span className="font-mono text-[10px] text-gray-400 select-none">
              {sec.sectionNumber}
            </span>
            <span className="truncate leading-normal">
              {sec.title}
            </span>

            {hasSchooleigenOverride && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 self-center ml-1" title="Campus-specifieke inhoud" />
            )}
          </div>

          {isCurrentActive && (
            <span className="shrink-0 text-[8px] tracking-wide font-extrabold text-amber-700 bg-amber-100/80 px-1 py-0.5 rounded leading-none select-none ml-auto animate-pulse">
              Kijk
            </span>
          )}
        </button>
      );
    }
  });

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
        {renderList}
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
