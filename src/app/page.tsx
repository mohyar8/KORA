import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { EventFacts } from "@/components/sections/EventFacts";
import { About } from "@/components/sections/About";
import { Tracks } from "@/components/sections/Tracks";
import { SponsorTeaser } from "@/components/sections/SponsorTeaser";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <About />
      <Tracks />
      <EventFacts />
      <SponsorTeaser />
      <FinalCta />
    </>
  );
}
