import { useEffect, useRef } from "preact/hooks";
import type { ViewsOverTime } from "../lib/analytics.ts";

declare global {
  const Chart: {
    new (ctx: unknown, config: unknown): void;
  };
}

interface Props {
  data: ViewsOverTime[];
}

export default function AnalyticsChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<unknown>(null);

  useEffect(() => {
    if (!canvasRef.current || !(typeof Chart !== "undefined")) return;

    if (chartRef.current) {
      (chartRef.current as { destroy: () => void }).destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((d) => d.date),
        datasets: [{
          label: "Page Views",
          data: data.map((d) => d.count),
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: "#9ca3af" },
            grid: { color: "rgba(75, 85, 99, 0.3)" },
          },
          x: {
            ticks: { color: "#9ca3af" },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        (chartRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [data]);

  return (
    <canvas ref={canvasRef} />
  );
}
