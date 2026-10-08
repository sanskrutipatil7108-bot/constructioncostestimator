import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RotateCcw, Lightbulb, ShieldCheck } from "lucide-react";
import { useDataset } from "@/lib/use-dataset";
import { byMaterial, uniqueProjects, uniq, avg, sum, inr, fmt } from "@/lib/data";
import { PageHeader, Card, Btn, Select, Loading, SectionTitle } from "@/components/ui-kit";
import { BarChart, DoughnutChart, ScatterChart } from "@/components/charts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics Dashboard – ConstructX" },
      { name: "description", content: "Interactive analytics of material costs, quantities and project costs by structure type." },
      { property: "og:title", content: "Analytics Dashboard – ConstructX" },
      { property: "og:description", content: "Interactive analytics of material costs, quantities and project costs by structure type." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { data } = useDataset();
  const [st, setSt] = useState("All");
  const [mat, setMat] = useState("All");

  const v = useMemo(() => {
    if (!data) return null;
    const all = data.rows;
    const structs = uniq(all.map((r) => r.Structure_Type)).sort();
    const mats = uniq(all.map((r) => r.Material)).sort();
    const rowsSt = all.filter((r) => st === "All" || r.Structure_Type === st);
    const rows = rowsSt.filter((r) => mat === "All" || r.Material === mat);
    const m = byMaterial(rows);
    const projects = uniqueProjects(rowsSt);
    const allProjects = uniqueProjects(all);
    const byStruct = structs.map((s) => ({ s, avg: avg(uniqueProjects(all.filter((r) => r.Structure_Type === s)).map((p) => p.Total_Project_Cost_INR)), count: allProjects.filter((p) => p.Structure_Type === s).length }));
    const groups = (key: "Area_m2" | "Volume_m3") =>
      structs.filter((s) => st === "All" || s === st).map((s) => ({ label: s, points: projects.filter((p) => p.Structure_Type === s).map((p) => ({ x: p[key], y: p.Total_Project_Cost_INR, id: p.Project_ID })) }));
    // Insights — full dataset
    const mAll = byMaterial(all);
    const top = <T,>(a: T[], f: (x: T) => number) => a.reduce((b, x) => (f(x) > f(b) ? x : b));
    const insights = [
      ["Most common structure type", (() => { const t = top(byStruct, (x) => x.count); return `${t.s} (${t.count} projects)`; })()],
      ["Most expensive material (total cost)", (() => { const t = top(mAll, (x) => x.totalCost); return `${t.material} · ${inr(t.totalCost)}`; })()],
      ["Highest unit price material", (() => { const t = top(mAll, (x) => x.avgPrice); return `${t.material} · ${inr(t.avgPrice, 2)} / ${t.unit}`; })()],
      ["Material with highest quantity", (() => { const t = top(mAll, (x) => x.totalQty); return `${t.material} · ${fmt(t.totalQty, 0)} ${t.unit}`; })()],
      ["Average project cost", inr(avg(allProjects.map((p) => p.Total_Project_Cost_INR)))],
      ["Highest average cost structure", (() => { const t = top(byStruct, (x) => x.avg); return `${t.s} · ${inr(t.avg)}`; })()],
      ["Largest project by area", (() => { const t = top(allProjects, (p) => p.Area_m2); return `${t.Project_ID} · ${fmt(t.Area_m2)} m²`; })()],
      ["Largest project by volume", (() => { const t = top(allProjects, (p) => p.Volume_m3); return `${t.Project_ID} · ${fmt(t.Volume_m3)} m³`; })()],
    ];
    const quality = [
      ["Records", all.length], ["Unique projects", allProjects.length], ["Missing values", data.missing],
      ["Duplicate records", data.duplicates], ["Materials", mats.length], ["Structure types", structs.length],
    ] as const;
    return { structs, mats, m, rows, projects, byStruct, groups, insights, quality };
  }, [data, st, mat]);

  return (
    <>
      <PageHeader eyebrow="Analytics" title="Analytics Dashboard" subtitle="Interactive insights generated directly from the construction dataset." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!v ? <Loading /> : (
          <>
            <Card className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <Select label="Structure Type" value={st} onChange={setSt} options={["All", ...v.structs]} />
                <Select label="Material" value={mat} onChange={setMat} options={["All", ...v.mats]} />
              </div>
              <Btn variant="outline" onClick={() => { setSt("All"); setMat("All"); }}><RotateCcw size={16} /> Reset Filters</Btn>
            </Card>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                ["Projects", fmt(v.projects.length, 0)],
                ["Material Rows", fmt(v.rows.length, 0)],
                ["Material Cost", inr(sum(v.rows.map((r) => r.Material_Cost_INR)))],
                ["Avg Project Cost", inr(avg(v.projects.map((p) => p.Total_Project_Cost_INR)))],
              ].map(([k, val]) => (
                <div key={k} className="card-base p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</p><p className="mt-1 font-display text-xl font-bold text-primary sm:text-2xl">{val}</p></div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Material Cost Comparison"><BarChart labels={v.m.map((x) => x.material)} data={v.m.map((x) => x.totalCost)} label="Total Material Cost" money xTitle="Material" yTitle="Total Material Cost (₹)" /></ChartCard>
              <ChartCard title="Material Quantity"><BarChart labels={v.m.map((x) => `${x.material} (${x.unit})`)} data={v.m.map((x) => x.totalQty)} label="Total Quantity" color="#3B5B9A" xTitle="Material" yTitle="Total Quantity" /></ChartCard>
              <ChartCard title="Cost Distribution"><DoughnutChart labels={v.m.map((x) => x.material)} data={v.m.map((x) => x.totalCost)} /></ChartCard>
              <ChartCard title="Structure Type vs Average Project Cost"><BarChart labels={v.byStruct.map((x) => x.s)} data={v.byStruct.map((x) => x.avg)} label="Average Project Cost" money xTitle="Structure Type" yTitle="Avg Project Cost (₹)" /></ChartCard>
              <ChartCard title="Area vs Project Cost"><ScatterChart groups={v.groups("Area_m2")} xTitle="Area (m²)" /></ChartCard>
              <ChartCard title="Volume vs Project Cost"><ScatterChart groups={v.groups("Volume_m3")} xTitle="Volume (m³)" /></ChartCard>
              <ChartCard title="Unit Price by Material" wide><BarChart labels={v.m.map((x) => `${x.material} (per ${x.unit})`)} data={v.m.map((x) => x.avgPrice)} label="Average Unit Price" money xTitle="Material" yTitle="Average Unit Price (₹)" /></ChartCard>
            </div>

            <section className="mt-14">
              <SectionTitle title="Key Insights" subtitle="Calculated automatically from the full dataset." />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {v.insights.map(([k, val]) => (
                  <Card key={k} className="hover-lift"><Lightbulb className="text-primary" size={20} /><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</p><p className="mt-1 font-display font-bold">{val}</p></Card>
                ))}
              </div>
            </section>

            <section className="mt-14">
              <SectionTitle title="Data Quality" subtitle="Integrity checks run on the loaded dataset." />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {v.quality.map(([k, n]) => (
                  <div key={k} className="card-base p-4 text-center"><ShieldCheck className="mx-auto text-success" size={18} /><p className="mt-2 font-display text-2xl font-bold">{n}</p><p className="text-xs text-muted-foreground">{k}</p></div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}

function ChartCard({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return <Card className={"animate-fade-up " + (wide ? "lg:col-span-2" : "")}><h3 className="font-bold">{title}</h3><div className="mt-4 h-72 sm:h-80">{children}</div></Card>;
}
