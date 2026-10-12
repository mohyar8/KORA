import { Hero } from "@/components/sections/Hero";
import { ExhibitionSection } from "@/components/exhibition/ExhibitionSection";
import { Manifesto } from "@/components/sections/Manifesto";
import { EventFacts } from "@/components/sections/EventFacts";
import { About } from "@/components/sections/About";
import { Tracks } from "@/components/sections/Tracks";
import { WhyJoin } from "@/components/sections/WhyJoin";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <ExhibitionSection />
      <Manifesto />
      <About />
      <Tracks />
      <EventFacts />
      <WhyJoin />
      <FinalCta />
    </>
  );
}
