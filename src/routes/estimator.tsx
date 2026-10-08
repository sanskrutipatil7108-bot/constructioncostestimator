import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, Download, Printer, AlertCircle } from "lucide-react";
import { useDataset } from "@/lib/use-dataset";
import { estimate, inr, fmt, download } from "@/lib/data";
import { PageHeader, Card, Btn, Select, Loading } from "@/components/ui-kit";
import { BarChart, DoughnutChart } from "@/components/charts";

export const Route = createFileRoute("/estimator")({
  head: () => ({
    meta: [
      { title: "Construction Cost Estimator – ConstructX" },
      { name: "description", content: "Enter structure dimensions to estimate material requirements and construction cost." },
      { property: "og:title", content: "Construction Cost Estimator – ConstructX" },
      { property: "og:description", content: "Enter structure dimensions to estimate material requirements and construction cost." },
    ],
  }),
  component: Estimator,
});

const FIELDS = [
  { key: "length", label: "Length", ph: "e.g. 10" },
  { key: "width", label: "Width", ph: "e.g. 8" },
  { key: "height", label: "Height", ph: "e.g. 3" },
  { key: "thickness", label: "Thickness", ph: "e.g. 0.15" },
] as const;
type Key = (typeof FIELDS)[number]["key"];

function Estimator() {
  const { data } = useDataset();
  const [type, setType] = useState("Room");
  const [vals, setVals] = useState<Record<Key, string>>({ length: "", width: "", height: "", thickness: "" });
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [result, setResult] = useState<(ReturnType<typeof estimate> & { type: string }) | null>(null);

  const calc = () => {
    if (!data) return;
    const e: Partial<Record<Key, string>> = {};
    FIELDS.forEach((f) => {
      const n = Number(vals[f.key]);
      if (vals[f.key].trim() === "" || !Number.isFinite(n) || n <= 0) e[f.key] = `${f.label} must be greater than 0`;
    });
    setErrors(e);
    if (Object.keys(e).length) return setResult(null);
    setResult({ ...estimate(data.rows, { length: +vals.length, width: +vals.width, height: +vals.height, thickness: +vals.thickness }), type });
  };

  const exportCsv = () => {
    if (!result) return;
    const lines = [
      "ConstructX Estimate",
      `Structure Type,${result.type}`,
      ...FIELDS.map((f) => `${f.label} (m),${vals[f.key]}`),
      `Area (m2),${result.area.toFixed(2)}`,
      `Volume (m3),${result.volume.toFixed(2)}`,
      "",
      "Material,Estimated Quantity,Unit,Unit Price (INR),Estimated Cost (INR)",
      ...result.lines.map((l) => `${l.material},${l.qty.toFixed(2)},${l.unit},${l.price.toFixed(2)},${l.cost.toFixed(2)}`),
      "",
      `Total Estimated Cost (INR),${result.total.toFixed(2)}`,
    ];
    download("constructx_estimate.csv", lines.join("\n"));
  };

  return (
    <>
      <div className="no-print"><PageHeader eyebrow="Estimator" title="Construction Cost Estimator" subtitle="Enter your structure dimensions to estimate material requirements and cost." /></div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!data ? <Loading /> : (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card className="no-print h-fit lg:sticky lg:top-24">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Calculator className="text-primary" size={20} /> Dimensions</h2>
              <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); calc(); }} noValidate>
                <Select label="Structure Type" value={type} onChange={setType} options={["Wall", "Room", "House"]} />
                {FIELDS.map((f) => (
                  <label key={f.key} className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.label} (m)</span>
                    <div className={"flex items-center rounded-lg border bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25 " + (errors[f.key] ? "border-destructive" : "border-input")}>
                      <input type="number" inputMode="decimal" step="any" min="0" placeholder={f.ph} value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} className="w-full bg-transparent px-3 py-2.5 text-sm outline-none" />
                      <span className="pr-3 text-sm font-medium text-muted-foreground">m</span>
                    </div>
                    {errors[f.key] && <span className="mt-1 flex items-center gap-1 text-xs text-destructive"><AlertCircle size={12} /> {errors[f.key]}</span>}
                  </label>
                ))}
                <Btn type="submit" className="w-full py-3.5 text-base">Calculate Estimate</Btn>
              </form>
              <p className="mt-4 text-xs text-muted-foreground">Quantities use median material consumption per m³ and median unit prices from {data.rows.length} recorded material entries.</p>
            </Card>

            {!result ? (
              <Card className="no-print grid min-h-80 place-items-center text-center">
                <div>
                  <Calculator className="mx-auto text-primary" size={40} />
                  <p className="mt-4 font-display text-lg font-semibold">Your estimate will appear here</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try Length 10, Width 8, Height 3, Thickness 0.15.</p>
                </div>
              </Card>
            ) : (
              <div className="print-area space-y-6 animate-fade-up">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Structure Type", result.type],
                    ["Area", fmt(result.area) + " m²"],
                    ["Volume", fmt(result.volume) + " m³"],
                    ["Total Estimated Cost", inr(result.total)],
                  ].map(([k, v], i) => (
                    <div key={k} className={"card-base p-5 " + (i === 3 ? "bg-gradient-navy text-navy-foreground" : "")}>
                      <p className={"text-xs font-semibold uppercase tracking-wide " + (i === 3 ? "text-navy-foreground/70" : "text-muted-foreground")}>{k}</p>
                      <p className={"mt-2 font-display text-2xl font-bold " + (i === 3 ? "text-primary" : "")}>{v}</p>
                    </div>
                  ))}
                </div>

                <Card className="print-area">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-bold">Material Breakdown</h2>
                    <div className="no-print flex flex-wrap gap-2">
                      <Btn variant="outline" onClick={exportCsv}><Download size={16} /> Download Estimate</Btn>
                      <Btn variant="outline" onClick={() => window.print()}><Printer size={16} /> Print Estimate</Btn>
                    </div>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-3">Material</th><th className="text-right">Estimated Quantity</th><th className="pl-4">Unit</th><th className="text-right">Unit Price</th><th className="text-right">Estimated Cost</th>
                      </tr></thead>
                      <tbody>{result.lines.map((l) => (
                        <tr key={l.material} className="border-b last:border-0 hover:bg-secondary/60">
                          <td className="py-3 font-semibold">{l.material}</td>
                          <td className="text-right tabular-nums">{fmt(l.qty)}</td>
                          <td className="pl-4 text-muted-foreground">{l.unit}</td>
                          <td className="text-right tabular-nums">{inr(l.price, 2)}</td>
                          <td className="text-right font-semibold tabular-nums">{inr(l.cost)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent px-5 py-4">
                    <span className="font-semibold text-accent-foreground">Total Estimated Construction Cost</span>
                    <span className="font-display text-3xl font-extrabold text-primary">{inr(result.total)}</span>
                  </div>
                </Card>

                <div className="grid gap-6 xl:grid-cols-2">
                  <Card><h3 className="font-bold">Material Cost Distribution</h3><div className="mt-4 h-72"><DoughnutChart labels={result.lines.map((l) => l.material)} data={result.lines.map((l) => l.cost)} /></div></Card>
                  <Card><h3 className="font-bold">Estimated Material Quantity</h3><div className="mt-4 h-72"><BarChart labels={result.lines.map((l) => `${l.material} (${l.unit})`)} data={result.lines.map((l) => l.qty)} label="Quantity" /></div></Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
