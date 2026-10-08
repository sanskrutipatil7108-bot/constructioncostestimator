import { createFileRoute } from "@tanstack/react-router";
import { Check, Info, Target } from "lucide-react";
import { PageHeader, Card } from "@/components/ui-kit";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ConstructX – Data-Driven Construction Estimation" },
      { name: "description", content: "ConstructX simplifies material quantity and cost estimation with consumption patterns, pricing data and analytics." },
      { property: "og:title", content: "About ConstructX" },
      { property: "og:description", content: "ConstructX simplifies material quantity and cost estimation with consumption patterns, pricing data and analytics." },
    ],
  }),
  component: About,
});

const FEATURES = ["Material quantity estimation", "Construction cost estimation", "Data-driven calculations", "Interactive analytics", "Project comparison", "Material cost analysis", "Visual reporting"];

function About() {
  return (
    <>
      <PageHeader eyebrow="About" title="About ConstructX" subtitle="ConstructX is a data-driven construction estimation platform designed to simplify material quantity and cost estimation. It combines construction dimensions, material consumption patterns, pricing information, and interactive analytics to provide a clear overview of expected construction requirements and costs." />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Card>
          <Target className="text-primary" />
          <h2 className="mt-4 text-xl font-bold">What We Do</h2>
          <p className="mt-2 text-muted-foreground">ConstructX helps users estimate construction material requirements and understand project costs through an intuitive digital interface.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-bold">Key Features</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-primary"><Check size={12} /></span>{f}</li>)}
          </ul>
        </Card>
        <Card className="border-l-4 border-l-primary lg:col-span-2">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Info className="text-primary" size={20} /> Important Note</h2>
          <p className="mt-2 text-muted-foreground">Construction estimates are indicative and should be validated against engineering drawings, project specifications, local material prices, labor costs, taxes, transportation, and applicable construction standards before actual execution.</p>
        </Card>
      </div>
    </>
  );
}
