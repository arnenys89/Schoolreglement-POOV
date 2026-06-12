import React from "react";
import { School, SchoolBoard } from "../types";
import { ShieldCheck, User, School as SchoolIcon, Layers, ExternalLink } from "lucide-react";

interface HeaderProps {
  schools: School[];
  activeSchoolId: string;
  onSchoolChange: (id: string) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  board: SchoolBoard;
  adminRole?: "none" | "super" | "school";
  schoolAdminSchoolId?: string;
  onRoleChange?: (role: "none" | "super" | "school", schoolId: string) => void;
}

export default function Header({
  schools,
  activeSchoolId,
  onSchoolChange,
  isAdmin,
  setIsAdmin,
  board,
  adminRole = "none",
  schoolAdminSchoolId = "",
  onRoleChange,
}: HeaderProps) {
  // Find currently active school to display its specific info
  const activeSchool = schools.find((s) => s.id === activeSchoolId) || schools[0];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm no-print">
      {/* Top Banner: Board Info & Admin Trigger */}
      <div className="bg-[#2E2E2E] text-white py-2.5 px-4 sm:px-6 lg:px-8 text-xs flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-mono text-gray-300">
          <span>
            <strong className="text-white font-sans font-semibold">Bestuur:</strong> {board.name}
          </span>
          {adminRole === "school" && schoolAdminSchoolId ? (
            <>
              <span className="hidden md:inline">|</span>
              <span className="font-sans font-bold bg-[#D6AD00] text-gray-950 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider shrink-0">
                Schoolbeheerder: {schools.find((s) => s.id === schoolAdminSchoolId)?.name?.replace("Richtpunt campus ", "") || "Campus"}
              </span>
            </>
          ) : adminRole === "super" ? (
            <>
              <span className="hidden md:inline">|</span>
              <span className="font-sans font-bold bg-amber-500 text-gray-950 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider shrink-0">
                Bestuursbeheerder (Super-Admin)
              </span>
            </>
          ) : (
            <>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">Instelling: {board.number}</span>
              <span className="hidden lg:inline">|</span>
              <span className="hidden lg:inline">{board.address}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-sans font-medium text-[10px] hidden sm:inline">Wissel rol:</span>
              <select
                value={adminRole === "super" ? "super" : `school:${schoolAdminSchoolId}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "super") {
                    onRoleChange?.("super", "");
                  } else if (val.startsWith("school:")) {
                    const schoolId = val.split(":")[1];
                    onRoleChange?.("school", schoolId);
                  }
                }}
                className="bg-gray-800 text-gray-250 font-sans text-[11px] font-semibold border border-gray-705 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#D6AD00] cursor-pointer"
              >
                <option value="super">👑 Bestuursbeheerder (Super)</option>
                {schools.map((s) => (
                  <option key={s.id} value={`school:${s.id}`}>
                    🏫 Schoolbeheerder: {s.name.replace("Richtpunt campus ", "")}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Admin Mode Toggle */}
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
              isAdmin
                ? "bg-[#D6AD00] text-[#2E2E2E] shadow-sm scale-105"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
            id="admin-toggle-btn"
          >
            {isAdmin ? (
              <>
                <ShieldCheck size={14} />
                <span>Afmelden</span>
              </>
            ) : (
              <>
                <User size={14} />
                <span>Aanmelden Beheerder</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Brand & Campus Selection Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand/Logo Area */}
          <div className="flex items-center gap-4">
            {/* Logo of the admin board */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {board.logoUrl ? (
                <img 
                  src={board.logoUrl} 
                  alt={board.name} 
                  className="h-10 md:h-12 w-auto object-contain max-w-[200px]" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C72.1 90 90 72.1 90 50C90 27.9 72.1 10 50 10ZM51.3 75.3C38.6 75.3 30.5 66.8 30.5 54.1C30.5 41.2 39.1 32.5 51.5 32.5C63.6 32.5 71.3 40.7 71.3 52.8C71.3 65.9 63.3 75.3 51.3 75.3Z" fill="#E5A823"/>
                    <path d="M47.5 42C51.5 42 54.5 44.5 54.5 48.5C54.5 52.5 51.5 55 47.5 55C43.5 55 40.5 52.5 40.5 48.5C40.5 44.5 43.5 42 47.5 42Z" fill="#2E2E2E"/>
                    <path d="M48 20C32.1 20 25 35 25 50C25 65 32 80 48 80C51.2 71 50 56 46 48C42 40 37 32 48 20Z" fill="#D6AD00" opacity="0.6"/>
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-widest text-gray-500 font-mono leading-none">PROVINCIE</span>
                    <span className="text-base font-display font-bold text-gray-900 leading-tight">Oost-Vlaanderen</span>
                    <span className="text-[10px] text-gray-500 leading-none">Officieel Provinciaal Onderwijs</span>
                  </div>
                </>
              )}
            </div>

            {/* Separator / Title */}
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            
            <div className="hidden sm:block">
              <span className="text-xs font-mono font-medium text-gray-400 block tracking-wider leading-none">DOCUMENT</span>
              <h1 className="text-lg font-display font-medium text-[#2E2E2E] leading-tight">Schoolreglement 2026-2027</h1>
            </div>
          </div>

          {/* Active Campus Contact Summary Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs w-full md:w-auto md:max-w-md flex flex-col gap-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[#D6AD00] font-semibold font-display">
              <SchoolIcon size={14} />
              <span>{activeSchool.name}</span>
            </div>
            <p className="text-gray-500 leading-none font-mono text-[11px]">{activeSchool.address}</p>
            <div className="flex items-center justify-between text-gray-600 mt-1 font-mono text-[10px] gap-4">
              <span>{activeSchool.phone}</span>
              <a
                href={activeSchool.website}
                target="_blank"
                rel="noreferrer"
                className="text-[#D6AD00] hover:underline flex items-center gap-0.5"
              >
                Website <ExternalLink size={10} />
              </a>
            </div>
          </div>

        </div>

        {/* Campuses Horizontal Navigation Menu (Sublinks) */}
        <div className="mt-5 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2 mb-2 text-xs font-sans font-medium text-gray-400 px-1">
            <Layers size={13} className="text-[#D6AD00]" />
            <span>Selecteer een campus (navigatiemenu / sublinks):</span>
          </div>
          <nav className="flex flex-wrap gap-1.5 md:gap-2">
            {schools.map((school) => {
              const isActive = school.id === activeSchoolId;
              return (
                <button
                  key={school.id}
                  onClick={() => onSchoolChange(school.id)}
                  id={`school-tab-${school.id}`}
                  className={`px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-all text-left flex flex-col justify-center border-l-3 ${
                    isActive
                      ? "bg-amber-50/70 text-[#2E2E2E] border-[#D6AD00] shadow-2xs font-semibold"
                      : "bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border-gray-200"
                  }`}
                  title={`${school.name} - ${school.address}`}
                >
                  <span className={isActive ? "text-[#D6AD00]" : "text-gray-500"}>
                    {school.name.replace("Richtpunt campus ", "Campus ")}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 font-normal">
                    ID: {school.id}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
}
