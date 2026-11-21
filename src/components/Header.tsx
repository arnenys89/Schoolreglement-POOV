import React from "react";
import { School, SchoolBoard, RegulationVersion } from "../types";
import { ShieldCheck, Layers, ExternalLink, BookOpen, ChevronDown } from "lucide-react";

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
  versions: RegulationVersion[];
  activeVersionId: string;
  onVersionChange: (id: string) => void;
}

export default function Header({
  schools, activeSchoolId, onSchoolChange, isAdmin, setIsAdmin, board,
  adminRole = "none",
  versions, activeVersionId, onVersionChange,
}: HeaderProps) {
  const activeSchool = schools.find((s) => s.id === activeSchoolId) || schools[0];

  return (
    <header className="schoolreg-header no-print">
      <div className="schoolreg-header-main">
        <div className="schoolreg-brand">
          <div className="schoolreg-brand-mark">R</div>
          <div className="schoolreg-brand-copy">
            <span className="schoolreg-brand-overline">PROVINCIAAL ONDERWIJS OOST-VLAANDEREN</span>
            <strong>Schoolreglementen</strong>
            <small>{board.name || "Digitaal reglementenplatform"}</small>
          </div>
        </div>

        <div className="schoolreg-header-context">
          <div className="schoolreg-context-school">
            <span className="schoolreg-context-icon"><BookOpen size={15} /></span>
            <div>
              <span className="schoolreg-context-label">HUIDIGE CAMPUS</span>
              <strong>{activeSchool?.name?.replace("Richtpunt campus ", "Campus ") || "Schoolreglement"}</strong>
            </div>
          </div>
          <label className="schoolreg-version-select">
            <span>Schooljaar</span>
            <select value={activeVersionId} onChange={(e) => onVersionChange(e.target.value)}>
              {versions.filter((v) => isAdmin || v.isPublished).map((v) => (
                <option key={v.id} value={v.id}>{v.schoolYear}{!v.isPublished ? " (Concept)" : ""}</option>
              ))}
            </select>
            <ChevronDown size={13} />
          </label>
          {isAdmin && (
            <div className="schoolreg-admin-tools">
              {adminRole === "super" && (
                <span className="schoolreg-admin-pill"><ShieldCheck size={13} /> Bestuursbeheerder</span>
              )}
              <button className="schoolreg-admin-exit" onClick={() => setIsAdmin(false)}>
                <ShieldCheck size={14} /> Beheermodus
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="schoolreg-campus-nav" aria-label="Campussen">
        <span className="schoolreg-nav-caption"><Layers size={13} /> CAMPUSTOEGANG</span>
        {schools.map((school) => {
          const active = school.id === activeSchoolId;
          return (
            <button
              key={school.id}
              type="button"
              onClick={() => onSchoolChange(school.id)}
              className={"schoolreg-campus-tab " + (active ? "active" : "")}
              title={school.address || school.name}
            >
              {school.name.replace("Richtpunt campus ", "")}
            </button>
          );
        })}
        <span className="schoolreg-campus-spacer" />
        {activeSchool?.website && (
          <a className="schoolreg-school-link" href={activeSchool.website} target="_blank" rel="noreferrer">
            Schoolwebsite <ExternalLink size={12} />
          </a>
        )}
      </nav>
    </header>
  );
}
