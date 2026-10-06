import { Hero } from "@/components/Hero";
import { ActiveCongresses } from "@/components/ActiveCongresses";
import { PastCongresses } from "@/components/PastCongresses";

export default function Home() {
  return (
    <>
      <Hero />
      <ActiveCongresses />
      <PastCongresses />
    </>
  );
}
