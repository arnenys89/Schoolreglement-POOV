import { School, SchoolBoard, RegulationSection, PDFConfig } from "../types";
import { defaultSections } from "./regulationSectionsData";

export { defaultSections };

export const defaultSchoolBoard: SchoolBoard = {
  name: "Provinciebestuur Oost-Vlaanderen",
  address: "Charles de Kerchovelaan 189, 9000 Gent",
  phone: "09 267 74 23",
  website: "http://www.oost-vlaanderen.be",
  type: "Officieel gesubsidieerd onderwijs - Provinciaal onderwijs",
  number: "960088",
  showSchoolSelector: false,
  showWelcomeCard: false,
  logoUrl: "https://www.ugent.be/re/img/faculteit-rechten/logos/logo-provincie-oostvlaanderen.png/@@images/image.png",
};

export const defaultSchools: School[] = [
  {
    id: "36467",
    name: "Richtpunt campus Eeklo",
    address: "Roze 131, 9900 Eeklo",
    phone: "09 376 71 11",
    email: "eeklo@richtpunt.be",
    website: "https://richtpunt.be/eeklo",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/eeklo/wp-content/uploads/sites/3/2024/06/Richtpunt-campus-Eeklo-geel-1024x388.png",
  },
  {
    id: "36624",
    name: "Richtpunt campus Gent Henleykaai",
    address: "Henleykaai 83, 9000 Gent",
    phone: "09 267 12 90",
    email: "henleykaai@richtpunt.be",
    website: "https://richtpunt.be/henleykaai",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/genthenleykaai/wp-content/uploads/sites/4/2024/07/Richtpunt-campus-Gent-Henleykaai-geel-1024x283.png",
  },
  {
    id: "36699",
    name: "Richtpunt campus Gent Godshuizenlaan",
    address: "Godshuizenlaan 65, 9000 Gent",
    phone: "09 267 50 00",
    email: "godshuizenlaan@richtpunt.be",
    website: "https://richtpunt.be/godshuizenlaan",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/gentoudenaarde/wp-content/uploads/sites/5/2024/06/Richtpunt-campus-Gent-Oudenaarde-geel-1024x251.png",
  },
  {
    id: "37275",
    name: "Richtpunt Campus Hamme",
    address: "Meulenbroekstraat 15, 9220 Hamme",
    phone: "052 47 04 11",
    email: "hamme@richtpunt.be",
    website: "https://richtpunt.be/hamme",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/hamme/wp-content/uploads/sites/6/2024/06/Richtpunt-campus-Hamme-geel.png",
  },
  {
    id: "37903",
    name: "Richtpunt campus Oudenaarde",
    address: "Minderbroedersstraat 6, 9700 Oudenaarde",
    phone: "055 31 16 35",
    email: "oudenaarde@richtpunt.be",
    website: "https://richtpunt.be/oudenaarde",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/gentoudenaarde/wp-content/uploads/sites/5/2024/06/Richtpunt-campus-Gent-Oudenaarde-geel-1024x251.png",
  },
  {
    id: "46862",
    name: "Richtpunt campus Gent Abdisstraat",
    address: "Abdisstraat 56, 9000 Gent",
    phone: "09 223 37 45",
    email: "abdisstraat@richtpunt.be",
    website: "https://richtpunt.be/abdisstraat",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/gentoudenaarde/wp-content/uploads/sites/5/2024/06/Richtpunt-campus-Gent-Oudenaarde-geel-1024x251.png",
  },
  {
    id: "145722",
    name: "Richtpunt campus Ninove-Zottegem",
    address: "Sabina van Beierenlaan 35, 9620 Zottegem",
    phone: "054 33 34 26",
    email: "ninovezottegem@richtpunt.be",
    website: "https://richtpunt.be/ninovezottegem",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/ninovezottegem/wp-content/uploads/sites/7/2024/06/cropped-logo_ninovezottegem_geel.png",
  },
];

export const defaultPDFConfig: PDFConfig = {
  schoolLogo: "default",
  h1Size: 22,
  h2Size: 16,
  h3Size: 12,
  bodySize: 10,
  fontFamily: "Meta Pro Light",
  showTOC: true,
  headerText: "Schoolreglement Provincie Oost-Vlaanderen - Schooljaar 2026-2027",
  footerText: "Pagina [page] van [topage]",
  filenameTemplate: "Reglement_{School}_{Jaar}.pdf",
};

// Helper functions for localStorage persistence
const REGLEMENT_SECTIONS_KEY = "schoolreglement_sections_v1";
const PDF_CONFIG_KEY = "schoolreglement_pdf_v1";
const SCHOOLS_KEY = "schoolreglement_schools_v1";

export function getSavedSchools(): School[] {
  const data = localStorage.getItem(SCHOOLS_KEY);
  if (!data) return defaultSchools;
  try {
    return JSON.parse(data);
  } catch {
    return defaultSchools;
  }
}

export function saveSchools(schools: School[]) {
  localStorage.setItem(SCHOOLS_KEY, JSON.stringify(schools));
}

export function getSavedSections(): RegulationSection[] {
  const data = localStorage.getItem(REGLEMENT_SECTIONS_KEY);
  if (!data) return defaultSections;
  try {
    return JSON.parse(data);
  } catch {
    return defaultSections;
  }
}

export function saveSections(sections: RegulationSection[]) {
  localStorage.setItem(REGLEMENT_SECTIONS_KEY, JSON.stringify(sections));
}

export function getSavedSectionsForVersion(versionId: string): RegulationSection[] {
  if (!versionId) return getSavedSections();
  const key = `${REGLEMENT_SECTIONS_KEY}_version_${versionId}`;
  const data = localStorage.getItem(key);
  if (!data) {
    // If we have some general saved sections, copy that as the starting point!
    const legacyData = localStorage.getItem(REGLEMENT_SECTIONS_KEY);
    if (legacyData) {
      localStorage.setItem(key, legacyData);
      try {
        return JSON.parse(legacyData);
      } catch {
        return defaultSections;
      }
    }
    return defaultSections;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultSections;
  }
}

export function saveSectionsForVersion(versionId: string, sections: RegulationSection[]) {
  if (!versionId) {
    saveSections(sections);
    return;
  }
  const key = `${REGLEMENT_SECTIONS_KEY}_version_${versionId}`;
  localStorage.setItem(key, JSON.stringify(sections));
  // Keep the current legacy key updated as well so readers can always fallback sensibly
  localStorage.setItem(REGLEMENT_SECTIONS_KEY, JSON.stringify(sections));
}

export function getSavedPDFConfig(): PDFConfig {
  const data = localStorage.getItem(PDF_CONFIG_KEY);
  if (!data) return defaultPDFConfig;
  try {
    return JSON.parse(data);
  } catch {
    return defaultPDFConfig;
  }
}

export function savePDFConfig(config: PDFConfig) {
  localStorage.setItem(PDF_CONFIG_KEY, JSON.stringify(config));
}

export const lucideNames = [
  "School",
  "FileText",
  "Users",
  "UserCheck",
  "Sparkles",
  "Folder",
  "User",
  "CreditCard",
  "ShieldAlert",
  "Handshake",
  "Briefcase",
  "ClipboardCheck",
  "Languages",
  "HeartHandshake",
  "Award",
  "Lock",
  "Camera",
  "Bot",
  "Eye",
  "ListOrdered",
  "Stethoscope",
  "Clock",
  "Laptop",
  "MessageSquareText",
  "Heart",
  "FlameKindling",
  "Scale",
  "Euro",
  "HelpCircle",
];
