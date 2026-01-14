export interface PageSize {
  name: string;
  width: number; // in inches
  height: number; // in inches
}

export const PAGE_SIZES: Record<string, PageSize> = {
  letter: { name: 'Letter', width: 8.5, height: 11 },
  legal: { name: 'Legal', width: 8.5, height: 14 },
  a4: { name: 'A4', width: 8.27, height: 11.69 },
  a5: { name: 'A5', width: 5.83, height: 8.27 },
  executive: { name: 'Executive', width: 7.25, height: 10.5 },
  tabloid: { name: 'Tabloid', width: 11, height: 17 },
};

export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SearchMatch {
  from: number;
  to: number;
  text: string;
}
