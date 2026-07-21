import * as XLSX from 'xlsx';

/** A menu row mapped from a spreadsheet, with its 1-based source row number
 *  (accounting for the header row) for error reporting. */
export interface MappedFoodRow {
  /** Spreadsheet row number as a human would count it (header = row 1). */
  rowNumber: number;
  name: string;
  description: string;
  category: string;
  price: string;
  prepTimeMinutes: string;
  imageUrl: string;
  available: string;
}

/** Header aliases → canonical field. Compared after lower-casing and stripping
 *  every non-alphanumeric character, so "Prep time (min)" ≈ "preptimemin". */
const HEADER_ALIASES: Record<string, keyof Omit<MappedFoodRow, 'rowNumber'>> = {
  name: 'name',
  item: 'name',
  itemname: 'name',
  description: 'description',
  desc: 'description',
  category: 'category',
  price: 'price',
  amount: 'price',
  preptime: 'prepTimeMinutes',
  preptimeminutes: 'prepTimeMinutes',
  preptimemin: 'prepTimeMinutes',
  prep: 'prepTimeMinutes',
  image: 'imageUrl',
  imageurl: 'imageUrl',
  photo: 'imageUrl',
  available: 'available',
  isavailable: 'available',
};

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parse a .csv/.xlsx buffer into mapped menu rows. Reads the first sheet, maps
 * recognised header columns to canonical fields (alias- and case-insensitive),
 * and drops fully-empty rows. Values are returned as trimmed strings; type
 * coercion/validation happens in the service.
 */
export function parseMenuSpreadsheet(buffer: Buffer): MappedFoodRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[sheetName],
    { defval: '', raw: false },
  );

  const rows: MappedFoodRow[] = [];
  raw.forEach((record, i) => {
    const mapped: MappedFoodRow = {
      rowNumber: i + 2, // + header row, + 1-based
      name: '',
      description: '',
      category: '',
      price: '',
      prepTimeMinutes: '',
      imageUrl: '',
      available: '',
    };
    let hasValue = false;
    for (const [key, value] of Object.entries(record)) {
      const field = HEADER_ALIASES[normalizeKey(key)];
      if (!field) continue;
      const str = value == null ? '' : String(value).trim();
      mapped[field] = str;
      if (str) hasValue = true;
    }
    if (hasValue) rows.push(mapped);
  });
  return rows;
}
