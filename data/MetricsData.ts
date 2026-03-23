import { MetricItem } from "@/types/metricsTypes";

export const metricsData: MetricItem[] = [
  {
    label: "In Transit",
    value: 3,
    sub: "across branches",
    tone: "amber",
    delta: { type: "positive", value: "+1 today" },
  },
  {
    label: "Delivered",
    value: 24,
    sub: "this month",
    tone: "green",
    delta: { type: "positive", value: "↑ 18%" },
  },
  {
    label: "Pending",
    value: 5,
    sub: "awaiting dispatch",
    tone: "neutral",
    delta: { type: "neutral", value: "—" },
  },
];
