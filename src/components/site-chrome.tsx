import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, HardHat } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/estimator", label: "Estimator" },
  { to: "/analytics", label: "Analytics" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
] as const;

function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow"><HardHat size={18} /></span>
      <span className={"font-display text-lg font-bold " + (light ? "text-navy-foreground" : "text-foreground")}>Construct<span className="text-primary">X</span></span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="no-print fixed inset-x-0 top-0 z-50 border-b border-navy-foreground/10 bg-navy/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="rounded-md px-3 py-2 text-sm font-medium text-navy-foreground/70 transition-colors hover:text-navy-foreground" activeProps={{ className: "!text-primary" }}>{n.label}</Link>
          ))}
        </nav>
        <Link to="/estimator" className="hidden rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 md:inline-flex">Start Estimating</Link>
        <button aria-label="Toggle menu" onClick={() => setOpen(!open)} className="text-navy-foreground md:hidden">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <nav className="border-t border-navy-foreground/10 bg-navy px-4 pb-4 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }} className="block py-3 text-sm font-medium text-navy-foreground/80" activeProps={{ className: "!text-primary" }}>{n.label}</Link>
          ))}
          <Link to="/estimator" onClick={() => setOpen(false)} className="mt-2 block rounded-lg bg-gradient-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">Start Estimating</Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="no-print mt-20 bg-gradient-navy blueprint-grid text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-navy-foreground/70">Build Smarter. Estimate Better.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {NAV.map((n) => <Link key={n.to} to={n.to} className="text-navy-foreground/70 hover:text-primary">{n.label}</Link>)}
        </nav>
        <p className="text-sm text-navy-foreground/60 md:text-right">Construction Material Quantity &amp; Cost Estimation</p>
      </div>
      <div className="border-t border-navy-foreground/10 py-4 text-center text-xs text-navy-foreground/50">© {new Date().getFullYear()} ConstructX</div>
    </footer>
  );
}
