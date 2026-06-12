import React from "react";
import { School, SchoolBoard, RegulationSection, PDFConfig } from "../types";
import LucideIcon from "./LucideIcon";
import { Eye, Printer, Layout, X, Sliders, Type, FileCheck, CheckCircle2 } from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";

interface PDFExporterProps {
  board: SchoolBoard;
  activeSchool: School;
  sections: RegulationSection[];
  config: PDFConfig;
  onUpdateConfig: (updated: PDFConfig) => void;
  onClose: () => void;
  immediate?: boolean;
}

const convertSingleOklchToRgb = (oklchStr: string): string | null => {
  try {
    const clean = oklchStr.trim();
    const inner = clean.replace(/^oklch\s*\((.*)\)$/i, '$1').trim();
    
    let parts: string[] = [];
    if (inner.includes(',')) {
      parts = inner.split(',').map(s => s.trim());
    } else {
      const tokens = inner.split(/[\s/]+/).map(s => s.trim()).filter(Boolean);
      parts = tokens;
    }
    
    if (parts.length < 3) return null;
    
    const L_str = parts[0];
    const C_str = parts[1];
    const H_str = parts[2];
    const A_str = parts[3];
    
    const L = L_str.endsWith('%') ? parseFloat(L_str) / 100 : parseFloat(L_str);
    const C = parseFloat(C_str);
    let H = 0;
    if (H_str.endsWith('deg')) {
      H = parseFloat(H_str);
    } else if (H_str.endsWith('rad')) {
      H = parseFloat(H_str) * (180 / Math.PI);
    } else if (H_str.endsWith('turn')) {
      H = parseFloat(H_str) * 360;
    } else {
      H = parseFloat(H_str);
    }
    
    let A = 1;
    if (A_str !== undefined) {
      A = A_str.endsWith('%') ? parseFloat(A_str) / 100 : parseFloat(A_str);
    }
    
    if (isNaN(L) || isNaN(C) || isNaN(H) || isNaN(A)) {
      return null;
    }
    
    // OKLCH to OKLAB
    const hRad = (H * Math.PI) / 180;
    const lab_a = C * Math.cos(hRad);
    const lab_b = C * Math.sin(hRad);
    
    // OKLAB to LMS
    const l_ = L + 0.3963377774 * lab_a + 0.2158037573 * lab_b;
    const m_ = L - 0.1055613458 * lab_a - 0.0638541728 * lab_b;
    const s_ = L - 0.0894841775 * lab_a - 1.2914855480 * lab_b;
    
    // Non-linear back to LMS
    const l = Math.pow(Math.max(0, l_), 3);
    const m = Math.pow(Math.max(0, m_), 3);
    const s = Math.pow(Math.max(0, s_), 3);
    
    // LMS to Linear sRGB
    const r_linear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g_linear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const b_linear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    
    // Linear sRGB to standard sRGB
    const convertChannel = (c: number) => {
      if (c <= 0.0031308) {
        return 12.92 * c;
      } else {
        return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      }
    };
    
    const r = Math.round(Math.max(0, Math.min(1, convertChannel(r_linear))) * 255);
    const g = Math.round(Math.max(0, Math.min(1, convertChannel(g_linear))) * 255);
    const b = Math.round(Math.max(0, Math.min(1, convertChannel(b_linear))) * 255);
    
    if (A === 1) {
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      return `rgba(${r}, ${g}, ${b}, ${A})`;
    }
  } catch (e) {
    return null;
  }
};

