import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Tooltip, Legend, Title,
} from "chart.js";
import { Bar, Doughnut, Scatter } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Tooltip, Legend, Title);
ChartJS.defaults.font.family = "Manrope, sans-serif";
ChartJS.defaults.color = "#6B7280";

// Chart.js renders to canvas and needs concrete colours; these mirror the design tokens.
export const PALETTE = ["#F97316", "#14213D", "#94A3B8", "#3B5B9A", "#FDBA74"];
const ORANGE = "#F97316";
const NAVY = "#14213D";
const grid = { color: "rgba(20,33,61,0.06)" };

const inrTick = (v: number | string) => "₹" + Number(v).toLocaleString("en-IN", { notation: "compact", maximumFractionDigits: 1 } as Intl.NumberFormatOptions);

export function BarChart({ labels, data, label, money, color = ORANGE, xTitle, yTitle }: { labels: string[]; data: number[]; label: string; money?: boolean; color?: string; xTitle?: string; yTitle?: string }) {
  return (
    <Bar
      data={{ labels, datasets: [{ label, data, backgroundColor: labels.map((_, i) => (i % 2 ? NAVY : color)), borderRadius: 8, maxBarThickness: 56 }] }}
      options={{
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => (money ? "₹" + Number(c.raw).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : Number(c.raw).toLocaleString("en-IN", { maximumFractionDigits: 2 })) } } },
        scales: {
          x: { grid: { display: false }, title: { display: !!xTitle, text: xTitle } },
          y: { grid, beginAtZero: true, title: { display: !!yTitle, text: yTitle }, ticks: money ? { callback: inrTick } : {} },
        },
      }}
    />
  );
}

export function DoughnutChart({ labels, data }: { labels: string[]; data: number[] }) {
  const total = data.reduce((a, b) => a + b, 0);
  return (
    <Doughnut
      data={{ labels, datasets: [{ data, backgroundColor: PALETTE, borderWidth: 3, borderColor: "#fff", hoverOffset: 8 }] }}
      options={{
        responsive: true, maintainAspectRatio: false, cutout: "65%",
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true, padding: 16 } },
          tooltip: { callbacks: { label: (c) => `${c.label}: ₹${Number(c.raw).toLocaleString("en-IN", { maximumFractionDigits: 0 })} (${total ? ((Number(c.raw) / total) * 100).toFixed(1) : 0}%)` } },
        },
      }}
    />
  );
}

export function ScatterChart({ groups, xTitle }: { groups: { label: string; points: { x: number; y: number; id: string }[] }[]; xTitle: string }) {
  return (
    <Scatter
      data={{ datasets: groups.map((g, i) => ({ label: g.label, data: g.points, backgroundColor: PALETTE[i % PALETTE.length] + "CC", pointRadius: 5, pointHoverRadius: 8 })) }}
      options={{
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true } },
          tooltip: { callbacks: { label: (c) => { const p = c.raw as { x: number; y: number; id: string }; return `${p.id}: ${p.x.toLocaleString("en-IN")} · ₹${p.y.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; } } },
        },
        scales: { x: { grid, title: { display: true, text: xTitle } }, y: { grid, title: { display: true, text: "Project Cost (₹)" }, ticks: { callback: inrTick } } },
      }}
    />
  );
}
