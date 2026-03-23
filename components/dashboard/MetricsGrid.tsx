import { MetricItem, MetricsGridProps } from "@/types/metricsTypes";
import MetricCard from "./MetricCard";


export default function MetricsGrid({ data }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {data.map((item: MetricItem, i: number) => (
        <MetricCard key={i} {...item} />
      ))}
    </div>
  );
}