const convertSingleOklabToRgb = (oklabStr: string): string | null => {
  try {
    const clean = oklabStr.trim();
    const inner = clean.replace(/^oklab\s*\((.*)\)$/i, '$1').trim();
    
    let parts: string[] = [];
    if (inner.includes(',')) {
      parts = inner.split(',').map(s => s.trim());
    } else {
      const tokens = inner.split(/[\s/]+/).map(s => s.trim()).filter(Boolean);
      parts = tokens;
    }
    
    if (parts.length < 3) return null;
    
    const L_str = parts[0];
    const a_str = parts[1];
    const b_str = parts[2];
    const A_str = parts[3];
    
    const L = L_str.endsWith('%') ? parseFloat(L_str) / 100 : parseFloat(L_str);
    const lab_a = a_str.endsWith('%') ? (parseFloat(a_str) / 100) * 0.4 : parseFloat(a_str);
    const lab_b = b_str.endsWith('%') ? (parseFloat(b_str) / 100) * 0.4 : parseFloat(b_str);
    
    let A = 1;
    if (A_str !== undefined) {
      A = A_str.endsWith('%') ? parseFloat(A_str) / 100 : parseFloat(A_str);
    }
    
    if (isNaN(L) || isNaN(lab_a) || isNaN(lab_b) || isNaN(A)) {
      return null;
    }
    
    // OKLAB to LMS
    const l_ = L + 0.3963377774 * lab_a + 0.2158037573 * lab_b;
    const m_ = L - 0.1055613458 * lab_a - 0.0638541728 * lab_b;
    const s_ = L - 0.0894841775 * lab_a - 1.2914855480 * lab_b;
    
    // Non-linear back to LMS
    const l = Math.pow(Math.max(0, l_), 3);
    const m = Math.pow(Math.max(0, m_), 3);
    const s = Math.pow(Math.max(0, s_), 3);
    
    // LMS to Linear sRGB
    const r_linear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g_linear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const b_linear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    
    // Linear sRGB to standard sRGB
    const convertChannel = (c: number) => {
      if (c <= 0.0031308) {
        return 12.92 * c;
      } else {
        return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      }
    };
    
    const r = Math.round(Math.max(0, Math.min(1, convertChannel(r_linear))) * 255);
    const g = Math.round(Math.max(0, Math.min(1, convertChannel(g_linear))) * 255);
    const b = Math.round(Math.max(0, Math.min(1, convertChannel(b_linear))) * 255);
    
    if (A === 1) {
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      return `rgba(${r}, ${g}, ${b}, ${A})`;
    }
  } catch (e) {
    return null;
  }
};

const convertColorsToRgb = (val: any): any => {
  if (typeof val !== "string") return val;
  let res = val;
  if (res.includes("oklch")) {
    res = res.replace(/oklch\([^)]+\)/gi, (match) => {
      const rgb = convertSingleOklchToRgb(match);
      return rgb || match;
    });
  }
  if (res.includes("oklab")) {
    res = res.replace(/oklab\([^)]+\)/gi, (match) => {
      const rgb = convertSingleOklabToRgb(match);
      return rgb || match;
    });
  }
  return res;
};

