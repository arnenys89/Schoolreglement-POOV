export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoType?: "emoji" | "abbreviation" | "custom_url";
  logoValue?: string;
}

export interface SchoolBoard {
  name: string;
  address: string;
  phone: string;
  website: string;
  type: string;
  number: string;
  primaryColor?: string; // e.g. "#D6AD00"
  secondaryColor?: string; // e.g. "#2E2E2E"
  logoSubText?: string;  // e.g. "PROVINCIE"
  logoMainText?: string; // e.g. "Oost-Vlaanderen"
  logoUrl?: string;      // e.g. "https://upload.wikimedia.org/wikipedia/commons/2/23/Logo_Oost-Vlaanderen.svg"
  showSearchEngine?: boolean;
  showFloatingPdf?: boolean;
  showSchoolSelector?: boolean;
  showWelcomeCard?: boolean;
}

export interface RegulationSection {
  id: string;
  title: string;
  chapterNumber: number;
  sectionNumber: string; // e.g. "1", "1.1", "1.2.1"
  level: number; // 1 = Chapter, 2 = Section, 3 = Subsection
  type: 'text' | 'image'; // Added
  icon: string; // Lucide icon key
  iconName?: string; // Optional icon name for chapter / section representation
  isGlobal: boolean; // Accessible for all, but text can be school-specific or shared
  visibleSchools: string[]; // List of school IDs where this section is visible
  isSchoolSpecificText: boolean; // True: separate text per school, False: shared text
  globalText: string; // Shared text
  schoolSpecificText: Record<string, string>; // Text keyed by school ID
  globalImageSrc?: string; // Added: Shared image (base64)
  schoolSpecificImageSrc?: Record<string, string>; // Added: Image keyed by school ID
  updatedAt?: string; // Last edit date
}

export interface ChangeLogEntry {
  id: string;
  sectionId: string;
  timestamp: string;
  adminRole: 'superadmin' | 'admin' | 'school';
  action: string;
  description: string;
}

export interface PDFConfig {
  schoolLogo: string; // base64 or identifier
  h1Size: number;
  h2Size: number;
  h3Size: number;
  bodySize: number;
  fontFamily: string; // "Inter", "Verdana", "Georgia"
  showTOC: boolean;
  headerText: string;
  footerText: string;
  filenameTemplate?: string;
}

export interface RegulationVersion {
  id: string; // e.g. "2025-2026"
  schoolYear: string; // e.g. "2025-2026"
  isPublished: boolean; // true = consulteerbaar door gebruiker, false = verborgen
  createdAt: string;
}

