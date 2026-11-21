import { School, RegulationSection, RegulationVersion, PDFConfig, SchoolBoard } from "../types";

async function readCollection<T>(collection: string, versionId?: string): Promise<T[]> {
  const params = new URLSearchParams({ collection });
  if (versionId) params.set("versionId", versionId);
  const response = await fetch(`/api/data?${params}`, { credentials: "same-origin", cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(result.records)) throw new Error(result.error || "Gegevens ophalen uit Cloudflare D1 is mislukt.");
  return result.records as T[];
}

async function writeCollection(collection: string, records: unknown[], options: { versionId?: string; replace?: boolean } = {}): Promise<void> {
  const response = await fetch(`/api/data?collection=${encodeURIComponent(collection)}`, {
    method: "PUT",
    credentials: "same-origin",
    cache: "no-store",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ records, versionId: options.versionId, replace: options.replace }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Opslaan in Cloudflare D1 is mislukt.");
}

export const fetchSchools = () => readCollection<School>("schools");
export const saveSchools = (schools: School[]) => writeCollection("schools", schools, { replace: true });

export const fetchSections = () => readCollection<RegulationSection>("sections");
export const saveSections = (sections: RegulationSection[]) => writeCollection("sections", sections, { replace: true });

export const fetchSectionsForVersion = (versionId: string) => readCollection<RegulationSection>("sections", versionId);
export const saveSectionsForVersion = (versionId: string, sections: RegulationSection[]) => writeCollection("sections", sections, { versionId, replace: true });

export async function fetchPDFConfig(): Promise<PDFConfig | null> {
  const records = await readCollection<{ id: string } & PDFConfig>("config");
  return records.find((record) => record.id === "pdf") || null;
}
export const savePDFConfig = (config: PDFConfig) => writeCollection("config", [{ id: "pdf", ...config }]);

export async function fetchBoard(): Promise<SchoolBoard | null> {
  const records = await readCollection<{ id: string } & SchoolBoard>("config");
  return records.find((record) => record.id === "board") || null;
}
export const saveBoard = (board: SchoolBoard) => writeCollection("config", [{ id: "board", ...board }]);

export const fetchVersions = () => readCollection<RegulationVersion>("versions");
export const saveVersions = (versions: RegulationVersion[]) => writeCollection("versions", versions, { replace: true });
export async function deleteVersion(versionId: string): Promise<void> {
  const response = await fetch("/api/data?collection=versions", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ deleteVersionId: versionId }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Verwijderen van schooljaarversie is mislukt.");
}
