import React, { useState, useEffect } from "react";
import { School, SchoolBoard, RegulationSection, PDFConfig, RegulationVersion } from "./types";
import {
  fetchVersions,
  saveVersions,
  deleteVersion,
  fetchSchools,                
  saveSchools,
  fetchSections,
  saveSections,
  fetchPDFConfig,
  savePDFConfig,
  fetchSectionsForVersion,
  saveSectionsForVersion,
  fetchBoard,
  saveBoard,
} from "./lib/database";
import {
  defaultSchoolBoard,
  defaultSections,
  defaultSchools,
  defaultPDFConfig
} from "./data/mockData";

import SearchEngine from "./components/SearchEngine";
import SidebarTOC from "./components/SidebarTOC";
import SectionItem from "./components/SectionItem";
import AdminPanel from "./components/AdminPanel";
import PDFExporter from "./components/PDFExporter";

import { FileDown, Shield, FileText, Info, HelpCircle, Layers, CheckCircle2, ChevronDown, Check, Menu, X, ArrowUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // 1. Core State
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState("Databaseverbinding initialiseren...");
  const [schools, setSchools] = useState<School[]>([]);
  const [board, setBoard] = useState<SchoolBoard>(defaultSchoolBoard);
  const [sections, setSections] = useState<RegulationSection[]>([]);
  const [pdfConfig, setPdfConfig] = useState<PDFConfig | null>(null);
  const [versions, setVersions] = useState<RegulationVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Active navigational states
  const [activeSchoolId, setActiveSchoolId] = useState("145722"); // Default to Ninove-Zottegem
  const [activeSectionId, setActiveSectionId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessRole, setAccessRole] = useState<"none" | "super">("none");
  const [accessSetupError, setAccessSetupError] = useState("");
  const [adminRole, setAdminRole] = useState<"none" | "super" | "school">("none");
  const [schoolAdminSchoolId, setSchoolAdminSchoolId] = useState("");

  const handleSetIsAdmin = (value: boolean) => {
    // Beheerrechten komen uitsluitend uit de server-side gevalideerde Cloudflare Access-sessie.
    if (value && accessRole !== "super") return;
    setIsAdmin(value);
    setAdminRole(value ? "super" : "none");
    setSchoolAdminSchoolId("");
  };
  const [searchFilter, setSearchFilter] = useState("");
  const [showPDFExporter, setShowPDFExporter] = useState(false);
  const [pdfPrintImmediate, setPdfPrintImmediate] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showTOCMobile, setShowTOCMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Cloudflare Access is the single sign-on authority. The Pages Function verifies the JWT signature,
  // issuer, audience and expiry before returning the user's identity and effective role.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let email = "";
      try {
        const response = await fetch("/api/session", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Geen geldige Cloudflare Access-sessie.");
        const session = await response.json();
        email = typeof session.email === "string" ? session.email.trim().toLowerCase() : "";
        if (cancelled) return;

        const isSuperAdmin = session.role === "super" && email === "arne.nys@ptiz.be";
        if (cancelled) return;
        const role = isSuperAdmin ? "super" : "none";
        setAccessRole(role);
        setIsAdmin(isSuperAdmin);
        setAdminRole(role);
        setSchoolAdminSchoolId("");
        setAccessSetupError("");
      } catch (error) {
        if (cancelled) return;
        setAccessRole("none");
        setIsAdmin(false);
        setAdminRole("none");
        setSchoolAdminSchoolId("");
        if (email === "arne.nys@ptiz.be") {
          setAccessSetupError(error instanceof Error ? error.message : "De Cloudflare Access-beheersessie kon niet worden gestart.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Dynamic Scroll progress bar handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowScrollTop(scrollTop > 500);
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
    (async () => {
      // Look up URL search params to find direct "sublink" per school, e.g. ?school=36467
      const params = new URLSearchParams(window.location.search);
      const schoolParam = params.get("school");
      let canSeedDatabase = false;
      try {
        const sessionResponse = await fetch("/api/session", { credentials: "same-origin", cache: "no-store" });
        const session = sessionResponse.ok ? await sessionResponse.json() : null;
        canSeedDatabase = session?.role === "super" && String(session?.email || "").toLowerCase() === "arne.nys@ptiz.be";
      } catch { canSeedDatabase = false; }

      let loadedVersionsList: RegulationVersion[] = await fetchVersions().catch((error) => { console.warn("Schooljaarversies konden niet uit Cloudflare D1 worden geladen:", error); return []; });
      if (loadedVersionsList.length === 0) {
        loadedVersionsList = [{ id: "2026-2027", schoolYear: "2026-2027", isPublished: true, createdAt: new Date().toISOString() }];
        if (canSeedDatabase) saveVersions(loadedVersionsList).catch((error) => console.warn("Standaardversie kon niet in Cloudflare D1 worden opgeslagen:", error));
      }
      setVersions(loadedVersionsList);

      // Load active version ID
      let currentVersionId = localStorage.getItem("schoolreglement_active_version_id_v1");
      if (!currentVersionId || !loadedVersionsList.some(v => v.id === currentVersionId)) {
        const firstPub = loadedVersionsList.find(v => v.isPublished);
        currentVersionId = firstPub ? firstPub.id : loadedVersionsList[0].id;
        localStorage.setItem("schoolreglement_active_version_id_v1", currentVersionId);
      }
      setActiveVersionId(currentVersionId);

      setLoadingPhase("Gegevens ophalen en synchroniseren...");

      let loadedSchools: School[] = [];
      let loadedSections: RegulationSection[] = [];
      let loadedPDFConfig: PDFConfig | null = null;
      let loadedBoardObj: SchoolBoard | null = null;

      try {
        const [schoolsResult, sectionsResult, pdfConfigResult, boardResult] = await Promise.all([
          fetchSchools().catch((e) => {
            console.warn("Could not fetch schools from Cloudflare D1, using default fallback list:", e);
            return defaultSchools;
          }),
          fetchSectionsForVersion(currentVersionId).catch((e) => {
            console.warn("Could not fetch sections from Cloudflare D1, using defaults instead:", e);
            return [];
          }),
          fetchPDFConfig().catch((e) => {
            console.warn("Could not fetch PDF configuration from Cloudflare D1:", e);
            return null;
          }),
          fetchBoard().catch((e) => {
            console.warn("Could not fetch Board configuration from Cloudflare D1:", e);
            return null;
          })
        ]);

        loadedSchools = schoolsResult;
        loadedSections = sectionsResult;
        loadedPDFConfig = pdfConfigResult;
        loadedBoardObj = boardResult;
      } catch (err) {
        console.error("Critical parallel fetch failed:", err);
      }

      // 1. Process Schools
      let activeSchoolsList = loadedSchools.length > 0 ? loadedSchools : defaultSchools;
      
      // Auto-migrate standard logos if they are missing or still using old placeholders
      let schoolsMigrated = false;
      const migratedSchools = activeSchoolsList.map(school => {
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
        if (canSeedDatabase) saveSchools(migratedSchools).catch(err => console.warn("Bijwerken van scholen in Cloudflare D1 mislukt:", err));
      } else {
        setSchools(activeSchoolsList);
        if (loadedSchools.length === 0 && canSeedDatabase) saveSchools(activeSchoolsList).catch(err => console.warn("Initiële schoolgegevens konden niet in Cloudflare D1 worden opgeslagen:", err));
      }

      // If query parameter matches an existing school, activate it directly.
      const finalSchoolsList = schoolsMigrated ? migratedSchools : activeSchoolsList;
      let matchedSchoolId = "145722"; // Default
      if (schoolParam && finalSchoolsList.some((s) => s.id === schoolParam)) {
        matchedSchoolId = schoolParam;
        setActiveSchoolId(schoolParam);
      } else {
        setActiveSchoolId("145722"); // Default
      }

      // Beheerrechten worden nooit via URL-parameters toegekend.

      // 2. Process Sections
      if (loadedSections.length === 0) {
        loadedSections = defaultSections;
        setSections(loadedSections);
        if (canSeedDatabase) saveSectionsForVersion(currentVersionId, loadedSections).catch(err => console.warn("Standaardreglement kon niet in Cloudflare D1 worden opgeslagen:", err));
      } else {
        setSections(loadedSections);
      }

      // 3. Process PDF Config
      if (!loadedPDFConfig) {
        loadedPDFConfig = {
          schoolLogo: "",
          h1Size: 24,
          h2Size: 20,
          h3Size: 16,
          bodySize: 12,
          fontFamily: "Inter",
          showTOC: true,
          headerText: "",
          footerText: ""
        };
        if (canSeedDatabase) savePDFConfig(loadedPDFConfig).catch(err => console.warn("Standaard PDF-configuratie kon niet in Cloudflare D1 worden opgeslagen:", err));
      }
      setPdfConfig(loadedPDFConfig);

      // 4. Process Board
      let finalBoardFetched = loadedBoardObj;
      if (!finalBoardFetched) finalBoardFetched = defaultSchoolBoard;

      if (finalBoardFetched) {
        if (!finalBoardFetched.logoUrl || finalBoardFetched.logoUrl.includes("Logo_Oost-Vlaanderen.svg")) {
          finalBoardFetched.logoUrl = defaultSchoolBoard.logoUrl;
        }
        try {
          if (canSeedDatabase) saveBoard(finalBoardFetched).catch(err => console.warn("Initialisatie van bestuursinstellingen in Cloudflare D1 mislukt:", err));
        } catch (e) {
          console.warn(e);
        }
        setBoard(finalBoardFetched);
      }

      setLoadingPhase("Succesvol geladen!");
      
      // Fast, premium visual transition delay (~350ms) to let the custom loader animate out nicely
      setTimeout(() => {
        setIsLoading(false);
      }, 350);

    })();
  }, []);

  // Synchronize on startup or deep load to scroll straight to the requested section if present
  useEffect(() => {
    if (sections.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const sectionParam = params.get("section");
      if (sectionParam) {
        // Debounce/wait slightly for rendering and DOM layout to stabilize
        const timeoutId = setTimeout(() => {
          handleScrollToSegment(sectionParam);
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [sections]);

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

  const handleUpdateSection = async (updatedSec: RegulationSection) => {
    const updatedList = sections.map((sec) => (sec.id === updatedSec.id ? updatedSec : sec));
    setSections(updatedList);
    await saveSectionsForVersion(activeVersionId, updatedList);
  };

  const handleUpdateBoard = async (updatedBoard: SchoolBoard) => {
    setBoard(updatedBoard);
    await saveBoard(updatedBoard);
  };

  const handleUpdateSchoolsList = async (updatedSchools: School[]) => {
    setSchools(updatedSchools);
    await saveSchools(updatedSchools);
    
    // Fallback if active school got deleted
    if (updatedSchools.length > 0 && !updatedSchools.some((s) => s.id === activeSchoolId)) {
      handleSchoolChange(updatedSchools[0].id);
    }
  };

  const handleUpdatePDFConfig = async (updatedConfig: PDFConfig) => {
    setPdfConfig(updatedConfig);
    await savePDFConfig(updatedConfig);
  };

  const handleResetAllData = async () => {
    if (!confirm("Weet u zeker dat u alle reglement-items en campusposities wilt herstellen naar de oorspronkelijke waarden? Dit wist alle gemaakte aanpassingen in Cloudflare D1.")) return;
    const initialVersion: RegulationVersion = { id: "2026-2027", schoolYear: "2026-2027", isPublished: true, createdAt: new Date().toISOString() };
    await Promise.all([
      saveSchools(defaultSchools),
      saveSectionsForVersion(initialVersion.id, defaultSections),
      savePDFConfig(defaultPDFConfig),
      saveBoard(defaultSchoolBoard),
      saveVersions([initialVersion]),
    ]);
    localStorage.removeItem("schoolreglement_active_version_id_v1");
    window.location.reload();
  };

  const handleSelectVersion = async (versionId: string) => {
    setActiveVersionId(versionId);
    localStorage.setItem("schoolreglement_active_version_id_v1", versionId);
    setSections(await fetchSectionsForVersion(versionId));
  };

  const handleToggleVersionPublish = async (versionId: string) => {
    const updated = versions.map((v) => v.id === versionId ? { ...v, isPublished: !v.isPublished } : v);
    await saveVersions(updated);
    setVersions(updated);
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (versionId === activeVersionId) { alert("Fout: U kunt de actieve versie die u momenteel bewerkt niet verwijderen."); return; }
    const updated = versions.filter((v) => v.id !== versionId);
    await deleteVersion(versionId);
    await saveVersions(updated);
    setVersions(updated);
  };

  const handleAddVersion = async (schoolYear: string, cloneFromId: string) => {
    const newId = schoolYear.trim().replace(/\s+/g, "_");
    if (versions.some((v) => v.id === newId)) {
      alert("Fout: Er bestaat al een versie voor dit schooljaar!");
      return;
    }

    const newVersion: RegulationVersion = {
      id: newId,
      schoolYear: schoolYear.trim(),
      isPublished: false, // Default to unpublished
      createdAt: new Date().toISOString(),
    };

    const updatedVersions = [...versions, newVersion];
    await saveVersions(updatedVersions);
    setVersions(updatedVersions);

    // Clone sections
    let clonedSections: RegulationSection[] = [];
    if (cloneFromId) {
      clonedSections = await fetchSectionsForVersion(cloneFromId);
    } else {
      clonedSections = [...sections];
    }

    await saveSectionsForVersion(newId, clonedSections);
    handleSelectVersion(newId);
  };

  const handleScrollToSegment = (sectionId: string) => {
    setActiveSectionId(sectionId);
    
    // Update the browser URL dynamically (without reloading) to provide the direct link parameters
    const url = new URL(window.location.href);
    url.searchParams.set("section", sectionId);
    window.history.replaceState({}, "", url.toString());

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
    <div className="schoolreg-app min-h-screen flex flex-col font-sans antialiased text-gray-800">
      {accessSetupError && (
        <div role="alert" className="mx-auto mt-4 max-w-4xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Beheerlogin nog niet volledig geconfigureerd.</strong>{" "}
          {accessSetupError}
        </div>
      )}

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

      {/* Global Loading Curtain */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 bg-[#FAF9F6] flex flex-col items-center justify-center z-[9999] p-6 text-center select-none"
            style={{ 
              background: "radial-gradient(circle at center, #FAF9F6 0%, #F5F3ED 100%)" 
            }}
          >
            <div className="max-w-md w-full flex flex-col items-center">
              {/* Spinner & Shield Outer Ring */}
              <div className="relative mb-8 w-20 h-20 flex items-center justify-center">
                {/* Glowing Aura */}
                <span 
                  className="absolute inset-0 rounded-full blur-xl opacity-35 animate-pulse" 
                  style={{ backgroundColor: board.primaryColor || '#D6AD00' }}
                />
                
                {/* Rotating Border Ring */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent"
                  style={{ 
                    borderColor: board.primaryColor || '#D6AD00',
                    borderTopColor: "transparent",
                    borderRightColor: "transparent"
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />

                {/* Subdued rotating ring background */}
                <div 
                  className="absolute inset-0 rounded-full border-4 opacity-15"
                  style={{ borderColor: board.primaryColor || '#D6AD00' }}
                />

                {/* Shield badge inner */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-white text-[#2E2E2E]"
                  style={{ color: board.primaryColor || '#D6AD00' }}
                >
                  <Shield size={24} className="animate-pulse stroke-[2]" />
                </div>
              </div>

              {/* Title & Board Label */}
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-lg font-sans font-extrabold tracking-widest text-[#2E2E2E] uppercase flex items-center gap-1.5"
              >
                <span>{board.name || "RAAD VAN BESTUUR"}</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-xs text-gray-500 font-sans tracking-wide mt-1 font-medium italic"
              >
                Digitaal Schoolreglement Portaal
              </motion.p>

              {/* Progress Line */}
              <div className="w-52 h-1 bg-gray-200/60 rounded-full mt-8 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: board.primaryColor || '#D6AD00' }}
                  initial={{ width: "10%" }}
                  animate={{ 
                    width: loadingPhase === "Succesvol geladen!" ? "100%" : "75%" 
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Loading subtext / phases */}
              <motion.div 
                key={loadingPhase}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] text-gray-600 font-sans mt-3.5 tracking-wide flex items-center gap-2 bg-white/60 border border-gray-150/40 px-3 py-1.5 rounded-full shadow-sm"
              >
                {loadingPhase !== "Succesvol geladen!" && (
                  <Loader2 size={12} className="animate-spin text-amber-500" />
                )}
                <span className="font-medium font-mono">{loadingPhase}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      
      {/* Nieuwe Bestelplatform-appshell */}
      <header className="rp-topbar no-print">
        <div className="rp-brand">
          <span className="rp-brand-mark">R</span>
          <span className="rp-brand-copy"><strong>Richtpunt</strong><small>SCHOOLREGLEMENTEN</small></span>
        </div>
        <div className="rp-topbar-context">
          {(isAdmin || board.showSchoolSelector === true) && schools.length > 0 && (
            <label className="rp-select-wrap">
              <span>Campus</span>
              <select value={activeSchoolId} onChange={(e) => handleSchoolChange(e.target.value)}>
                {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
              </select>
            </label>
          )}
          <label className="rp-select-wrap rp-year-select">
            <span>Schooljaar</span>
            <select value={activeVersionId} onChange={(e) => handleSelectVersion(e.target.value)}>
              {versions.filter((version) => isAdmin || version.isPublished).map((version) => (
                <option key={version.id} value={version.id}>{version.schoolYear}</option>
              ))}
            </select>
          </label>
          {isAdmin && <span className="rp-admin-status"><Shield size={13}/> Beheer actief</span>}
          <div className="rp-topbar-buttons">
            {!isAdmin && accessRole === "super" && (
              <button type="button" className="rp-secondary-button" onClick={() => handleSetIsAdmin(true)}>Beheer openen</button>
            )}
            {isAdmin && (
              <button type="button" className="rp-secondary-button" onClick={() => handleSetIsAdmin(false)}>Beheer sluiten</button>
            )}
            {(isAdmin || board.showFloatingPdf !== false) && <button type="button" className="rp-primary-button" onClick={() => { setPdfPrintImmediate(false); setShowPDFExporter(true); }}>
              <FileDown size={15}/> PDF / Afdrukken
            </button>}
          </div>
          <button type="button" className="rp-mobile-menu" onClick={() => setShowTOCMobile(true)} aria-label="Inhoud openen"><Menu size={19}/></button>
        </div>
      </header>

      {isAdmin && (
        <div className="rp-admin-context no-print">
          <Info size={14}/>
          <span>Beheer van <strong>{activeSchool?.name || "de geselecteerde campus"}</strong></span>
          <span className="rp-context-link">{window.location.origin}/?school={activeSchoolId}</span>
        </div>
      )}

      <main className="rp-layout">
        <aside className={`rp-sidebar no-print ${isSidebarOpen ? "rp-sidebar-expanded" : "rp-sidebar-collapsed"}`}>
          <div className="rp-sidebar-heading">
            <div className="rp-sidebar-section-label">NAVIGATIE</div>
            <button type="button" className="rp-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label={isSidebarOpen ? "Navigatie inklappen" : "Navigatie uitklappen"}>
              {isSidebarOpen ? <X size={16}/> : <Menu size={17}/>}
            </button>
          </div>
          {isSidebarOpen && sections.length > 0 && (
            <div className="rp-sidebar-content">
              {board.showSearchEngine !== false && (
                <div className="rp-search-area">
                  <SearchEngine sections={sections} activeSchoolId={activeSchoolId} onSelectSection={handleScrollToSegment}/>
                </div>
              )}
              <div className="rp-toc-area">
                <SidebarTOC sections={sections} activeSchoolId={activeSchoolId} activeSectionId={activeSectionId} onSelectSection={handleScrollToSegment}/>
              </div>
            </div>
          )}
        </aside>

        <AnimatePresence>
          {showTOCMobile && (
            <motion.div initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{type:"spring",damping:25,stiffness:200}} className="rp-mobile-drawer no-print">
              <div className="rp-mobile-drawer-head">
                <div className="rp-brand"><span className="rp-brand-mark">R</span><span className="rp-brand-copy"><strong>Richtpunt</strong><small>REGLEMENTEN</small></span></div>
                <button type="button" className="rp-sidebar-toggle" onClick={() => setShowTOCMobile(false)} aria-label="Navigatie sluiten"><X size={19}/></button>
              </div>
              <div className="rp-mobile-drawer-body">
                {board.showSearchEngine !== false && <SearchEngine sections={sections} activeSchoolId={activeSchoolId} onSelectSection={(id:string) => {handleScrollToSegment(id);setShowTOCMobile(false);}}/>}
                <SidebarTOC sections={sections} activeSchoolId={activeSchoolId} activeSectionId={activeSectionId} onSelectSection={(id:string) => {handleScrollToSegment(id);setShowTOCMobile(false);}} onClose={() => setShowTOCMobile(false)}/>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Middle/Main Grid Column: Document Viewer and Editor list */}
        <div className="rp-content">
          
          {/* Admin panel injection if active */}
          {isAdmin && (
            <AdminPanel
              board={board}
              onUpdateBoard={handleUpdateBoard}
              schools={schools}
              onUpdateSchools={handleUpdateSchoolsList}
              onResetAllData={handleResetAllData}
              sections={sections}
              onUpdateSections={async (updatedSections) => {
                setSections(updatedSections);
                await saveSectionsForVersion(activeVersionId, updatedSections);
              }}
              adminRole={adminRole}
              schoolAdminSchoolId={schoolAdminSchoolId}
              
              // Version control parameters
              versions={versions}
              activeVersionId={activeVersionId}
              onSelectVersion={handleSelectVersion}
              onAddVersion={handleAddVersion}
              onToggleVersionPublish={handleToggleVersionPublish}
              onDeleteVersion={handleDeleteVersion}
            />
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
                  In dit interactieve document vindt u het volledige, goedgekeurde schoolreglement voor het schooljaar <strong>{versions.find((v) => v.id === activeVersionId)?.schoolYear || "2026-2027"}</strong>. Per onderdeel kunt u zien of het behoort tot het algemene provinciale bestuursreglement of specifiek voor deze schoollocatie is vastgelegd.
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

          {/* Compact document context for visitors when no welcome banner is configured */}
          {!isAdmin && board.showWelcomeCard !== true && (
            <section className="schoolreg-intro-card no-print" aria-label="Over dit schoolreglement">
              <div className="schoolreg-intro-icon"><FileText size={20} /></div>
              <div className="schoolreg-intro-copy">
                <span className="schoolreg-intro-eyebrow">OFFICIEEL SCHOOLREGLEMENT</span>
                <h1>{activeSchool?.name || "Schoolreglement"}</h1>
                <p>Schooljaar {versions.find((v) => v.id === activeVersionId)?.schoolYear || "2026-2027"} · Gebruik de zoekfunctie of blader door de hoofdstukken om snel de juiste afspraak te vinden.</p>
              </div>
              <button type="button" className="schoolreg-intro-action" onClick={() => { setShowTOCMobile(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                <Menu size={15} /> Inhoud bekijken
              </button>
            </section>
          )}

          {/* List of active sections */}
          <div className="rp-document-list">
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
                    isActive={activeSectionId === section.id}
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
          schoolYear={versions.find((v) => v.id === activeVersionId)?.schoolYear}
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

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 border flex items-center justify-center group no-print animate-fade-in"
          style={{ 
            backgroundColor: "white", 
            borderColor: "rgba(0,0,0,0.08)",
            color: board.primaryColor || "#D6AD00"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = board.primaryColor || "#D6AD00";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.borderColor = board.primaryColor || "#D6AD00";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = board.primaryColor || "#D6AD00";
            e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
          }}
          title="Terug naar boven"
          id="back-to-top-btn"
        >
          <ArrowUp size={20} className="stroke-[2.5] transition-transform group-hover:-translate-y-0.5" />
        </button>
      )}

    </div>
  );
}
