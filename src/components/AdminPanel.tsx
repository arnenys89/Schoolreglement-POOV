import React, { useState } from "react";
import { School, SchoolBoard, RegulationSection, RegulationVersion, ChangeLogEntry } from "../types";
import { lucideNames } from "../data/mockData";
import DiffViewer from "./DiffViewer";
import { 
  Building, Settings2, Plus, Edit2, Check, X, Shield, RefreshCw, 
  Palette, Grid, List, Layers, Eye, EyeOff, Trash2, Heart, Award, 
  HelpCircle, Laptop, Clock, ShieldAlert, Euro, FileText, Sparkles, BookOpen, CalendarCheck,
  ChevronDown, ChevronUp
} from "lucide-react";
import LucideIcon from "./LucideIcon";

interface AdminPanelProps {
  board: SchoolBoard;
  onUpdateBoard: (updated: SchoolBoard) => void;
  schools: School[];
  onUpdateSchools: (updated: School[]) => void;
  onResetAllData: () => void;
  sections: RegulationSection[];
  onUpdateSections: (updated: RegulationSection[]) => void;
  adminRole?: "none" | "super" | "school";
  schoolAdminSchoolId?: string;

  // Added Version props
  versions: RegulationVersion[];
  activeVersionId: string;
  onSelectVersion: (id: string) => void;
  onAddVersion: (schoolYear: string, cloneFromVersionId: string) => void;
  onToggleVersionPublish: (versionId: string) => void;
  onDeleteVersion: (versionId: string) => void;
}

