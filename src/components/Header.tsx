import React from "react";
import { School, SchoolBoard, RegulationVersion } from "../types";
import { ShieldCheck, BookOpen, ExternalLink, ChevronDown } from "lucide-react";
interface HeaderProps {
  schools: School[]; activeSchoolId: string; onSchoolChange: (id: string) => void;
  isAdmin: boolean; setIsAdmin: (admin: boolean) => void; board: SchoolBoard;
  adminRole?: "none" | "super" | "school"; schoolAdminSchoolId?: string;
  onRoleChange?: (role: "none" | "super" | "school", schoolId: string) => void;
  versions: RegulationVersion[]; activeVersionId: string; onVersionChange: (id: string) => void;
}
export default function Header({schools,activeSchoolId,onSchoolChange,isAdmin,setIsAdmin,board,adminRole="none",versions,activeVersionId,onVersionChange}:HeaderProps){
 const activeSchool=schools.find(s=>s.id===activeSchoolId)||schools[0];
 return <header className="schoolreg-header no-print"><div className="schoolreg-header-main">
  <div className="schoolreg-brand"><div className="schoolreg-brand-mark">R</div><div className="schoolreg-brand-copy"><span className="schoolreg-brand-overline">PROVINCIAAL ONDERWIJS OOST-VLAANDEREN</span><strong>Schoolreglementen</strong><small>{board.name||"Digitaal reglementenplatform"}</small></div></div>
  <div className="schoolreg-header-context">
   <label className="schoolreg-context-select"><BookOpen size={15}/><span className="schoolreg-context-label">CAMPUS</span><select value={activeSchoolId} onChange={e=>onSchoolChange(e.target.value)} aria-label="Selecteer campus">{schools.map(s=><option key={s.id} value={s.id}>{s.name.replace("Richtpunt campus ","")}</option>)}</select><ChevronDown size={13}/></label>
   <label className="schoolreg-version-select"><span>Schooljaar</span><select value={activeVersionId} onChange={e=>onVersionChange(e.target.value)}>{versions.filter(v=>isAdmin||v.isPublished).map(v=><option key={v.id} value={v.id}>{v.schoolYear}{!v.isPublished?" (Concept)":""}</option>)}</select><ChevronDown size={13}/></label>
   {activeSchool?.website&&<a className="schoolreg-school-link" href={activeSchool.website} target="_blank" rel="noreferrer" title="Open schoolwebsite"><ExternalLink size={14}/></a>}
   {isAdmin&&<div className="schoolreg-admin-tools">{adminRole==="super"&&<span className="schoolreg-admin-pill"><ShieldCheck size={13}/> Bestuursbeheerder</span>}<button className="schoolreg-admin-exit" onClick={()=>setIsAdmin(false)}><ShieldCheck size={14}/> Beheermodus</button></div>}
  </div>
 </div></header>;
}
