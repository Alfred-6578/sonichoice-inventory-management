
export interface MetricItem {
  label: string;
  value: number | string;
  sub: string;
  delta: {
    type: "positive" | "negative" | "neutral";
    value: string;
  };
  tone: "amber" | "green" | "neutral" | "dark";
}

export interface MetricsGridProps {
  data: MetricItem[];
}