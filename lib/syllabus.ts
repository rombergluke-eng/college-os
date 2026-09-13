import { ImportantDate } from "./types";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const MONTH_ABBR = MONTHS.map((m) => m.slice(0, 3));

const DATE_PATTERNS = [
  // "September 12", "Sep 12", "September 12, 2026"
  new RegExp(`\\b(${MONTHS.join("|")}|${MONTH_ABBR.join("|")})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})?\\b`, "gi"),
  // "9/12" or "9/12/2026"
  /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g,
];

function monthIndex(name: string): number {
  const lower = name.toLowerCase().replace(".", "");
  const full = MONTHS.indexOf(lower);
  if (full !== -1) return full;
  return MONTH_ABBR.indexOf(lower.slice(0, 3));
}

/**
 * Scans free-form syllabus text for dates and grabs a short label from the
 * surrounding line (e.g. "Midterm exam: October 14" -> label "Midterm exam").
 * Heuristic, not a full NLP parser — meant to save typing, not be perfect.
 */
export function extractDatesFromSyllabus(text: string, referenceYear: number): ImportantDate[] {
  const results: ImportantDate[] = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;
    let match: RegExpExecArray | null;

    const monthPattern = new RegExp(DATE_PATTERNS[0].source, "gi");
    while ((match = monthPattern.exec(line)) !== null) {
      const mIdx = monthIndex(match[1]);
      const day = parseInt(match[2], 10);
      const year = match[3] ? parseInt(match[3], 10) : referenceYear;
      if (mIdx === -1 || isNaN(day)) continue;
      const date = new Date(year, mIdx, day);
      if (isNaN(date.getTime())) continue;
      results.push({ label: labelFromLine(line, match[0]), date: date.toISOString() });
    }

    const slashPattern = new RegExp(DATE_PATTERNS[1].source, "g");
    while ((match = slashPattern.exec(line)) !== null) {
      const month = parseInt(match[1], 10) - 1;
      const day = parseInt(match[2], 10);
      let year = match[3] ? parseInt(match[3], 10) : referenceYear;
      if (year < 100) year += 2000;
      if (month < 0 || month > 11 || day < 1 || day > 31) continue;
      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) continue;
      results.push({ label: labelFromLine(line, match[0]), date: date.toISOString() });
    }
  }

  // De-duplicate same label+date pairs
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.label}|${r.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function labelFromLine(line: string, dateText: string): string {
  const withoutDate = line.replace(dateText, "").replace(/[:\-–—]+$/, "").trim();
  const cleaned = withoutDate.replace(/^[•\-*\d.\s]+/, "").trim();
  return cleaned.length > 3 && cleaned.length < 80 ? cleaned : "Important date";
}
