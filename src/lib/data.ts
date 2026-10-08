export type Row = {
  Project_ID: string;
  Structure_Type: string;
  Length_m: number;
  Width_m: number;
  Height_m: number;
  Thickness_m: number;
  Area_m2: number;
  Volume_m3: number;
  Material: string;
  Quantity: number;
  Unit: string;
  Unit_Price_INR: number;
  Material_Cost_INR: number;
  Total_Project_Cost_INR: number;
};

export type Project = Omit<Row, "Material" | "Quantity" | "Unit" | "Unit_Price_INR" | "Material_Cost_INR">;

export type Dataset = { rows: Row[]; raw: string; missing: number; duplicates: number };

const NUM = ["Length_m", "Width_m", "Height_m", "Thickness_m", "Area_m2", "Volume_m3", "Quantity", "Unit_Price_INR", "Material_Cost_INR", "Total_Project_Cost_INR"];

export function parseCsv(text: string): Dataset {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  const head = lines[0].split(",").map((h) => h.trim());
  let missing = 0;
  const seen = new Set<string>();
  let duplicates = 0;
  const rows = lines.slice(1).map((line) => {
    if (seen.has(line)) duplicates++;
    seen.add(line);
    const cells = line.split(",");
    const o: Record<string, string | number> = {};
    head.forEach((h, i) => {
      const v = (cells[i] ?? "").trim();
      if (v === "") missing++;
      o[h] = NUM.includes(h) ? Number(v) : v;
    });
    return o as unknown as Row;
  });
  return { rows, raw: text, missing, duplicates };
}

export const median = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
export const avg = (a: number[]) => (a.length ? sum(a) / a.length : 0);

/** One record per Project_ID — prevents duplicate project-cost counting. */
export function uniqueProjects(rows: Row[]): Project[] {
  const map = new Map<string, Project>();
  for (const r of rows) {
    if (!map.has(r.Project_ID)) {
      const { Material, Quantity, Unit, Unit_Price_INR, Material_Cost_INR, ...p } = r;
      void Material; void Quantity; void Unit; void Unit_Price_INR; void Material_Cost_INR;
      map.set(r.Project_ID, p);
    }
  }
  return [...map.values()];
}

export const uniq = (a: string[]) => [...new Set(a)];

export function byMaterial(rows: Row[]) {
  const g = new Map<string, Row[]>();
  rows.forEach((r) => g.set(r.Material, [...(g.get(r.Material) ?? []), r]));
  return [...g.entries()].map(([material, rs]) => ({
    material,
    unit: rs[0].Unit,
    totalCost: sum(rs.map((r) => r.Material_Cost_INR)),
    totalQty: sum(rs.map((r) => r.Quantity)),
    avgPrice: avg(rs.map((r) => r.Unit_Price_INR)),
    medianPrice: median(rs.map((r) => r.Unit_Price_INR)),
    medianRatio: median(rs.filter((r) => r.Volume_m3 > 0).map((r) => r.Quantity / r.Volume_m3)),
  }));
}

export type EstimateLine = { material: string; qty: number; unit: string; price: number; cost: number };

export function estimate(rows: Row[], dims: { length: number; width: number; height: number; thickness: number }) {
  const area = dims.length * dims.width;
  const volume = dims.length * dims.width * dims.height * dims.thickness;
  const lines: EstimateLine[] = byMaterial(rows).map((m) => {
    const qty = volume * m.medianRatio;
    return { material: m.material, qty, unit: m.unit, price: m.medianPrice, cost: qty * m.medianPrice };
  });
  return { area, volume, lines, total: sum(lines.map((l) => l.cost)) };
}

export const inr = (n: number, d = 0) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });
export const fmt = (n: number, d = 2) => n.toLocaleString("en-IN", { maximumFractionDigits: d });

export function download(name: string, content: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
