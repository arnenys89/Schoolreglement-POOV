import React, { useState, useEffect } from "react";
import { School, SchoolBoard, RegulationSection, PDFConfig } from "./types";
import {
  getSavedSchools,
  saveSchools,
  getSavedSections,
  saveSections,
  getSavedPDFConfig,
  savePDFConfig,
  defaultSchoolBoard,
  defaultSchools,
} from "./data/mockData";

import Header from "./components/Header";
import SearchEngine from "./components/SearchEngine";
import SidebarTOC from "./components/SidebarTOC";
import SectionItem from "./components/SectionItem";
import AdminPanel from "./components/AdminPanel";
import PDFExporter from "./components/PDFExporter";

import { FileDown, Shield, FileText, Info, HelpCircle, Layers, CheckCircle2, ChevronDown, Check } from "lucide-react";

export default function App() {
  // 1. Core State
  const [schools, setSchools] = useState<School[]>([]);
  const [board, setBoard] = useState<SchoolBoard>(defaultSchoolBoard);
  const [sections, setSections] = useState<RegulationSection[]>([]);
  const [pdfConfig, setPdfConfig] = useState<PDFConfig | null>(null);

  // Active navigational states
  const [activeSchoolId, setActiveSchoolId] = useState("145722"); // Default to Ninove-Zottegem
  const [activeSectionId, setActiveSectionId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<"none" | "super" | "school">("none");
  const [schoolAdminSchoolId, setSchoolAdminSchoolId] = useState("");

  const handleSetIsAdmin = (value: boolean) => {
    setIsAdmin(value);
    if (!value) {
      setAdminRole("none");
      setSchoolAdminSchoolId("");
    } else {
      if (adminRole === "none") {
        setAdminRole("super");
      }
    }
  };
  const [searchFilter, setSearchFilter] = useState("");
  const [showPDFExporter, setShowPDFExporter] = useState(false);
  const [pdfPrintImmediate, setPdfPrintImmediate] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Dynamic Scroll progress bar handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percentage = (scrollTop / docHeight) * 100;
        setScrollPercent(Math.min(100, Math.max(0, percentage)));
      } else {
        setScrollPercent(0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keep track of the active section in a ref to avoid scroll listener re-binding
  const activeSectionIdRef = React.useRef(activeSectionId);
  useEffect(() => {
    activeSectionIdRef.current = activeSectionId;
  }, [activeSectionId]);

  // Scroll Spy: Auto-detect which regulation section is in the viewport and highlight it in the TOC sidebar
  useEffect(() => {
    const visibleSectionsList = sections.filter((s) => s.visibleSchools.includes(activeSchoolId));
    if (visibleSectionsList.length === 0) return;

    let isThrottled = false;
    const handleScrollSpy = () => {
      if (isThrottled) return;
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, 100);

      const offset = 180; // Offset from top of viewport to account for sticky header
      let currentActiveId = "";

      for (const sec of visibleSectionsList) {
        const el = document.getElementById(`section-view-${sec.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the element's top is less than or equal to the offset, we assume we have scrolled to it.
          if (rect.top <= offset) {
            currentActiveId = sec.id;
          } else {
            break;
          }
        }
      }

      // Default to the first section if we're near the top of page
      if (!currentActiveId && visibleSectionsList.length > 0) {
        currentActiveId = visibleSectionsList[0].id;
      }

      // Check if scroll is at the very bottom of the page, in which case highlight the last section
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom && visibleSectionsList.length > 0) {
        currentActiveId = visibleSectionsList[visibleSectionsList.length - 1].id;
      }

      if (currentActiveId && currentActiveId !== activeSectionIdRef.current) {
        setActiveSectionId(currentActiveId);
      }
    };

    window.addEventListener("scroll", handleScrollSpy);
    // Run once on load/anchor shift
    handleScrollSpy();

    return () => {
      window.removeEventListener("scroll", handleScrollSpy);
    };
  }, [sections, activeSchoolId]);

  // Initialize data on mount
  useEffect(() => {
    // Look up URL search params to find direct "sublink" per school, e.g. ?school=36467
    const params = new URLSearchParams(window.location.search);
    const schoolParam = params.get("school");

    const loadedSchools = getSavedSchools();
    
    // Auto-migrate standard logos if they are missing or still using old placeholders
    let schoolsMigrated = false;
    const migratedSchools = loadedSchools.map(school => {
      let updatedSchool = { ...school };
      let changed = false;

      // Check if using the old cropped Gent-Oudenaarde logo, migration to new professional banner logo
      if (school.logoValue && school.logoValue.includes("cropped-logo_gentoudenaarde_geel.png")) {
        updatedSchool.logoValue = "https://richtpunt.be/gentoudenaarde/wp-content/uploads/sites/5/2024/06/Richtpunt-campus-Gent-Oudenaarde-geel-1024x251.png";
        changed = true;
      }

      const defaultSchoolMatch = defaultSchools.find(ds => ds.id === school.id);
      if (defaultSchoolMatch && (!updatedSchool.logoValue || updatedSchool.logoType !== "custom_url")) {
        updatedSchool.logoType = "custom_url" as const;
        updatedSchool.logoValue = defaultSchoolMatch.logoValue;
        changed = true;
      }

      if (changed) {
        schoolsMigrated = true;
      }
      return updatedSchool;
    });

    if (schoolsMigrated) {
      setSchools(migratedSchools);
      saveSchools(migratedSchools);
    } else {
      setSchools(loadedSchools);
    }

    // If query parameter matches an existing school, activate it directly.
    const activeSchoolsList = schoolsMigrated ? migratedSchools : loadedSchools;
    if (schoolParam && activeSchoolsList.some((s) => s.id === schoolParam)) {
      setActiveSchoolId(schoolParam);
    } else {
      setActiveSchoolId("145722"); // Default
    }

    setSections(getSavedSections());
    setPdfConfig(getSavedPDFConfig());

    // Load custom board if saved in localStorage and auto-migrate if needed
    const savedBoard = localStorage.getItem("schoolreglement_board_v1");
    if (savedBoard) {
      try {
        const parsed = JSON.parse(savedBoard);
        if (!parsed.logoUrl || parsed.logoUrl.includes("Logo_Oost-Vlaanderen.svg")) {
          parsed.logoUrl = defaultSchoolBoard.logoUrl;
          localStorage.setItem("schoolreglement_board_v1", JSON.stringify(parsed));
        }
        setBoard(parsed);
      } catch {
        setBoard(defaultSchoolBoard);
      }
    } else {
      setBoard(defaultSchoolBoard);
    }
  }, []);

  // Update URL sublink search parameter dynamically to maintain direct linking
  const handleSchoolChange = (schoolId: string) => {
    setActiveSchoolId(schoolId);
    
    // Update the browser URL dynamically (without reloading) to provide the requested "sublink" per school
    const url = new URL(window.location.href);
    url.searchParams.set("school", schoolId);
    window.history.pushState({}, "", url.toString());

    // Automatically highlight the first visible chapter
    const visible = sections.filter((s) => s.visibleSchools.includes(schoolId));
    if (visible.length > 0) {
      setActiveSectionId(visible[0].id);
    }
  };

  const handleUpdateSection = (updatedSec: RegulationSection) => {
    const updatedList = sections.map((sec) => (sec.id === updatedSec.id ? updatedSec : sec));
    setSections(updatedList);
    saveSections(updatedList);
  };

  const handleUpdateBoard = (updatedBoard: SchoolBoard) => {
    setBoard(updatedBoard);
    localStorage.setItem("schoolreglement_board_v1", JSON.stringify(updatedBoard));
  };

  const handleUpdateSchoolsList = (updatedSchools: School[]) => {
    setSchools(updatedSchools);
    saveSchools(updatedSchools);
    
    // Fallback if active school got deleted
    if (updatedSchools.length > 0 && !updatedSchools.some((s) => s.id === activeSchoolId)) {
      handleSchoolChange(updatedSchools[0].id);
    }
  };

  const handleUpdatePDFConfig = (updatedConfig: PDFConfig) => {
    setPdfConfig(updatedConfig);
    savePDFConfig(updatedConfig);
  };

  const handleResetAllData = () => {
    if (confirm("Weet u zeker dat u alle reglement-items en camppelposities wilt herstellen naar de oorspronkelijke waarden? Dit wist alle gemaakte aanpassingen.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleScrollToSegment = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const element = document.getElementById(`section-view-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Make it temporarily flash to draw parents' attention
      element.classList.add("ring-2", "ring-[#D6AD00]", "scale-[1.01]");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-[#D6AD00]", "scale-[1.01]");
      }, 1500);
    }
  };

  // Find selected school object
  const activeSchool = schools.find((s) => s.id === activeSchoolId) || schools[0];

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-800">
      
      {/* 1. Dynamic Corporate Identity (Huisstijl) Styles Overrides */}
      <style>{`
        :root {
          --primary-color: ${board.primaryColor || '#D6AD00'};
          --secondary-color: ${board.secondaryColor || '#2E2E2E'};
        }
        
        /* Interactive dynamic overrides */
        .text-\[\#D6AD00\] { color: var(--primary-color) !important; }
        .bg-\[\#D6AD00\] { background-color: var(--primary-color) !important; }
        .border-\[\#D6AD00\] { border-color: var(--primary-color) !important; }
        
        .text-\[\#2E2E2E\] { color: var(--secondary-color) !important; }
        .bg-\[\#2E2E2E\] { background-color: var(--secondary-color) !important; }
        .border-\[\#2E2E2E\] { border-color: var(--secondary-color) !important; }
        
        .hover\:bg-\[\#B59300\]:hover, .hover\:bg-\[\#B08E00\]:hover { 
          filter: brightness(0.9) !important; 
        }
        
        .accent-custom-primary {
          accent-color: var(--primary-color) !important;
        }
      `}</style>

      {/* 2. Subtle Scroll Progress Bar (Voortgangsbalk) */}
      <div className="fixed top-0 left-0 w-full h-[4px] bg-gray-200/40 z-50 no-print">
        <div 
          className="h-full transition-all duration-75"
          style={{ 
            width: `${scrollPercent}%`,
            backgroundColor: board.primaryColor || '#D6AD00'
          }}
        />
      </div>
      
      {/* 3. Top Header Nav Bar & Logo Banner (Visible to Admin only) */}
      {isAdmin && schools.length > 0 && (
        <Header
          schools={schools}
          activeSchoolId={activeSchoolId}
          onSchoolChange={handleSchoolChange}
          isAdmin={isAdmin}
          setIsAdmin={handleSetIsAdmin}
          board={board}
          adminRole={adminRole}
          schoolAdminSchoolId={schoolAdminSchoolId}
          onRoleChange={(role, schoolId) => {
            setAdminRole(role);
            setSchoolAdminSchoolId(schoolId);
            if (role === "school" && schoolId) {
              handleSchoolChange(schoolId);
            }
          }}
        />
      )}

      {/* 4. Global Information Strip */}
      {isAdmin && (
        <div className="bg-amber-50/70 border-b border-amber-100 text-[#B59300] py-2.5 px-4 no-print sm:px-6 lg:px-8 text-xs flex flex-col sm:flex-row justify-between items-center gap-3 font-medium select-none">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <Info size={14} className="shrink-0" />
            <span>U doorzoekt momenteel de regelgeving van: <strong>{activeSchool?.name || "Laden..."}</strong>. Directe link/sublink: </span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 select-all font-semibold break-all text-[11px]">
              {window.location.origin}/?school={activeSchoolId}
            </span>
          </div>
          
          {/* Snelkoppeling naar exporter in admin strip */}
          <button
            onClick={() => {
              setPdfPrintImmediate(false);
              setShowPDFExporter(true);
            }}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-[#D6AD00] hover:bg-[#B59300] text-gray-950 rounded hover:shadow-xs cursor-pointer transition-all duration-150 transform hover:scale-[1.02] active:scale-95 text-xs font-semibold font-sans border border-[#D6AD00]/30"
            title="Snel printen / PDF-voorbeeld ontwerpen"
            id="strip-pdf-export-btn"
          >
            <span className="bg-[#2E2E2E] text-white px-1 py-0.2 rounded text-[8px] font-extrabold tracking-tight font-mono leading-none">PDF</span>
            <FileDown size={13} />
            <span>Printvoorbeeld & PDF Ontwerp</span>
          </button>
        </div>
      )}

      {/* 5. MAIN APP BODY CONTAINER Layout */}
      <main className="flex-1 w-full flex flex-col lg:flex-row gap-0 items-stretch min-h-[calc(100vh-4rem)]">
        
        {/* Left Side: Sticky Full-Height Navigation TOC & Parent Search panel on Left Edge */}
        <div className="w-full lg:w-[320px] xl:w-[365px] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto px-4 py-6 md:p-6 lg:p-8 flex flex-col gap-6 order-2 lg:order-1 no-print shadow-xs">
          {sections.length > 0 && (
            <div className="flex flex-col h-full gap-6">
              {board.showSearchEngine !== false && (
                <div className="shrink-0">
                  <SearchEngine
                    sections={sections}
                    activeSchoolId={activeSchoolId}
                    onSelectSection={handleScrollToSegment}
                  />
                </div>
              )}
              <div className="flex-1 min-h-0">
                <SidebarTOC
                  sections={sections}
                  activeSchoolId={activeSchoolId}
                  activeSectionId={activeSectionId}
                  onSelectSection={handleScrollToSegment}
                />
              </div>
            </div>
          )}
        </div>

        {/* Middle/Main Grid Column: Document Viewer and Editor list */}
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 order-1 lg:order-2 max-w-4xl w-full lg:mx-auto flex flex-col gap-5">
          
          {/* Admin panel injection if active */}
          {isAdmin && (
            <AdminPanel
              board={board}
              onUpdateBoard={handleUpdateBoard}
              schools={schools}
              onUpdateSchools={handleUpdateSchoolsList}
              onResetAllData={handleResetAllData}
              sections={sections}
              onUpdateSections={(updatedSections) => {
                setSections(updatedSections);
                saveSections(updatedSections);
              }}
              adminRole={adminRole}
              schoolAdminSchoolId={schoolAdminSchoolId}
            />
          )}

          {/* Ouder-vriendelijke School Kiezer (Optimized Paginaindeling) */}
          {!isAdmin && schools.length > 0 && board.showSchoolSelector === true && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs no-print select-none">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono shadow-3xs shrink-0 overflow-hidden"
                  style={{ 
                    color: board.primaryColor || '#D6AD00',
                    backgroundColor: `${board.primaryColor || '#D6AD00'}15`
                  }}
                >
                  {activeSchool?.logoType === "custom_url" && activeSchool?.logoValue ? (
                    <img src={activeSchool.logoValue} alt="Logo" className="w-full h-full object-cover" />
                  ) : activeSchool?.logoType === "abbreviation" && activeSchool?.logoValue ? (
                    <span className="text-[11px] font-mono font-black text-gray-700">{activeSchool.logoValue}</span>
                  ) : (
                    <span className="text-lg">{activeSchool?.logoValue || "🏫"}</span>
                  )}
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block leading-none">U bekijkt momenteel:</span>
                  <h3 className="text-xs font-bold text-gray-950 font-display mt-1">{activeSchool?.name}</h3>
                </div>
              </div>

              {/* Campus Selector Dropdown for Parents */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-450 font-sans font-medium hidden md:inline">Kies schoolcampus:</span>
                <select
                  value={activeSchoolId}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="text-xs font-sans font-semibold text-gray-700 border border-gray-200 rounded-lg p-2 bg-gray-50/50 hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-1"
                  style={{ focusRingColor: board.primaryColor || '#D6AD00' }}
                  id="parent-school-select-dropdown"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* School Welcome Card Header */}
          {board.showWelcomeCard === true && (
            <div 
              className="text-white p-6 md:p-8 rounded-2xl shadow-xs relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${board.primaryColor || '#D6AD00'}, ${board.secondaryColor || '#2E2E2E'})`
              }}
            >
              {/* Quick Export PDF button on the top right of the welcome card */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 no-print">
                <button
                  onClick={() => {
                    setPdfPrintImmediate(true);
                    setShowPDFExporter(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E2E2E] hover:bg-black text-white hover:text-amber-300 rounded-lg shadow-md hover:shadow-lg font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 border border-gray-800"
                  title="Print het reglement onmiddellijk"
                  id="welcome-pdf-export-btn"
                >
                  <span className="bg-red-500 text-white px-1 py-0.2 rounded text-[8px] font-extrabold tracking-tight font-mono leading-none">PDF</span>
                  <FileDown size={14} />
                  <span className="hidden sm:inline">Printen</span>
                </button>
              </div>

              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold tracking-widest font-mono uppercase bg-[#2E2E2E] text-white px-2 py-0.5 rounded leading-none">
                  CAMPUS PRESENTATIE
                </span>
                <h2 className="text-xl md:text-2xl font-display font-medium leading-normal pr-20 md:pr-24">
                  {activeSchool?.name}
                </h2>
                <p className="text-xs leading-relaxed max-w-2xl font-sans text-gray-800">
                  In dit interactieve document vindt u het volledige, goedgekeurde schoolreglement voor het schooljaar <strong>2026-2027</strong>. Per onderdeel kunt u zien of het behoort tot het algemene provinciale bestuursreglement of specifiek voor deze schoollocatie is vastgelegd.
                </p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-4 text-xs font-mono select-none">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-[#2E2E2E]" />
                    <span>Sublink: <strong>actief</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-[#2E2E2E]" />
                    <span>Schooleigen filters: <strong>geldig</strong></span>
                  </div>
                </div>
              </div>
              
              {/* Visual background swooshes */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden sm:block">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full object-cover">
                  <path d="M100 0 L100 100 L50 100 Z" fill="#2E2E2E" />
                </svg>
              </div>
            </div>
          )}

          {/* List of active sections */}
          <div className="space-y-4">
            {sortedSections.length > 0 &&
              sortedSections.map((section) => {
                // Determine if there is a parent paragraph
                let parentSec = undefined;
                const parts = section.sectionNumber.split(".");
                if (parts.length > 1) {
                  const parentNum = parts.slice(0, -1).join(".");
                  parentSec = sortedSections.find((s) => s.sectionNumber === parentNum);
                }

                return (
                  <SectionItem
                    key={section.id}
                    section={section}
                    activeSchoolId={activeSchoolId}
                    isAdmin={isAdmin}
                    onUpdateSection={handleUpdateSection}
                    schools={schools}
                    parentSection={parentSec}
                    onSelectSection={handleScrollToSegment}
                    board={board}
                    adminRole={adminRole}
                    schoolAdminSchoolId={schoolAdminSchoolId}
                  />
                );
              })}
          </div>

        </div>



      </main>

      {/* PDF PRINT DIALOG OVERLAY (Custom Exporter Panel) */}
      {showPDFExporter && pdfConfig && (
        <PDFExporter
          board={board}
          activeSchool={activeSchool}
          sections={sections}
          config={pdfConfig}
          onUpdateConfig={handleUpdatePDFConfig}
          onClose={() => {
            setShowPDFExporter(false);
            setPdfPrintImmediate(false);
          }}
          immediate={pdfPrintImmediate}
        />
      )}

      {/* Footer Branding marker */}
      <footer 
        className="text-white py-6 mt-12 no-print select-none text-center"
        style={{
          borderTop: `4px solid ${board.primaryColor || '#D6AD00'}`,
          backgroundColor: board.secondaryColor || '#2E2E2E',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-mono text-gray-450">
          <p>&copy; {new Date().getFullYear()} {board.name}. Alle rechten voorbehouden.</p>
          <p className="text-[10px] mt-1.5 text-gray-400">Officieel gesubsidieerd onderwijs &mdash; Provinciale secundaire scholen Richtpunt.</p>
          {!isAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-700/40 text-center max-w-sm mx-auto space-y-2">
              <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold select-none font-mono">Beheren van dit reglement:</p>
              <div className="flex flex-wrap justify-center gap-3 text-xs font-sans">
                <button
                  onClick={() => {
                    setIsAdmin(true);
                    setAdminRole("super");
                    setSchoolAdminSchoolId("");
                  }}
                  className="px-3 py-1 bg-gray-800 text-gray-300 hover:text-white rounded hover:bg-gray-750 transition duration-150 cursor-pointer text-[10px] font-semibold border border-gray-700"
                  id="footer-admin-login-super"
                >
                  👑 Log in als Bestuursbeheerder
                </button>
                <button
                  onClick={() => {
                    setIsAdmin(true);
                    setAdminRole("school");
                    // Default to the active school's ID if possible, otherwise first school
                    const defaultId = activeSchoolId || (schools.length > 0 ? schools[0].id : "145722");
                    setSchoolAdminSchoolId(defaultId);
                    handleSchoolChange(defaultId);
                  }}
                  className="px-3 py-1 bg-gray-800 text-gray-300 hover:text-white rounded hover:bg-gray-750 transition duration-150 cursor-pointer text-[10px] font-semibold border border-gray-700"
                  id="footer-admin-login-school"
                >
                  🏫 Log in als Schoolbeheerder
                </button>
              </div>
            </div>
          )}
        </div>
      </footer>

      {/* Floating Parent Friendly PDF Icon button in the top-right corner of the screen */}
      {!isAdmin && board.showFloatingPdf !== false && (
        <div className="fixed top-4 right-4 z-50 no-print animate-fade-in hidden md:block">
          <button
            onClick={() => {
              setPdfPrintImmediate(true);
              setShowPDFExporter(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-full shadow-lg hover:shadow-xl font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 font-sans"
            style={{ backgroundColor: board.primaryColor || '#D6AD00' }}
            title="Download schoolreglement onmiddellijk"
            id="parent-floating-pdf-btn"
          >
            <FileDown size={14} className="text-white" />
            <span>Printen</span>
          </button>
        </div>
      )}

    </div>
  );
}