export default function AdminPanel({
  board,
  onUpdateBoard,
  schools,
  onUpdateSchools,
  onResetAllData,
  sections,
  onUpdateSections,
  adminRole = "super",
  schoolAdminSchoolId = "",
  versions,
  activeVersionId,
  onSelectVersion,
  onAddVersion,
  onToggleVersionPublish,
  onDeleteVersion,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"bestuur" | "scholen" | "inhoud" | "versies" | "logs">("bestuur");
  const [changeLogs, setChangeLogs] = useState<ChangeLogEntry[]>([
    { id: "1", sectionId: "1", timestamp: new Date().toISOString(), adminRole: "superadmin", action: "edit", description: "Titel aangepast" }
  ]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // =========================================================================
  // STATE DEFINITIONS
  // =========================================================================
  
  // Board edit states
  const [boardName, setBoardName] = useState(board.name);
  const [boardAddress, setBoardAddress] = useState(board.address);
  const [boardPhone, setBoardPhone] = useState(board.phone);
  const [boardWebsite, setBoardWebsite] = useState(board.website);
  const [boardNumber, setBoardNumber] = useState(board.number);
  const [primaryColor, setPrimaryColor] = useState(board.primaryColor || "#D6AD00");
  const [secondaryColor, setSecondaryColor] = useState(board.secondaryColor || "#2E2E2E");
  const [logoSubText, setLogoSubText] = useState(board.logoSubText || "PROVINCIE");
  const [logoMainText, setLogoMainText] = useState(board.logoMainText || "Oost-Vlaanderen");
  const [boardLogoUrl, setBoardLogoUrl] = useState(board.logoUrl || "");
  const [showSearchEngine, setShowSearchEngine] = useState(board.showSearchEngine !== false);
  const [showFloatingPdf, setShowFloatingPdf] = useState(board.showFloatingPdf !== false);
  const [showSchoolSelector, setShowSchoolSelector] = useState(board.showSchoolSelector === true);
  const [showWelcomeCard, setShowWelcomeCard] = useState(board.showWelcomeCard === true);

  // New school creation states
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newLogoType, setNewLogoType] = useState<"emoji" | "abbreviation" | "custom_url">("emoji");
  const [newLogoValue, setNewLogoValue] = useState("🏫");

  // School editing state
  const [activeEditingSchoolId, setActiveEditingSchoolId] = useState<string | null>(null);
  const [editSchoolName, setEditSchoolName] = useState("");
  const [editSchoolAddress, setEditSchoolAddress] = useState("");
  const [editSchoolPhone, setEditSchoolPhone] = useState("");
  const [editSchoolEmail, setEditSchoolEmail] = useState("");
  const [editSchoolWebsite, setEditSchoolWebsite] = useState("");
  const [editSchoolLogoType, setEditSchoolLogoType] = useState<"emoji" | "abbreviation" | "custom_url">("emoji");
  const [editSchoolLogoValue, setEditSchoolLogoValue] = useState("");

  // New Section creation states (Inhoudstabel)
  const [activeDiffSection, setActiveDiffSection] = useState<string | null>(null);
  const [newSecTitle, setNewSecTitle] = useState("");
  const [newSecChapter, setNewSecChapter] = useState(1);
  const [newSecNumber, setNewSecNumber] = useState("");
  const [newSecLevel, setNewSecLevel] = useState<1 | 2 | 3>(2);
  const [newSecIcon, setNewSecIcon] = useState("FileText");
  const [newSecText, setNewSecText] = useState("");
  const [newSecVisibleSchools, setNewSecVisibleSchools] = useState<string[]>(schools.map(s => s.id));

  // Version management states (Schooljaren)
  const [newSchoolYear, setNewSchoolYear] = useState("");
  const [cloneFromVersionId, setCloneFromVersionId] = useState("");

  // Preset color patterns for Board levels
  const colorPresets = [
    { name: "Provinciaal Goud", primary: "#D6AD00", secondary: "#2E2E2E" },
    { name: "Klassiek Blauw", primary: "#1d4ed8", secondary: "#1e293b" },
    { name: "Modern Groen", primary: "#059669", secondary: "#0f172a" },
    { name: "Sjiek Bordeaux", primary: "#991b1b", secondary: "#1c1917" },
    { name: "Technisch Indigo", primary: "#4f46e5", secondary: "#1e1b4b" },
  ];

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleUpdateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminRole === "school") return;
    onUpdateBoard({
      ...board,
      name: boardName,
      address: boardAddress,
      phone: boardPhone,
      website: boardWebsite,
      number: boardNumber,
      primaryColor,
      secondaryColor,
      logoSubText,
      logoMainText,
      logoUrl: boardLogoUrl,
      showSearchEngine,
      showFloatingPdf,
      showSchoolSelector,
      showWelcomeCard,
    });
  };

  const selectColorPreset = (p: { primary: string, secondary: string }) => {
    if (adminRole === "school") return;
    setPrimaryColor(p.primary);
    setSecondaryColor(p.secondary);
  };

  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminRole === "school") return;
    if (!newId || !newName) return;
    
    if (schools.some((s) => s.id === newId)) {
      alert("Fout: Instellingsnummer bestaat reeds!");
      return;
    }

    const updated = [
      ...schools,
      {
        id: newId,
        name: newName,
        address: newAddress,
        phone: newPhone,
        email: newEmail,
        website: newWebsite,
        logoType: newLogoType,
        logoValue: newLogoValue,
      },
    ];

    onUpdateSchools(updated);
    
    // Clear
    setNewId("");
    setNewName("");
    setNewAddress("");
    setNewPhone("");
    setNewEmail("");
    setNewWebsite("");
    setNewLogoType("emoji");
    setNewLogoValue("🏫");
  };

  const startEditSchool = (sc: School) => {
    if (adminRole === "school" && sc.id !== schoolAdminSchoolId) return;
    setActiveEditingSchoolId(sc.id);
    setEditSchoolName(sc.name);
    setEditSchoolAddress(sc.address);
    setEditSchoolPhone(sc.phone);
    setEditSchoolEmail(sc.email);
    setEditSchoolWebsite(sc.website);
    setEditSchoolLogoType(sc.logoType || "emoji");
    setEditSchoolLogoValue(sc.logoValue || "🏫");
  };

  const saveEditSchool = (scId: string) => {
    if (adminRole === "school" && scId !== schoolAdminSchoolId) return;
    const updated = schools.map((s) => {
      if (s.id === scId) {
        return {
          ...s,
          name: editSchoolName,
          address: editSchoolAddress,
          phone: editSchoolPhone,
          email: editSchoolEmail,
          website: editSchoolWebsite,
          logoType: editSchoolLogoType,
          logoValue: editSchoolLogoValue,
        };
      }
      return s;
    });
    onUpdateSchools(updated);
    setActiveEditingSchoolId(null);
  };

  const handleDeleteSchool = (scId: string) => {
    if (adminRole === "school") return;
    if (confirm("Weet u zeker dat u deze campus wilt verwijderen uit de lijst?")) {
      const updated = schools.filter((s) => s.id !== scId);
      onUpdateSchools(updated);
    }
  };

  // Add / Remove sections (Inhoudstabel)
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminRole === "school") return;
    if (!newSecTitle || !newSecNumber) {
      alert("Vul a.u.b. een titel en paragraafnummer in.");
      return;
    }

    if (sections.some(s => s.id === newSecNumber || s.sectionNumber === newSecNumber)) {
      alert("Fout: Dat paragraafnummer bestaat al!");
      return;
    }

    const newSection: RegulationSection = {
      id: newSecNumber,
      title: newSecTitle,
      chapterNumber: Number(newSecChapter),
      sectionNumber: newSecNumber,
      level: Number(newSecLevel),
      type: 'text',
      icon: newSecIcon,
      isGlobal: true,
      visibleSchools: newSecVisibleSchools,
      isSchoolSpecificText: false,
      globalText: newSecText || "Nieuwe provinciale regelgeving tekst...",
      schoolSpecificText: {},
    };

    const updated = [...sections, newSection];
    onUpdateSections(updated);

    // Reset
    setNewSecTitle("");
    setNewSecNumber("");
    setNewSecText("");
  };

  const handleDeleteSection = (secId: string) => {
    if (adminRole === "school") return;
    if (confirm("Weet u zeker dat u dit onderdeel permanent wilt wissen uit de inhoudstabel?")) {
      const updated = sections.filter(s => s.id !== secId);
      onUpdateSections(updated);
    }
  };

  const toggleSectionVisibleSchool = (schoolId: string) => {
    if (newSecVisibleSchools.includes(schoolId)) {
      setNewSecVisibleSchools(newSecVisibleSchools.filter(id => id !== schoolId));
    } else {
      setNewSecVisibleSchools([...newSecVisibleSchools, schoolId]);
    }
  };

  return (
    <section 
      className={`bg-white border border-gray-250 mb-8 no-print rounded-2xl shadow-sm transition-all duration-200 ${
        isExpanded ? "p-5 md:p-8" : "p-4 md:p-5"
      }`}
      style={{ borderLeft: `6px solid ${primaryColor}` }}
    >
      <div className={`max-w-7xl mx-auto ${isExpanded ? "space-y-6" : ""}`}>
        
        {/* Header row */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none group ${
            isExpanded ? "pb-4 border-b border-gray-200" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <Shield className="text-gray-700 shrink-0 transition-transform group-hover:scale-105" size={20} style={{ color: primaryColor }} />
            <div>
              <h2 className="text-gray-900 font-display font-bold text-base tracking-wide flex items-center gap-2">
                <span>Beheerder Configuratiescherm</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold transition-all ${
                  isExpanded ? "bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse" : "bg-gray-100 text-gray-600 border border-gray-205"
                }`}>
                  {isExpanded ? "Actief" : "Ingeklapt"}
                </span>
              </h2>
              <p className="text-[11px] text-gray-500 font-normal">
                Pas instellingen aan op bestuursniveau (huisstijl, kleuren, elementen, inhoudstabel) of per schoolniveau.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onResetAllData}
              className="px-3 py-1.5 text-[11px] text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-650 rounded-md cursor-pointer transition-all flex items-center justify-center gap-1 font-semibold bg-red-50/50"
            >
              <RefreshCw size={11} /> Reset alle datavelden
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-gray-700 flex items-center justify-center cursor-pointer"
              aria-label={isExpanded ? "Inklappen" : "Uitklappen"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-6 animate-fade-in pt-2">

        {/* Dynamic Navigation Tabs inside Admin Panel */}
        <div className="flex border-b border-gray-200 gap-1 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab("bestuur")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "bestuur"
                ? "bg-gray-100 text-gray-900 border-t-2"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            style={activeTab === "bestuur" ? { borderTopColor: primaryColor } : {}}
          >
            <Building size={14} />
            <span>Bestuursniveau &amp; Huisstijl</span>
          </button>

          <button
            onClick={() => setActiveTab("scholen")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "scholen"
                ? "bg-gray-100 text-gray-900 border-t-2"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            style={activeTab === "scholen" ? { borderTopColor: primaryColor } : {}}
          >
            <Layers size={14} />
            <span>Schoolniveau &amp; Logos</span>
          </button>

          <button
            onClick={() => setActiveTab("inhoud")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "inhoud"
                ? "bg-gray-100 text-gray-900 border-t-2"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            style={activeTab === "inhoud" ? { borderTopColor: primaryColor } : {}}
          >
            <List size={14} />
            <span>Inhoudstabel &amp; Artikelen</span>
          </button>

          <button
            onClick={() => setActiveTab("versies")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "versies"
                ? "bg-gray-100 text-gray-900 border-t-2"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            style={activeTab === "versies" ? { borderTopColor: primaryColor } : {}}
          >
            <CalendarCheck size={14} />
            <span>Reglement Versiebeheer</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "bg-gray-100 text-gray-900 border-t-2"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            style={activeTab === "logs" ? { borderTopColor: primaryColor } : {}}
          >
            <Clock size={14} />
            <span>Wijzigingenlog</span>
          </button>
        </div>

        {activeTab === "logs" && (
          <div className="bg-gray-55/70 border border-gray-200 rounded-xl p-5 md:p-6 animate-fade-in">
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-4">
                <Clock size={14} /> Wijzigingenlog
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase text-[9px] font-mono">
                      <th className="p-3">Tijdstip</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3">Actie</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {changeLogs.map(log => (
                      <tr key={log.id}>
                        <td className="p-3 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 capitalize">{log.adminRole}</td>
                        <td className="p-3 capitalize">{log.action}</td>
                        <td className="p-3">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}
        {activeTab === "bestuur" && (
          <div className="space-y-4 animate-fade-in">
            {adminRole === "school" && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl font-medium flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Schoolbeheerder modus:</strong> U heeft alleen-lezen toegang tot de bestuursinstellingen en de huisstijl. Neem contact op met het provinciaal bestuur om de algemene instellingen te wijzigen.
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side: branding properties & colors */}
              <fieldset disabled={adminRole === "school"} className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-4">
                  <Palette size={14} /> Huisstijl &amp; Kleuren
                </h3>

                {/* Preset Themes */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 leading-none">
                    Selecteer Huisstijl Preset
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPresets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectColorPreset(preset)}
                        className="px-2.5 py-1.5 rounded text-[10px] font-medium border text-gray-600 hover:bg-white flex items-center gap-1.5 transition-all cursor-pointer"
                        style={{ borderColor: preset.primary === primaryColor ? primaryColor : "transparent" }}
                      >
                        <span 
                          className="w-3 h-3 rounded-full inline-block border border-black/10 shrink-0" 
                          style={{ backgroundColor: preset.primary }} 
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Picking sliders/inputs */}
                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Kleur Accent (Primair)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono rounded border border-gray-300"
                        placeholder="#D6AD00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Achtergrond (Secundair)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono rounded border border-gray-300"
                        placeholder="#2E2E2E"
                      />
                    </div>
                  </div>
                </div>

                {/* Left logo customization */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Swoosh Logo Bovenkop
                    </label>
                    <input
                      type="text"
                      value={logoSubText}
                      onChange={(e) => setLogoSubText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs"
                      placeholder="e.g. PROVINCIE"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Swoosh Logo Hoofdkop
                    </label>
                    <input
                      type="text"
                      value={logoMainText}
                      onChange={(e) => setLogoMainText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs"
                      placeholder="e.g. Oost-Vlaanderen"
                    />
                  </div>
                </div>

                {/* Bestuurs Logo URL */}
                <div className="mt-4 pt-4 border-t border-gray-150">
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                    Officiële Logo URL Bestuur
                  </label>
                  <input
                    type="text"
                    value={boardLogoUrl}
                    onChange={(e) => setBoardLogoUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs font-mono"
                    placeholder="https://upload.wikimedia.org/wikipedia/commons/2/23/Logo_Oost-Vlaanderen.svg"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Directe link naar het logo-beeld van het bestuur. Dit is zichtbaar in de header en op het voorblad van het PDF-document.
                  </p>
                </div>

              </div>

              {/* Layout Elements visibility configs */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-4">
                  <Grid size={14} /> Actieve Lay-out Elementen
                </h3>

                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showSearchEngine}
                      onChange={(e) => setShowSearchEngine(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 mt-0.5"
                      style={{ color: primaryColor }}
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-805 block">
                        Ouder Snelzoeker tonen (Snelzoeker Hulp voor Ouders)
                      </span>
                      <span className="text-[10px] text-gray-500 block leading-tight">
                        Indien uitgevinkt, blijft het zoekveld bovenaan onzichtbaar voor ouders in de weergave.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showFloatingPdf}
                      onChange={(e) => setShowFloatingPdf(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 mt-0.5"
                      style={{ color: primaryColor }}
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-805 block">
                        Zwevende PDF print-toets tonen voor ouders
                      </span>
                      <span className="text-[10px] text-gray-500 block leading-tight">
                        Toont een makkelijke print-toets in de rechterbovenhoek van het scherm voor snelle PDF downloads.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showSchoolSelector}
                      onChange={(e) => setShowSchoolSelector(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 mt-0.5"
                      style={{ color: primaryColor }}
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-805 block">
                        Campus-kiezer tonen voor ouders
                      </span>
                      <span className="text-[10px] text-gray-500 block leading-tight">
                        Indien aangevinkt, kunnen ouders wisselen van campus via het keuzemenu.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showWelcomeCard}
                      onChange={(e) => setShowWelcomeCard(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 mt-0.5"
                      style={{ color: primaryColor }}
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-805 block">
                        Campus-welkomstkaart tonen voor ouders
                      </span>
                      <span className="text-[10px] text-gray-500 block leading-tight">
                        Toont een kleurrijke presentatie-kaart met de geselecteerde campusnaam en metadata bovenaan.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Right side: standard board parameters form */}
            <form onSubmit={handleUpdateBoard} className="bg-gray-55/60 border border-gray-200 rounded-xl p-5 md:p-6 space-y-4">
              <fieldset disabled={adminRole === "school"} className="space-y-4 w-full">
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Building size={14} /> Officiële Bestuursgegevens
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                    Officiële Bestuursnaam
                  </label>
                  <input
                    type="text"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                    Instellingsnummer Bestuur
                  </label>
                  <input
                    type="text"
                    value={boardNumber}
                    onChange={(e) => setBoardNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                    Telefoonnummer
                  </label>
                  <input
                    type="text"
                    value={boardPhone}
                    onChange={(e) => setBoardPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                    Adres Hoofdzetel
                  </label>
                  <input
                    type="text"
                    value={boardAddress}
                    onChange={(e) => setBoardAddress(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                    Website (Bestuur)
                  </label>
                  <input
                    type="text"
                    value={boardWebsite}
                    onChange={(e) => setBoardWebsite(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs"
                  />
                </div>
              </div>
            </fieldset>

            <div className="flex justify-end pt-3 border-t border-gray-200 w-full">
              {adminRole === "school" ? (
                <span className="text-xs text-amber-600 font-medium italic">Alleen-lezen voor schoolbeheerders</span>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 rounded font-semibold text-white text-xs cursor-pointer shadow-sm dynamic-bg-primary dynamic-hover-bg-primary"
                >
                  Bestuursgegevens &amp; Huisstijl Bewaren
                </button>
              )}
            </div>
          </form>
          </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: SCHOOLNIVEAU CONFIG (Campuses, Names, customizable school logos)
            ========================================================================= */}
        {activeTab === "scholen" && (
          <div className="space-y-6 animate-fade-in">
            {adminRole === "school" && (
              <div className="bg-amber-55 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl font-medium flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Schoolbeheerder modus:</strong> U kunt enkel de contactgegevens en het logo van uw eigen geselecteerde campus (<strong>{schools.find((s) => s.id === schoolAdminSchoolId)?.name || "eigen campus"}</strong>) aanpassen. Het aanmaken of verwijderen van campussen is uitgeschakeld.
                </span>
              </div>
            )}
            {/* List and Customization of existing schools */}
            <div className="bg-gray-55/70 border border-gray-200 rounded-xl p-5 md:p-6">
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-4">
                <Layers size={14} /> Schoolcampussen &amp; Logo's Beheren
              </h3>

              <div className="overflow-x-auto select-none">
                <table className="w-full text-xs font-sans text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase text-[9px] font-mono">
                      <th className="p-3 w-16">InstellingsID</th>
                      <th className="p-3 w-52">Campusnaam</th>
                      <th className="p-3 w-64">Logo &amp; Embleem</th>
                      <th className="p-3">Adres</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 w-24 text-right">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {schools.map((school) => {
                      const isEditing = activeEditingSchoolId === school.id;
                      return (
                        <tr key={school.id} className="hover:bg-gray-50/50">
                          {/* ID */}
                          <td className="p-3 font-mono font-semibold text-gray-700 align-middle">
                            {school.id}
                          </td>

                          {/* NAME */}
                          <td className="p-3 align-middle font-medium">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editSchoolName}
                                onChange={(e) => setEditSchoolName(e.target.value)}
                                className="px-2 py-1 rounded border border-gray-300 w-full text-xs"
                                required
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{school.name}</span>
                              </div>
                            )}
                          </td>

                          {/* SCHOOL LOGO CUSTOMIZATION */}
                          <td className="p-3 align-middle">
                            {isEditing ? (
                              <div className="flex flex-col gap-1 inline-block">
                                <select
                                  value={editSchoolLogoType}
                                  onChange={(e: any) => setEditSchoolLogoType(e.target.value)}
                                  className="text-[10px] p-1 border border-gray-300 rounded bg-white"
                                >
                                  <option value="emoji">Emoji Embleem (🏫, 🎓, etc.)</option>
                                  <option value="abbreviation">Afkorting (RPT, Hen, etc.)</option>
                                  <option value="custom_url">Logo URL (PNG/SVG)</option>
                                </select>
                                <input
                                  type="text"
                                  value={editSchoolLogoValue}
                                  onChange={(e) => setEditSchoolLogoValue(e.target.value)}
                                  className="p-1 text-[10px] border border-gray-300 rounded w-full font-mono mt-0.5"
                                  placeholder={editSchoolLogoType === "emoji" ? "e.g. 🏫" : editSchoolLogoType === "abbreviation" ? "e.g. RPT" : "https://logo.png"}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-mono font-bold text-xs shadow-3xs overflow-hidden shrink-0">
                                  {school.logoType === "custom_url" && school.logoValue ? (
                                    <img src={school.logoValue} alt="Logo" className="object-cover w-full h-full" />
                                  ) : school.logoType === "abbreviation" && school.logoValue ? (
                                    <span className="text-[10px] text-gray-700 font-extrabold">{school.logoValue}</span>
                                  ) : (
                                    <span className="text-sm">{school.logoValue || "🏫"}</span>
                                  )}
                                </div>
                                <div className="flex flex-col leading-none">
                                  <span className="text-[10px] text-gray-400 uppercase font-mono font-bold">Ingesteld type:</span>
                                  <span className="text-[11px] text-gray-700 font-medium">{school.logoType || "emoji"}</span>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* ADDRESS */}
                          <td className="p-3 align-middle">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editSchoolAddress}
                                onChange={(e) => setEditSchoolAddress(e.target.value)}
                                className="px-2 py-1 rounded border border-gray-300 w-full text-xs"
                              />
                            ) : (
                              <span className="text-gray-650 truncate max-w-xs block">{school.address}</span>
                            )}
                          </td>

                          {/* CONTACTS */}
                          <td className="p-3 align-middle space-y-0.5">
                            {isEditing ? (
                              <>
                                <input
                                  type="text"
                                  value={editSchoolPhone}
                                  onChange={(e) => setEditSchoolPhone(e.target.value)}
                                  className="px-1.5 py-0.5 rounded border border-gray-300 w-full text-[11px]"
                                  placeholder="Tel."
                                />
                                <input
                                  type="email"
                                  value={editSchoolEmail}
                                  onChange={(e) => setEditSchoolEmail(e.target.value)}
                                  className="px-1.5 py-0.5 rounded border border-gray-300 w-full text-[11px]"
                                  placeholder="Bestuursmail"
                                />
                                <input
                                  type="text"
                                  value={editSchoolWebsite}
                                  onChange={(e) => setEditSchoolWebsite(e.target.value)}
                                  className="px-1.5 py-0.5 rounded border border-gray-300 w-full text-[11px]"
                                  placeholder="Website URL"
                                />
                              </>
                            ) : (
                              <div className="text-[10px] font-mono leading-relaxed text-gray-500">
                                <div>{school.phone}</div>
                                <div className="text-gray-400">{school.email}</div>
                              </div>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="p-3 align-middle text-right">
                            <div className="flex justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => saveEditSchool(school.id)}
                                    className="p-1 px-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded transition-colors cursor-pointer font-bold"
                                    title="Bewaren"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => setActiveEditingSchoolId(null)}
                                    className="p-1 px-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                                    title="Annuleren"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {!(adminRole === "school" && school.id !== schoolAdminSchoolId) && (
                                    <button
                                      onClick={() => startEditSchool(school)}
                                      className="p-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer transition-all"
                                      title="Bewerk campus details"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                  )}
                                  {adminRole !== "school" && (
                                    <button
                                      onClick={() => handleDeleteSchool(school.id)}
                                      className="p-1 text-red-650 hover:text-white hover:bg-red-600 bg-red-50 rounded cursor-pointer transition-all"
                                      title="Wis campus"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                  {adminRole === "school" && school.id !== schoolAdminSchoolId && (
                                    <span className="text-[10px] text-gray-400 italic">Alleen-lezen</span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form: Add New School Campus */}
            {adminRole !== "school" && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-4">
                <Plus size={15} /> Nieuwe Schoollocatie Toevoegen
              </h3>

              <form onSubmit={handleAddSchool} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                    Instellingsnummer / School ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 36467"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-gray-300 focus:border-[#D6AD00]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                    Volledige Naam van School
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Richtpunt campus Eeklo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-gray-300 focus:border-[#D6AD00]"
                  />
                </div>

                {/* New School Logo fields */}
                <div>
                  <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                    School logo-teken
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={newLogoType}
                      onChange={(e: any) => setNewLogoType(e.target.value)}
                      className="text-xs p-1.5 border border-gray-300 rounded bg-white w-1/2"
                    >
                      <option value="emoji">Emoji (🏫)</option>
                      <option value="abbreviation">Afkorting (RPT)</option>
                      <option value="custom_url">Logo URL</option>
                    </select>
                    <input
                      type="text"
                      placeholder="e.g. 🏫 of RPT"
                      value={newLogoValue}
                      onChange={(e) => setNewLogoValue(e.target.value)}
                      className="w-1/2 p-1.5 text-xs border border-gray-300 rounded font-mono"
                    />
                  </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Adres van de campus
                    </label>
                    <input
                      type="text"
                      placeholder="Roze 131, 9900 Eeklo"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Telefoon
                    </label>
                    <input
                      type="text"
                      placeholder="09 376 71 11"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      placeholder="eeklo@richtpunt.be"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://richtpunt.be/eeklo"
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
                    />
                  </div>

                  <div className="flex items-end justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 h-9 dynamic-bg-primary dynamic-hover-bg-primary"
                    >
                      <Plus size={15} /> Campus Toevoegen
                    </button>
                  </div>
                </div>
              </form>
            </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: INHOUDSTABEL & SECTIES CONFIG (General structure of regulations)
            ========================================================================= */}
        {activeTab === "inhoud" && (
          <div className="space-y-6 animate-fade-in select-none">
            {adminRole === "school" && (
              <div className="bg-amber-55 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl font-medium flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Schoolbeheerder modus:</strong> U kunt de indeling van de inhoudstabel niet bewerken. Om de provinciale of schooleigen tekst van individuele artikelen aan te passen, gebruikt u de handige bewerktoetsen direct bij elk artikel onderaan de pagina.
                </span>
              </div>
            )}

            {/* Create new article / section form */}
            {adminRole !== "school" && (
              <div className="bg-gray-55/70 border border-gray-200 rounded-xl p-5 md:p-6 mt-6">
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-4">
                <Plus size={15} /> Nieuw Reglement Artikel/Paragraaf Toevoegen
              </h3>

              <form onSubmit={handleAddSection} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Onderdeeltitel
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Internaat &amp; verblijf"
                      value={newSecTitle}
                      onChange={(e) => setNewSecTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Paragraafnummer / Code ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1.8 of 6.2.2"
                      value={newSecNumber}
                      onChange={(e) => setNewSecNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-gray-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Hoofdstuk Nummer (Int)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1"
                      value={newSecChapter}
                      onChange={(e) => setNewSecChapter(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Hiërarchisch Niveau
                    </label>
                    <select
                      value={newSecLevel}
                      onChange={(e: any) => setNewSecLevel(Number(e.target.value) as 1 | 2 | 3)}
                      className="text-xs p-1.5 border border-gray-300 rounded bg-white w-full"
                    >
                      <option value="1">Niveau 1: Hoofdstuk (Groot)</option>
                      <option value="2">Niveau 2: Paragraaf (Medium)</option>
                      <option value="3">Niveau 3: Subparagraaf (Klein)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                  {/* Select Icon */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Icoon voor Artikel
                    </label>
                    <select
                      value={newSecIcon}
                      onChange={(e) => setNewSecIcon(e.target.value)}
                      className="text-xs p-1.5 border border-gray-300 rounded bg-white w-full"
                    >
                      {lucideNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select visible schools */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Beschikbaar stellen voor Campussen
                    </label>
                    <div className="flex flex-wrap gap-2 p-1.5 border border-gray-200 bg-white rounded-lg max-h-24 overflow-y-auto">
                      {schools.map(school => {
                        const isChecked = newSecVisibleSchools.includes(school.id);
                        return (
                          <label key={school.id} className="flex items-center gap-1.5 text-[10px] text-gray-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSectionVisibleSchool(school.id)}
                              className="rounded text-amber-500 text-[10px]"
                            />
                            <span>{school.name.replace("Richtpunt campus ", "")}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Textarea detail text */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                      Standaard Gedeelde / Provinciale Tekstinhoud
                    </label>
                    <textarea
                      value={newSecText}
                      onChange={(e) => setNewSecText(e.target.value)}
                      className="w-full p-2.5 text-xs rounded border border-gray-300 h-20 font-sans"
                      placeholder="Voer hier de algemene tekst in..."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 dynamic-bg-primary dynamic-hover-bg-primary"
                  >
                    <Plus size={14} /> Artikel Toevoegen aan Inhoudstabel
                  </button>
                </div>
              </form>
            </div>
            )}

            {/* List of current sections with quick delete or details overview */}
            <div className="bg-gray-55 border border-gray-200 rounded-xl p-5 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <BookOpen size={14} /> Inhoudstabel Layout Structuur ({sections.length} artikelen)
                </h3>
                <span className="text-[10px] font-mono text-gray-400">
                  Klik op bewerken in de documentenlijst hieronder om inhoud aan te passen.
                </span>
              </div>

              <div className="space-y-2 pr-1 max-h-96 overflow-y-auto">
                {[...sections]
                  .sort((a, b) => {
                    const aParts = a.sectionNumber.split(".").map(Number);
                    const bParts = b.sectionNumber.split(".").map(Number);
                    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                      const aVal = aParts[i] || 0;
                      const bVal = bParts[i] || 0;
                      if (aVal !== bVal) return aVal - bVal;
                    }
                    return 0;
                  })
                  .map((subSec) => (
                    <div 
                      key={subSec.id}
                      className="p-3 bg-white border border-gray-200 rounded-lg shadow-3xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0">
                          <LucideIcon name={subSec.iconName || subSec.icon} size={15} className="text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-semibold bg-gray-100 px-1 rounded text-gray-500">
                              Art. {subSec.sectionNumber}
                            </span>
                            <span className="text-xs font-semibold text-gray-900 truncate">
                              {subSec.title}
                            </span>
                            <span className="text-[9px] text-gray-400 font-sans">
                              (Level {subSec.level}, Hfst. {subSec.chapterNumber})
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-sans truncate pr-4 max-w-xl mt-0.5">
                            {subSec.globalText}
                          </p>
                          {subSec.updatedAt && (
                            <p className="text-[9px] text-gray-400 font-mono italic mt-1">Laatst bewerkt: {new Date(subSec.updatedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Visible count */}
                        <span className="text-[10px] text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-150">
                          {subSec.visibleSchools.length} campussen
                        </span>
                        
                        <button
                          onClick={() => setActiveDiffSection(subSec.id)}
                          className="text-[10px] bg-gray-100 hover:bg-gray-200 p-1 rounded transition-colors"
                        >
                          Verschillen
                        </button>

                        {adminRole !== "school" && (
                          <button
                            onClick={() => handleDeleteSection(subSec.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                            title="Volledig verwijderen"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {activeDiffSection && (
              <DiffViewer
                sectionId={activeDiffSection}
                versions={versions}
                onClose={() => setActiveDiffSection(null)}
              />
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: REGLEMENT VERSIEBEHEER (Version management per school year)
            ========================================================================= */}
        {activeTab === "versies" && (
          <div className="space-y-6 animate-fade-in select-none">
            {adminRole === "school" && (
              <div className="bg-amber-55 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl font-medium flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Schoolbeheerder modus:</strong> U kunt geen nieuwe reglementsversies beheren, aanmaken of de weergavestatus wijzigen. Dit is exclusief voorbehouden aan de Bestuurbeheerder (super-admin). U kunt wel de actieve versie selecteren om de schooleigen teksten van dat jaar in te zien of te bewerken.
                </span>
              </div>
            )}

            {/* Create new version form */}
            {adminRole === "super" && (
              <div className="bg-gray-55/70 border border-gray-200 rounded-xl p-5 md:p-6 mt-6">
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-4">
                  <Plus size={15} /> Nieuwe Reglementsversie / Schooljaar Aanmaken
                </h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newSchoolYear.trim()) {
                      alert("Vul a.u.b. een schooljaar in.");
                      return;
                    }
                    const yearRegex = /^\d{4}-\d{4}$/;
                    if (!yearRegex.test(newSchoolYear.trim())) {
                      if (!confirm(`U heeft "${newSchoolYear}" ingevuld. Het is aanbevolen de vorm YYYY-YYYY te gebruiken (bijv. 2027-2028). Wilt u toch doorgaan met deze naam?`)) {
                        return;
                      }
                    }
                    onAddVersion(newSchoolYear.trim(), cloneFromVersionId);
                    setNewSchoolYear("");
                    setCloneFromVersionId("");
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                        Schooljaar van de versie (bijv. 2027-2028)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2027-2028"
                        value={newSchoolYear}
                        onChange={(e) => setNewSchoolYear(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase font-mono text-gray-500 mb-1">
                        Kopieer inhoud uit een bestaande versie (aanbevolen)
                      </label>
                      <select
                        value={cloneFromVersionId}
                        onChange={(e) => setCloneFromVersionId(e.target.value)}
                        className="text-xs p-1.5 border border-gray-300 rounded bg-white w-full h-8"
                      >
                        <option value="">-- Geen kopie (gebruik standaard sjabloon) --</option>
                        {versions.map((v) => (
                          <option key={v.id} value={v.id}>
                            Kopieer alles van Schooljaar {v.schoolYear}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 dynamic-bg-primary dynamic-hover-bg-primary"
                    >
                      <Plus size={14} /> Nieuwe Versie Toevoegen
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of current versions */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5 mb-4">
                <BookOpen size={14} /> Geregistreerde Versies &amp; Status ({versions.length} schooljaren)
              </h3>

              <div className="space-y-3">
                {versions.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Er zijn momenteel geen versies geregistreerd.</p>
                ) : (
                  [...versions]
                    .sort((a, b) => b.schoolYear.localeCompare(a.schoolYear))
                    .map((v) => {
                      const isActive = v.id === activeVersionId;
                      return (
                        <div
                          key={v.id}
                          className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                            isActive
                              ? "border-amber-400 bg-amber-50/25 shadow-xs"
                              : "border-gray-250 bg-gray-55/40"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-sm text-gray-900">
                                Schooljaar {v.schoolYear}
                              </span>
                              {isActive && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-805 border border-amber-200">
                                  Actief Bewerken
                                </span>
                              )}
                              {v.isPublished ? (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <Eye size={10} /> Zichtbaar voor ouders
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                                  <EyeOff size={10} /> Verborgen (Concept)
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-450 font-mono mt-1">
                              ID: {v.id} | Aangemaakt op: {new Date(v.createdAt).toLocaleDateString("nl-NL", { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Activate version button */}
                            {!isActive && (
                              <button
                                onClick={() => onSelectVersion(v.id)}
                                className="px-3 py-1.5 bg-white border border-gray-305 hover:bg-gray-50 text-gray-700 text-xs rounded-lg font-medium shadow-3xs cursor-pointer transition-all"
                              >
                                Selecteer om te bewerken
                              </button>
                            )}

                            {/* Publish toggler for super-admin only */}
                            {adminRole === "super" && (
                              <button
                                onClick={() => onToggleVersionPublish(v.id)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold shadow-3xs cursor-pointer transition-all flex items-center gap-1 border ${
                                  v.isPublished
                                    ? "bg-amber-100 hover:bg-amber-150 text-amber-850 border-amber-200"
                                    : "bg-emerald-600 hover:bg-emerald-705 text-white border-transparent"
                                }`}
                              >
                                {v.isPublished ? (
                                  <>
                                    <EyeOff size={12} /> Maak Verborgen
                                  </>
                                ) : (
                                  <>
                                    <Eye size={12} /> Maak Zichtbaar
                                  </>
                                )}
                              </button>
                            )}

                            {/* Delete version (only super-admin, cannot delete last version, cannot delete active version) */}
                            {adminRole === "super" && (
                              <button
                                disabled={isActive || versions.length <= 1}
                                onClick={() => {
                                  if (confirm(`Weet u absoluut zeker dat u de versie "${v.schoolYear}" definitief wilt wissen? Dit verwijdert alle onderliggende regelgevingen en schooleigen teksten voor dit jaar!`)) {
                                    onDeleteVersion(v.id);
                                  }
                                }}
                                className={`p-2 text-xs rounded-lg transition-all border shrink-0 ${
                                  isActive || versions.length <= 1
                                    ? "text-gray-350 bg-gray-100 border-gray-205 cursor-not-allowed"
                                    : "text-red-650 hover:bg-red-50 hover:text-red-700 border-red-200 cursor-pointer"
                                }`}
                                title={isActive ? "U kunt het actieve schooljaar dat u bewerkt niet verwijderen." : "Verwijder dit schooljaar"}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

          </div>
        )}
          </div>
        )}

      </div>
    </section>
  );
}
