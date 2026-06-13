import React, { useState, useEffect } from "react";
import { RegulationSection, School, SchoolBoard } from "../types";
import { defaultSchools, lucideNames } from "../data/mockData";
import LucideIcon from "./LucideIcon";
import { Edit, Save, X, Globe, EyeOff, Eye, Sparkles, HelpCircle, CornerDownRight, Volume2, VolumeX } from "lucide-react";

interface SectionItemProps {
  key?: string;
  section: RegulationSection;
  activeSchoolId: string;
  isAdmin: boolean;
  onUpdateSection: (updated: RegulationSection) => void;
  schools: School[];
  parentSection?: RegulationSection;
  onSelectSection?: (sectionId: string) => void;
  board?: SchoolBoard;
  adminRole?: "none" | "super" | "school";
  schoolAdminSchoolId?: string;
  icon?: string;
  isActive?: boolean;
}

export default function SectionItem({
  section,
  activeSchoolId,
  isAdmin,
  onUpdateSection,
  schools = defaultSchools,
  parentSection,
  onSelectSection,
  board,
  adminRole = "super",
  schoolAdminSchoolId = "",
  icon,
  isActive = false,
}: SectionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showIconPicker, setShowIconIconPicker] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getDutchVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.startsWith("nl-NL") || v.lang.startsWith("nl-BE") || v.lang === "nl") || null;
  };

  const handleSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Helaas ondersteunt uw browser geen voorleesfunctie.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();

      // Clean up brackets or special formatting for better TTS speech
      const cleanText = textToShow.replace(/\[|\]/g, "");
      const speechText = `${section.title}. ${cleanText}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = "nl-NL";

      const nlVoice = getDutchVoice();
      if (nlVoice) {
        utterance.voice = nlVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Buffer state while editing
  const [title, setTitle] = useState(section.title);
  const [isSchoolSpecificText, setIsSchoolSpecificText] = useState(section.isSchoolSpecificText);
  const [globalText, setGlobalText] = useState(section.globalText);
  const [schoolText, setSchoolText] = useState(section.schoolSpecificText[activeSchoolId] || "");
  const [visibleSchools, setVisibleSchools] = useState<string[]>(section.visibleSchools);
  const [editingIcon, setEditingIcon] = useState(section.iconName || section.icon);

  // Check if this section is visible for active school
  const isVisibleForActiveSchool = section.visibleSchools.includes(activeSchoolId);

  // Compute text to show in view mode
  const hasSpecificText = section.isSchoolSpecificText && section.schoolSpecificText[activeSchoolId];
  const textToShow = hasSpecificText ? section.schoolSpecificText[activeSchoolId] : section.globalText;

  const handleSave = () => {
    const updatedSpecificText = { ...section.schoolSpecificText };
    if (isSchoolSpecificText) {
      updatedSpecificText[activeSchoolId] = schoolText;
    }

    onUpdateSection({
      ...section,
      title,
      isSchoolSpecificText,
      globalText,
      schoolSpecificText: updatedSpecificText,
      visibleSchools,
      icon: editingIcon,
      iconName: editingIcon,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset buffer states
    setTitle(section.title);
    setIsSchoolSpecificText(section.isSchoolSpecificText);
    setGlobalText(section.globalText);
    setSchoolText(section.schoolSpecificText[activeSchoolId] || "");
    setVisibleSchools(section.visibleSchools);
    setEditingIcon(section.iconName || section.icon);
    setIsEditing(false);
  };

  const toggleSchoolVisibility = (schoolId: string) => {
    if (visibleSchools.includes(schoolId)) {
      setVisibleSchools(visibleSchools.filter((id) => id !== schoolId));
    } else {
      setVisibleSchools([...visibleSchools, schoolId]);
    }
  };

  // If in view mode and not visible for this school of the board, do not render
  if (!isAdmin && !isVisibleForActiveSchool) {
    return null;
  }

  const getMarginClass = () => {
    if (section.level === 1) return "ml-0";
    if (section.level === 2) return "ml-3 sm:ml-6";
    return "ml-6 sm:ml-12 relative";
  };

  const getBorderLeftStyle = () => {
    if (isEditing) {
      return {
        borderLeftWidth: "5px",
        borderLeftStyle: "solid" as const,
        borderLeftColor: "#F59E0B"
      };
    }
    if (!isVisibleForActiveSchool) {
      return {
        borderLeftWidth: "3.5px",
        borderLeftStyle: "dashed" as const,
        borderLeftColor: "#CBD5E1"
      };
    }
    if (section.level === 1) {
      return {
        borderLeftWidth: "6px",
        borderLeftStyle: "solid" as const,
        borderLeftColor: board?.primaryColor || "#D6AD00"
      };
    }
    if (section.level === 2) {
      return {
        borderLeftWidth: "4px",
        borderLeftStyle: "solid" as const,
        borderLeftColor: "#94A3B8"
      };
    }
    return {
      borderLeftWidth: "3.5px",
      borderLeftStyle: "dashed" as const,
      borderLeftColor: "#CBD5E1"
    };
  };

  const getStyle = () => {
    const baseBorder = getBorderLeftStyle();
    if (isActive && !isEditing) {
      const activeColor = board?.primaryColor || "#D6AD00";
      return {
        ...baseBorder,
        backgroundColor: `${activeColor}0c`, // Soft 5% brand background color glow
        borderTopColor: activeColor,
        borderRightColor: activeColor,
        borderBottomColor: activeColor,
        borderLeftColor: activeColor,
        boxShadow: `0 4px 24px -4px ${activeColor}1a`,
      };
    }
    return baseBorder;
  };

  return (
    <article
      id={`section-view-${section.id}`}
      style={getStyle()}
      className={`relative mb-5 p-4 md:p-6 bg-white border rounded-r-xl transition-all duration-700 ease-in-out ${
        isEditing
          ? "border-amber-400 ring-1 ring-amber-400 shadow-md"
          : !isVisibleForActiveSchool
          ? "border-gray-255 opacity-60 bg-gray-50 border-dashed"
          : isActive
          ? "z-10 scale-[1.005] border-amber-500/30"
          : section.level === 1
          ? "border-gray-200/90 shadow-2xs font-medium"
          : section.level === 2
          ? "border-gray-200/80 shadow-3xs"
          : "border-gray-200/60 shadow-4xs bg-gray-50/20 hover:bg-white"
      } ${getMarginClass()}`}
    >
      {/* Visual branch connecting thread graphic for Sub-paragraphs */}
      {section.level === 3 && !isEditing && (
        <div className="absolute left-[-22px] top-6 w-5 h-5 flex items-center justify-center text-gray-300 pointer-events-none hidden sm:flex select-none">
          <CornerDownRight size={13} className="stroke-[2.5]" style={{ color: board?.primaryColor || "#94A3B8" }} />
        </div>
      )}

      {/* Invisible Warning Badge for Admins */}
      {isAdmin && !isVisibleForActiveSchool && (
        <div className="absolute top-3 right-3 bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
          <EyeOff size={11} />
          <span>Onzichtbaar voor deze campus in Parent Mode</span>
        </div>
      )}

      {/* VIEW MODE */}
      {!isEditing ? (
        <div>
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  color: board?.primaryColor || "#D6AD00",
                  backgroundColor: `${board?.primaryColor || "#D6AD00"}15`
                }}
              >
                <LucideIcon name={section.iconName || section.icon} size={18} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 font-semibold block leading-tight">
                  {section.level === 1 ? "Hoofdstuk" : section.level === 2 ? "Paragraaf" : "Subparagraaf"} {section.sectionNumber}
                </span>
                <h3 className={`font-display font-bold leading-tight flex items-center gap-2 ${
                  section.level === 1 ? "text-lg text-gray-900" : section.level === 2 ? "text-base text-gray-800" : "text-sm text-gray-700"
                }`}>
                  {(section.iconName || icon) && (
                    <LucideIcon name={section.iconName || icon} size={section.level === 1 ? 18 : section.level === 2 ? 16 : 14} className="shrink-0 text-gray-500" />
                  )}
                  <span>{section.title}</span>
                </h3>
              </div>
            </div>

            {/* Badges and Admin edit trigger */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* TTS Read-Aloud Trigger */}
              <button
                onClick={handleSpeech}
                className={`p-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors hover:shadow-2xs select-none ${
                  isSpeaking ? "text-amber-600 bg-amber-50 ring-1 ring-amber-200" : "text-gray-400 hover:text-gray-900"
                }`}
                title={isSpeaking ? "Voorlezen stoppen" : "Voorlezen starten (Tekst-naar-spraak)"}
              >
                {isSpeaking ? (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 font-sans px-1 animate-pulse">
                    <VolumeX size={13} />
                    <span>Stop</span>
                  </div>
                ) : (
                  <Volume2 size={13} />
                )}
              </button>

              {hasSpecificText ? (
                <span className="bg-amber-100/70 text-[#B59300] border border-amber-200/50 text-[10px] font-mono px-2 py-0.5 rounded-full select-none" title="Inhoud is specifiek aangepast voor deze school">
                  Schooleigen
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-[10px] font-mono px-2 py-0.5 rounded-full select-none" title="Inhoud is gedeeld/bestuur-breed">
                  Provinciaal
                </span>
              )}

              {isAdmin && (
                <>
                  {adminRole === "school" && activeSchoolId !== schoolAdminSchoolId ? (
                    <span className="text-[10px] text-gray-400 italic font-medium select-none">Alleen-lezen</span>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-950 cursor-pointer transition-colors hover:shadow-2xs"
                      title="Bewerk dit onderdeel"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Section text body */}
          <p className={`text-xs leading-relaxed font-sans whitespace-pre-wrap pl-11 transition-all duration-300 ${
            isSpeaking 
              ? "text-gray-900 font-medium scale-[1.002] origin-left border-l-2 pl-[42px] border-amber-400/80 bg-amber-55/10 py-1" 
              : "text-gray-600"
          }`}>
            {textToShow}
          </p>
        </div>
      ) : (
        /* EDITING MODE */
        <div className="space-y-4">
          <div className="border-b border-gray-150 pb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="text-amber-400" size={14} />
              Bewerk Paragraaf {section.sectionNumber}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 cursor-pointer flex items-center gap-1"
              >
                <X size={12} /> Annuleren
              </button>
              <button
                onClick={handleSave}
                className="px-2.5 py-1 text-xs bg-[#D6AD00] hover:bg-[#B59300] text-white rounded cursor-pointer flex items-center gap-1 font-semibold"
              >
                <Save size={12} /> Opslaan
              </button>
            </div>
          </div>

          {adminRole !== "school" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title & Icon Picker */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase font-mono mb-1">
                    Onderdeeltitel
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-300 focus:border-[#D6AD00] text-xs"
                  />
                </div>

                {/* Icon Selection Trigger */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase font-mono mb-1">
                    Icoon Huisstijl
                  </label>
                  <button
                    onClick={() => setShowIconIconPicker(!showIconPicker)}
                    className="w-full px-3 py-2 border border-gray-300 rounded hover:border-gray-400 text-left text-xs bg-white cursor-pointer flex items-center justify-between"
                    type="button"
                  >
                    <span className="flex items-center gap-1.5">
                      <LucideIcon name={editingIcon} size={15} />
                      <span>{editingIcon}</span>
                    </span>
                    <span className="text-[#D6AD00] font-semibold text-[10px]">Wijzig</span>
                  </button>

                  {showIconPicker && (
                    <div className="absolute left-0 mt-1 p-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 grid grid-cols-6 gap-1 max-h-40 overflow-y-auto">
                      {lucideNames.map((lucideKey) => (
                        <button
                          key={lucideKey}
                          onClick={() => {
                            setEditingIcon(lucideKey);
                            setShowIconIconPicker(false);
                          }}
                          type="button"
                          className={`p-1.5 rounded hover:bg-gray-100 flex items-center justify-center cursor-pointer ${
                            editingIcon === lucideKey ? "bg-amber-50 text-[#D6AD00]" : "text-gray-600"
                          }`}
                          title={lucideKey}
                        >
                          <LucideIcon name={lucideKey} size={15} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* School Visibility Toggles */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase font-mono mb-1">
                  Zichtbaarheid per Campus
                </label>
                <div className="border border-gray-200 rounded p-2 bg-gray-50 max-h-28 overflow-y-auto space-y-1">
                  {schools.map((school) => {
                    const isSchoolVisible = visibleSchools.includes(school.id);
                    return (
                      <label
                        key={school.id}
                        className="flex items-center gap-2 text-[11px] text-gray-600 hover:text-gray-900 cursor-pointer leading-relaxed"
                      >
                        <input
                          type="checkbox"
                          checked={isSchoolVisible}
                          onChange={() => toggleSchoolVisibility(school.id)}
                          className="rounded text-[#D6AD00] focus:ring-[#D6AD00]"
                        />
                        <span className="truncate">
                          {school.name.replace("Richtpunt campus ", "")} ({school.id})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Overridden Selector */}
          <div className={`border rounded-lg p-3 ${adminRole === "school" ? "bg-gray-100/70 border-gray-200" : "bg-amber-50/50 border-amber-200"}`}>
            <label className={`flex items-center gap-2 select-none ${adminRole === "school" ? "cursor-not-allowed text-gray-500" : "cursor-pointer"}`}>
              <input
                type="checkbox"
                checked={isSchoolSpecificText}
                disabled={adminRole === "school"}
                onChange={(e) => setIsSchoolSpecificText(e.target.checked)}
                className={`rounded text-[#D6AD00] focus:ring-[#D6AD00] ${adminRole === "school" ? "cursor-not-allowed opacity-60" : ""}`}
              />
              <span className={`text-xs font-semibold ${adminRole === "school" ? "text-gray-500" : "text-gray-900"}`}>
                Schooleigen variant inschakelen voor deze campus
              </span>
            </label>
            <p className="text-[11px] text-gray-500 mt-1 pl-5">
              Geminimaliseerde of specifieke tekst die ENKEL op {schools.find((s) => s.id === activeSchoolId)?.name} verschijnt.
              {adminRole === "school" && (
                <span className="block mt-1 text-amber-700 font-medium font-sans">
                  ⚠️ U kunt deze optie niet wijzigen. Alleen de bestuursbeheerder kan wisselen tussen provinciale gedeelde tekst en schooleigen tekst.
                </span>
              )}
            </p>
          </div>

          {/* Texareas Grid */}
          <div className="space-y-3">
            {/* Global Board Text */}
            <div className={isSchoolSpecificText ? "opacity-60" : ""}>
              <label className="block text-[11px] font-bold text-gray-500 uppercase font-mono mb-1 flex items-center justify-between">
                <span>Provinciale Gedeelde Tekst (voor alle campussen)</span>
                {!isSchoolSpecificText && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 font-sans NORMAL">
                    <Globe size={11} /> Actief in weergave
                  </span>
                )}
              </label>
              <textarea
                value={globalText}
                onChange={(e) => setGlobalText(e.target.value)}
                disabled={adminRole === "school"}
                className={`w-full px-3 py-2 rounded border border-gray-300 focus:border-[#D6AD00] text-xs font-sans leading-relaxed h-28 focus:ring-1 focus:ring-[#D6AD00] ${adminRole === "school" ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                placeholder="Voer de gemeenschappelijke provinciale reglementtekst in..."
              />
            </div>

            {/* School Specific overridden text */}
            {isSchoolSpecificText && (
              <div className="bg-amber-50/20 border border-amber-100 rounded-lg p-3">
                <label className="block text-[11px] font-bold text-amber-700 uppercase font-mono mb-1 flex items-center justify-between">
                  <span>Schooleigen Tekst (Enkel voor deze campus)</span>
                  <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 font-sans">
                    <Sparkles size={11} /> Actief in weergave
                  </span>
                </label>
                <textarea
                  value={schoolText}
                  onChange={(e) => setSchoolText(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-amber-300 focus:border-[#D6AD00] text-xs font-sans leading-relaxed h-28 bg-white focus:ring-1 focus:ring-[#D6AD00]"
                  placeholder={`Voer de specifieke regeling in voor ${schools.find((s) => s.id === activeSchoolId)?.name}...`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
