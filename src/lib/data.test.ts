import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseCsv, uniqueProjects, estimate, sum } from "./data";

const ds = parseCsv(readFileSync("public/construction_data.csv", "utf8"));

describe("dataset rules", () => {
  it("counts 75 unique projects from 300 rows", () => {
    expect(ds.rows.length).toBe(300);
    expect(uniqueProjects(ds.rows).length).toBe(75);
  });
  it("project cost is counted once per project, not per material row", () => {
    const once = sum(uniqueProjects(ds.rows).map((p) => p.Total_Project_Cost_INR));
    const naive = sum(ds.rows.map((r) => r.Total_Project_Cost_INR));
    expect(naive / once).toBeCloseTo(4, 5);
  });
  it("estimator: area, volume and total = sum of material costs", () => {
    const e = estimate(ds.rows, { length: 10, width: 8, height: 3, thickness: 0.15 });
    expect(e.area).toBe(80);
    expect(e.volume).toBeCloseTo(36);
    expect(e.total).toBeCloseTo(sum(e.lines.map((l) => l.cost)));
    expect(e.lines.map((l) => l.material).sort()).toEqual(["Bricks", "Cement", "Sand", "Steel"]);
  });
});
