import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, ArrowUpDown } from "lucide-react";
import { useDataset, DATASET_URL } from "@/lib/use-dataset";
import { uniqueProjects, inr, fmt, type Project } from "@/lib/data";
import { PageHeader, Card, Btn, Select, Loading } from "@/components/ui-kit";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Project Data – ConstructX" },
      { name: "description", content: "Browse, search and sort every recorded construction project with dimensions and total cost." },
      { property: "og:title", content: "Project Data – ConstructX" },
      { property: "og:description", content: "Browse, search and sort every recorded construction project with dimensions and total cost." },
    ],
  }),
  component: Projects,
});

const SORTS: Record<string, keyof Project> = { "Project ID": "Project_ID", Area: "Area_m2", Volume: "Volume_m3", "Project Cost": "Total_Project_Cost_INR" };

function Projects() {
  const { data } = useDataset();
  const [q, setQ] = useState("");
  const [st, setSt] = useState("All");
  const [sort, setSort] = useState("Project ID");
  const [desc, setDesc] = useState(false);

  const list = useMemo(() => {
    if (!data) return [];
    const k = SORTS[sort];
    return uniqueProjects(data.rows)
      .filter((p) => (st === "All" || p.Structure_Type === st) && p.Project_ID.toLowerCase().includes(q.trim().toLowerCase()))
      .sort((a, b) => {
        const r = typeof a[k] === "number" ? (a[k] as number) - (b[k] as number) : String(a[k]).localeCompare(String(b[k]));
        return desc ? -r : r;
      });
  }, [data, q, st, sort, desc]);

  return (
    <>
      <PageHeader eyebrow="Projects" title="Project Data" subtitle="One row per unique project, with dimensions and total project cost." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!data ? <Loading /> : (
          <Card>
            <div className="grid gap-4 md:grid-cols-[1fr_180px_200px_auto_auto] md:items-end">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search</span>
                <div className="flex items-center rounded-lg border border-input bg-card px-3 focus-within:border-primary">
                  <Search size={16} className="text-muted-foreground" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by Project ID, e.g. P012" className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
                </div>
              </label>
              <Select label="Structure Type" value={st} onChange={setSt} options={["All", "Wall", "Room", "House"]} />
              <Select label="Sort by" value={sort} onChange={setSort} options={Object.keys(SORTS)} />
              <Btn variant="outline" onClick={() => setDesc(!desc)}><ArrowUpDown size={16} /> {desc ? "Descending" : "Ascending"}</Btn>
              <a href={DATASET_URL} download="construction_data.csv" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"><Download size={16} /> Download Dataset</a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Showing {list.length} project{list.length === 1 ? "" : "s"}</p>
            <div className="mt-3 max-h-[640px] overflow-auto rounded-lg border">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="sticky top-0 bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>{["Project ID", "Structure", "Length (m)", "Width (m)", "Height (m)", "Thickness (m)", "Area (m²)", "Volume (m³)", "Total Project Cost"].map((h, i) => <th key={h} className={"px-4 py-3 " + (i > 1 ? "text-right" : "")}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.Project_ID} className="border-t hover:bg-secondary/60">
                      <td className="px-4 py-3 font-semibold">{p.Project_ID}</td>
                      <td className="px-4"><span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">{p.Structure_Type}</span></td>
                      {[p.Length_m, p.Width_m, p.Height_m, p.Thickness_m, p.Area_m2, p.Volume_m3].map((n, i) => <td key={i} className="px-4 text-right tabular-nums">{fmt(n)}</td>)}
                      <td className="px-4 text-right font-semibold tabular-nums">{inr(p.Total_Project_Cost_INR)}</td>
                    </tr>
                  ))}
                  {!list.length && <tr><td colSpan={9} className="py-10 text-center text-muted-foreground">No projects match your search.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
