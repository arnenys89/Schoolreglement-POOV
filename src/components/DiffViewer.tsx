import React, { useState } from "react";
import * as Diff from "diff";
import { X, FileDown } from "lucide-react";
import { RegulationSection, RegulationVersion } from "../types";
import { getSavedSectionsForVersion } from "../data/mockData";

interface DiffViewerProps {
  sectionId: string;
  versions: RegulationVersion[];
  onClose: () => void;
}

export default function DiffViewer({ sectionId, versions, onClose }: DiffViewerProps) {
  const [versionA, setVersionA] = useState(versions[0]?.id || "");
  const [versionB, setVersionB] = useState(versions[1]?.id || versions[0]?.id || "");

  const getSectionContent = (versionId: string) => {
    const sections = getSavedSectionsForVersion(versionId);
    const section = sections.find((s) => s.id === sectionId);
    return section ? section.globalText : "Sectie niet gevonden in deze versie.";
  };

  const contentA = getSectionContent(versionA);
  const contentB = getSectionContent(versionB);
  const diffs = Diff.diffWords(contentA, contentB);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 print-container">
      <style>
        {`
          @media print {
            body > *:not(.print-container) { display: none !important; }
            .print-container { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col print-area">
        <div className="p-4 border-b flex justify-between items-center no-print">
          <h2 className="text-lg font-bold">Verschillen bekijken</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 no-print">
          <select value={versionA} onChange={(e) => setVersionA(e.target.value)} className="w-full text-xs border rounded p-2">
            {versions.map(v => <option key={v.id} value={v.id}>{v.schoolYear}</option>)}
          </select>
          <select value={versionB} onChange={(e) => setVersionB(e.target.value)} className="w-full text-xs border rounded p-2">
            {versions.map(v => <option key={v.id} value={v.id}>{v.schoolYear}</option>)}
          </select>
        </div>
        <div className="p-6 overflow-y-auto flex-1 font-mono text-sm whitespace-pre-wrap">
          <h3 className="font-bold mb-4">Verschil tussen {versions.find(v => v.id === versionA)?.schoolYear} en {versions.find(v => v.id === versionB)?.schoolYear}</h3>
          {diffs.map((part, index) => (
            <span
              key={index}
              className={
                part.added ? "bg-green-100 text-green-700 font-bold" :
                part.removed ? "bg-red-100 text-red-700 line-through" :
                "text-gray-800"
              }
            >
              {part.value}
            </span>
          ))}
        </div>
        <div className="p-4 border-t flex justify-end no-print">
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-amber-600 text-white p-2 rounded text-xs font-semibold">
            <FileDown size={14} /> Exporteer naar PDF (Print)
          </button>
        </div>
      </div>
    </div>
  );
}