export default function PDFExporter({
  board,
  activeSchool,
  sections,
  config,
  onUpdateConfig,
  onClose,
  immediate = false,
}: PDFExporterProps) {
  // Filter active school visible sections and sort hierarchically
  const visibleSections = sections
    .filter((sec) => sec.visibleSchools.includes(activeSchool.id))
    .sort((a, b) => {
      const aParts = a.sectionNumber.split(".").map(Number);
      const bParts = b.sectionNumber.split(".").map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    });

  const fontPairs = [
    { name: "Meta Pro Light (Huisstijl)", value: "Meta Pro Light" },
    { name: "Inter (Standaard Sans)", value: "Inter" },
    { name: "Verdana (Elegante Breedte)", value: "Verdana" },
    { name: "Georgia (Klassieke Serif)", value: "Georgia" },
    { name: "Courier New (Strict Meta-Mono)", value: "Courier New" },
  ];

  const [generating, setGenerating] = React.useState(false);
  const [progressText, setProgressText] = React.useState("");

  const exportPDF = () => {
    setGenerating(true);
    setProgressText("Schoolreglement formatteren...");

    const element = document.getElementById("pdf-printable-frame");
    if (!element) {
      console.error("PDF element niet gevonden!");
      setGenerating(false);
      return;
    }

    const opt = {
      margin: [15, 12, 18, 12] as [number, number, number, number], // top, left, bottom, right in mm
      filename: `Reglement_${activeSchool.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { 
        mode: ['css', 'legacy'] 
      }
    };

    setProgressText("PDF opbouwen en downloaden...");

    // Convert oklch colors on elements directly to static rgb/rgba inline styles
    // to bypass the html2canvas parsing errors. This is much more stable than proxying getComputedStyle.
    const elementsWithModifiedStyles: { element: HTMLElement; originalStyles: { [key: string]: string } }[] = [];

    const processElementStyles = (el: HTMLElement) => {
      const computed = window.getComputedStyle(el);
      const propertiesToConvert = [
        "color",
        "backgroundColor",
        "borderColor",
        "borderTopColor",
        "borderBottomColor",
        "borderLeftColor",
        "borderRightColor",
        "outlineColor"
      ];
      
      const original: { [key: string]: string } = {};
      let hasChange = false;
      
      for (const prop of propertiesToConvert) {
        const val = (computed as any)[prop];
        if (typeof val === "string" && (val.includes("oklch") || val.includes("oklab"))) {
          original[prop] = el.style[prop as any] || "";
          const converted = convertColorsToRgb(val);
          el.style[prop as any] = converted;
          hasChange = true;
        }
      }
      
      if (hasChange) {
        elementsWithModifiedStyles.push({ element: el, originalStyles: original });
      }
      
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];
        if (child instanceof HTMLElement) {
          processElementStyles(child);
        }
      }
    };

    // Apply converted colors
    processElementStyles(element);

    const restoreStyles = () => {
      for (const item of elementsWithModifiedStyles) {
        for (const [prop, val] of Object.entries(item.originalStyles)) {
          item.element.style[prop as any] = val;
        }
      }
    };

    // @ts-ignore
    html2pdf()
      .set(opt as any)
      .from(element)
      .save()
      .then(() => {
        restoreStyles();
        setGenerating(false);
        onClose();
      })
      .catch((err: any) => {
        console.error("PDF generator error:", err);
        restoreStyles();
        // Fallback to basic print
        window.print();
        setGenerating(false);
        onClose();
      });
  };

  React.useEffect(() => {
    if (immediate) {
      const timer = setTimeout(() => {
        exportPDF();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [immediate]);

  return (
    <div 
      className={
        immediate 
          ? "fixed left-[-9999px] top-0 opacity-0 pointer-events-none w-[210mm] overflow-visible" 
          : "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto pdf-modal-backdrop pdf-modal-container"
      }
    >
      {/* Visual progress loader spinner */}
      {(generating || (immediate && !generating)) && (
        <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in no-print">
          <div className="relative flex items-center justify-center h-24 w-24 mb-6">
            <div 
              className="absolute inset-0 rounded-full border-4 opacity-20 animate-ping"
              style={{ borderColor: board.primaryColor || '#D6AD00' }}
            ></div>
            <div 
              className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4"
              style={{ borderColor: board.primaryColor || '#D6AD00' }}
            ></div>
          </div>
          
          <p 
            className="text-base font-display font-semibold tracking-tight text-gray-900 mb-2"
          >
            Schoolreglement Downloaden...
          </p>
          <p className="text-xs text-gray-450 font-mono max-w-sm leading-normal">
            {progressText || "Momenteel wordt uw gepersonaliseerde schoolreglement als PDF-bestand samengesteld en klaargemaakt voor directe download."}
          </p>
        </div>
      )}

      <div 
        className={
          immediate 
            ? "pdf-modal-content" 
            : "bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden animate-zoom-in pdf-modal-content"
        }
      >
        
        {/* Left Side: Customizer inputs */}
        {!immediate && (
          <div className="md:w-1/3 border-r border-gray-250 bg-gray-50 flex flex-col max-h-[90vh] md:max-h-none overflow-y-auto p-5 md:p-6 pdf-customizer-sidebar no-print">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
            <h3 className="font-display font-bold text-sm tracking-wide text-[#2E2E2E] flex items-center gap-1.5">
              <Sliders className="text-[#D6AD00]" size={16} />
              PDF-Layout Aanpassen
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5 flex-1 select-none">
            
            {/* Logo Configuration */}
            <div>
              <label className="block text-[10px] font-bold uppercase font-mono text-gray-400 mb-1.5 flex items-center gap-1">
                <Layout size={11} /> Label / Logo op de PDF
              </label>
              <select
                value={config.schoolLogo}
                onChange={(e) => onUpdateConfig({ ...config, schoolLogo: e.target.value })}
                className="w-full text-xs rounded border border-gray-300 p-2 bg-white cursor-pointer focus:border-[#D6AD00]"
              >
                <option value="default">Standaard Bestuur Swoosh (Oranje)</option>
                <option value="school-yellow">Schooleigen Kampus-Embleem (Geel)</option>
                <option value="minimalist">Enkel Tekstkop (Geen logo)</option>
              </select>
            </div>

            {/* Typography Selections */}
            <div>
              <label className="block text-[10px] font-bold uppercase font-mono text-gray-400 mb-1.5 flex items-center gap-1">
                <Type size={11} /> Lettertype / Font Family
              </label>
              <select
                value={config.fontFamily}
                onChange={(e) => onUpdateConfig({ ...config, fontFamily: e.target.value })}
                className="w-full text-xs rounded border border-gray-300 p-2 bg-white cursor-pointer focus:border-[#D6AD00]"
              >
                {fontPairs.map((p, i) => (
                  <option key={i} value={p.value}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Sizes Sliders */}
            <div className="space-y-3.5 border-t border-gray-200 pt-4">
              <label className="block text-[10px] font-bold uppercase font-mono text-gray-400 leading-none">
                Tekstgroottes (pt / px)
              </label>
              
              {/* Heading 1 (Chapters) */}
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>Hoofdstukken (H1)</span>
                  <span className="font-mono text-[#D6AD00] font-semibold">{config.h1Size}pt</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="32"
                  value={config.h1Size}
                  onChange={(e) => onUpdateConfig({ ...config, h1Size: Number(e.target.value) })}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D6AD00]"
                />
              </div>

              {/* Heading 2 (Sections) */}
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>Paragrafen (H2)</span>
                  <span className="font-mono text-[#D6AD00] font-semibold">{config.h2Size}pt</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={config.h2Size}
                  onChange={(e) => onUpdateConfig({ ...config, h2Size: Number(e.target.value) })}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D6AD00]"
                />
              </div>

              {/* Body Text */}
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>Inhoudstekst</span>
                  <span className="font-mono text-[#D6AD00] font-semibold">{config.bodySize}pt</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="14"
                  value={config.bodySize}
                  onChange={(e) => onUpdateConfig({ ...config, bodySize: Number(e.target.value) })}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D6AD00]"
                />
              </div>
            </div>

            {/* Custom Header Text */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase font-mono text-gray-400 mb-1">
                  Koptekst (Bovenaan pagina)
                </label>
                <input
                  type="text"
                  value={config.headerText}
                  onChange={(e) => onUpdateConfig({ ...config, headerText: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs focus:border-[#D6AD00]"
                />
              </div>

              {/* Include TOC switch */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={config.showTOC}
                  onChange={(e) => onUpdateConfig({ ...config, showTOC: e.target.checked })}
                  className="rounded text-[#D6AD00] focus:ring-[#D6AD00]"
                />
                <span className="text-xs text-gray-600 font-medium">Inhoudstabel opnemen</span>
              </label>
            </div>

          </div>

          {/* Trigger Print Button */}
          <div className="pt-4 border-t border-gray-200 mt-5">
            <button
              onClick={exportPDF}
              className="w-full py-2.5 rounded-lg bg-[#E5A823] hover:bg-[#B59300] text-[#2E2E2E] font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-transform transform hover:scale-[1.02]"
              id="export-pdf-trigger-btn"
            >
              <Printer size={15} /> Exporteren naar PDF
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-2.5 leading-tight">
              Tip: Het reglement wordt direct opgebouwd en als officieel PDF-bestand gedownload op uw apparaat.
            </p>
          </div>
        </div>
        )}

        {/* Right Side: Simulated preview page canvas (gorgeous representation) */}
        <div 
          className={
            immediate 
              ? "pdf-preview-container" 
              : "flex-1 bg-gray-300 overflow-y-auto max-h-[95vh] focus:outline-hidden p-6 md:p-10 flex justify-center pdf-preview-container"
          }
        >
          
          <div
            className="w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] shadow-xl relative"
            style={{
              fontFamily: config.fontFamily,
              fontSize: `${config.bodySize}pt`,
            }}
            id="pdf-printable-frame"
          >
            {/* Header watermark */}
            <div className="border-b border-gray-200 pb-2 mb-6 flex justify-between text-[8px] text-gray-400 font-mono tracking-wide">
              <span>{config.headerText}</span>
              <span>{activeSchool.name}</span>
            </div>

            {/* Beautiful Cover Page (Voorblad met Logo) */}
            <div className="brand-cover-page text-center select-none flex flex-col justify-between mb-12" style={{ pageBreakAfter: "always" }}>
              
              {/* Header block with both Board logo and School logo partnered */}
              <div className="border-b-2 pb-4 select-none flex items-center justify-between gap-4" style={{ borderColor: board.primaryColor || '#D6AD00' }}>
                <div className="flex flex-col items-start gap-1">
                  <p className="text-[8px] uppercase font-mono tracking-widest text-[#D6AD00] font-bold leading-none mb-1">
                    INRICHTEND BESTUUR
                  </p>
                  {board.logoUrl ? (
                    <img 
                      src={board.logoUrl} 
                      alt={board.name} 
                      className="h-8 w-auto object-contain max-h-8" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-[10px] font-sans font-bold text-gray-700">{board.name}</span>
                  )}
                  <p className="text-[7.5px] text-gray-400 font-mono">
                    Provincie Oost-Vlaanderen
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[8px] uppercase font-mono tracking-widest text-amber-600 font-bold leading-none mb-1">
                    ONDERWIJSINSTELLING
                  </p>
                  {activeSchool?.logoType === "custom_url" && activeSchool?.logoValue ? (
                    <img 
                      src={activeSchool.logoValue} 
                      alt="School Logo" 
                      className="h-8 w-auto object-contain max-h-8" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-[10px] font-sans font-bold text-gray-700">{activeSchool.name}</span>
                  )}
                  <p className="text-[7.5px] text-gray-400 font-mono">
                    {activeSchool.name.replace("Richtpunt campus ", "")}
                  </p>
                </div>
              </div>

              {/* Large school Logo block in the center */}
              <div className="my-auto py-10 flex flex-col items-center justify-center gap-6">
                
                {/* School logo badge */}
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-md select-none p-4"
                  style={{ 
                    border: `2.5px solid ${board.primaryColor || '#D6AD00'}`,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  {activeSchool?.logoType === "custom_url" && activeSchool?.logoValue ? (
                    <img src={activeSchool.logoValue} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : activeSchool?.logoType === "abbreviation" && activeSchool?.logoValue ? (
                    <span className="text-xl font-mono font-black text-gray-700 leading-none">{activeSchool.logoValue}</span>
                  ) : (
                    <span className="text-4xl leading-none">{activeSchool?.logoValue || "🏫"}</span>
                  )}
                </div>

                {/* Main Titles */}
                <div className="space-y-4">
                  <h1 className="text-3xl font-display font-bold tracking-tight text-gray-900 leading-tight pr-4 pl-4 uppercase">
                    Schoolreglement
                  </h1>
                  
                  <div className="h-1 w-16 mx-auto rounded" style={{ backgroundColor: board.primaryColor || '#D6AD00' }}></div>
                  
                  <h2 className="text-base font-sans font-semibold text-gray-700 max-w-lg mx-auto">
                    {activeSchool.name}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-mono">
                    ID: {activeSchool.id} | Campuscode: {activeSchool.id}
                  </p>
                </div>
              </div>

              {/* Lower Section with detailed metadata & signature stamps */}
              <div className="border-t border-gray-200 pt-5 mt-6 grid grid-cols-2 gap-4 text-left text-[9px] text-gray-500 leading-normal">
                <div className="space-y-1 pr-4 border-r border-gray-150">
                  <span className="text-[8px] font-mono uppercase tracking-wider font-bold text-gray-400 block leading-none">
                    INSTELLINGSGEGEVENS
                  </span>
                  <p className="font-semibold text-gray-800">{activeSchool.name}</p>
                  <p>{activeSchool.address}</p>
                  <p>Tel: {activeSchool.phone}</p>
                  <p>{activeSchool.website}</p>
                </div>

                <div className="space-y-1 pl-2">
                  <span className="text-[8px] font-mono uppercase tracking-wider font-bold text-gray-400 block leading-none">
                    BESTUURSGEGEVENS
                  </span>
                  <p className="font-semibold text-gray-800">{board.name}</p>
                  <p>{board.address}</p>
                  <p>Tel: {board.phone}</p>
                  <p>{board.website}</p>
                </div>

                <div className="col-span-2 mt-4 pt-3 border-t border-gray-150 flex items-center justify-between font-mono text-[9px] text-gray-400">
                  <div>
                    <span>Geldigheidsperiode: <strong>Schooljaar 2026-2027</strong></span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-[#D6AD00]">
                    <CheckCircle2 size={12} />
                    <span>Officieel Goedgekeurd</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Minimalist flat text Table of Contents */}
            {config.showTOC && (
              <div className="mb-10 toc-section py-6 border-b border-gray-200" style={{ pageBreakAfter: "always" }}>
                <h3 className="font-display font-semibold tracking-wide text-gray-900 border-b pb-2 mb-4" style={{ fontSize: `${config.h2Size}pt` }}>
                  Inhoudstafel
                </h3>
                <div className="space-y-2.5 font-sans text-[10px] text-gray-700 leading-normal max-w-2xl">
                  {visibleSections.map((sec) => {
                    const indent = sec.level === 2 
                      ? "pl-4 text-gray-600" 
                      : sec.level === 3 
                        ? "pl-8 text-gray-400 italic" 
                        : "font-semibold text-gray-900 pt-2 border-t border-gray-100 first:border-0";
                    return (
                      <div key={sec.id} className={`${indent} flex items-center justify-between`}>
                        <span>{sec.sectionNumber} {sec.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rendered articles matching style with page breaks for new chapters */}
            <div className="space-y-6">
              {visibleSections.map((sec, idx) => {
                const specificText = sec.isSchoolSpecificText && sec.schoolSpecificText[activeSchool.id];
                const text = specificText ? sec.schoolSpecificText[activeSchool.id] : sec.globalText;

                return (
                  <div 
                    key={sec.id} 
                    className="prose"
                    style={sec.level === 1 && idx > 0 ? { pageBreakBefore: "always", paddingTop: "8mm" } : {}}
                  >
                    
                    {/* Variable Typography headers based on levels */}
                    {sec.level === 1 ? (
                      <h3
                        className="font-bold border-b border-gray-300 pb-1 mt-6 text-[#2E2E2E] uppercase font-display"
                        style={{ fontSize: `${config.h1Size}pt` }}
                      >
                        {sec.sectionNumber} &mdash; {sec.title}
                      </h3>
                    ) : sec.level === 2 ? (
                      <h4
                        className="font-semibold text-gray-800 mt-4 font-sans"
                        style={{ fontSize: `${config.h2Size}pt` }}
                      >
                        {sec.sectionNumber} {sec.title}
                      </h4>
                    ) : (
                      <h5
                        className="font-medium text-gray-500 mt-3 font-sans"
                        style={{ fontSize: `${config.h3Size}pt` }}
                      >
                        {sec.sectionNumber} {sec.title}
                      </h5>
                    )}

                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed mt-1 text-[11px]">
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer markers */}
            <div className="border-t border-gray-200 pt-3 mt-10 text-[8px] text-gray-400 font-mono flex justify-between">
              <span>{board.name}</span>
              <span>{config.footerText.replace("[page]", "1").replace("[topage]", "1")}</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
