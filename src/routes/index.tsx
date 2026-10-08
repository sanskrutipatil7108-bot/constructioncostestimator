import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Layers, Boxes, IndianRupee, Wallet, Ruler, Calculator, BarChart3, Table2 } from "lucide-react";
import hero from "@/assets/hero-blueprint.jpg";
import { useDataset } from "@/lib/use-dataset";
import { uniqueProjects, uniq, avg, sum, inr, fmt } from "@/lib/data";
import { CountUp, Card } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ConstructX – Build Smarter. Estimate Better." },
      { name: "description", content: "Calculate construction material requirements and project costs using data-driven estimation." },
      { property: "og:title", content: "ConstructX – Build Smarter. Estimate Better." },
      { property: "og:description", content: "Calculate construction material requirements and project costs using data-driven estimation." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useDataset();
  const rows = data?.rows ?? [];
  const projects = uniqueProjects(rows);
  const stats = [
    { icon: Building2, label: "Total Projects", value: projects.length, f: (n: number) => fmt(n, 0) },
    { icon: Boxes, label: "Materials", value: uniq(rows.map((r) => r.Material)).length, f: (n: number) => fmt(n, 0) },
    { icon: Layers, label: "Structure Types", value: uniq(rows.map((r) => r.Structure_Type)).length, f: (n: number) => fmt(n, 0) },
    { icon: IndianRupee, label: "Average Project Cost", value: avg(projects.map((p) => p.Total_Project_Cost_INR)), f: (n: number) => inr(n) },
    { icon: Wallet, label: "Total Material Cost", value: sum(rows.map((r) => r.Material_Cost_INR)), f: (n: number) => inr(n) },
    { icon: Ruler, label: "Total Construction Area", value: sum(projects.map((p) => p.Area_m2)), f: (n: number) => fmt(n, 0) + " m²" },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-navy blueprint-grid text-navy-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-36">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/15 px-3 py-1 text-xs font-semibold text-navy-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Data-driven construction estimation
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Build Smarter.<br /><span className="text-primary">Estimate Better.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-navy-foreground/70">Calculate construction material requirements and project costs using data-driven estimation.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/estimator" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5">Start Estimating <ArrowRight size={18} /></Link>
              <Link to="/analytics" className="inline-flex items-center gap-2 rounded-lg border border-navy-foreground/25 px-6 py-3 font-semibold text-navy-foreground transition hover:bg-navy-foreground/10">Explore Analytics</Link>
            </div>
          </div>
          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="absolute -inset-6 rounded-3xl bg-primary/10 blur-3xl" />
            <img src={hero} alt="Isometric architectural blueprint of a modern building" width={1280} height={1024} className="relative rounded-2xl border border-navy-foreground/10 shadow-lift" />
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s, i) => (
            <div key={s.label} className="card-base hover-lift animate-fade-up p-6" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary"><s.icon size={20} /></span>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              </div>
              <p className="mt-4 font-display text-3xl font-bold">{data ? <CountUp value={s.value} format={s.f} /> : "—"}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold">Everything you need to plan a build</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { icon: Calculator, t: "Estimator", d: "Enter dimensions and get material quantities and costs instantly.", to: "/estimator" as const },
            { icon: BarChart3, t: "Analytics", d: "Explore cost patterns across materials and structure types.", to: "/analytics" as const },
            { icon: Table2, t: "Projects", d: "Search, sort and compare every recorded project.", to: "/projects" as const },
          ].map((f) => (
            <Link key={f.t} to={f.to}>
              <Card className="hover-lift h-full">
                <f.icon className="text-primary" />
                <h3 className="mt-4 text-lg font-bold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
