import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Btn({ variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "light" }) {
  const v = {
    primary: "bg-gradient-primary text-primary-foreground shadow-glow hover:brightness-105",
    outline: "border border-input bg-card text-foreground hover:border-primary hover:text-primary",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
    light: "border border-navy-foreground/25 text-navy-foreground hover:bg-navy-foreground/10",
  }[variant];
  return <button {...p} className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50", v, className)} />;
}

export function PageHeader({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="bg-gradient-navy blueprint-grid text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8 animate-fade-up">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-navy-foreground/70">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("card-base p-5 sm:p-6", className)}>{children}</div>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [n, setN] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1100);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <>{format(n)}</>;
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function Loading() {
  return <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">Loading dataset…</div>;
}
