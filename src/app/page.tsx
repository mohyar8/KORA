import { Hero } from "@/components/sections/Hero";
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
      <Manifesto />
      <About />
      <Tracks />
      <EventFacts />
      <WhyJoin />
      <FinalCta />
    </>
  );
}
