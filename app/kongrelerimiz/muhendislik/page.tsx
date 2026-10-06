import { CongressSeriesPage } from "@/components/CongressSeriesPage";

export default function Page() {
  return (
    <CongressSeriesPage
      seriesNs="series.muhendislik"
      seriesNameKey="series.muhendislik.subtitle"
      editions={[]}
      showComingSoon
    />
  );
}
