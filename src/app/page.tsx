import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Marquee } from "@/components/ui/Marquee";
import { EventFacts } from "@/components/sections/EventFacts";
import { About } from "@/components/sections/About";
import { Tracks } from "@/components/sections/Tracks";
import { Participate } from "@/components/sections/Participate";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Manifesto />
      <About />
      <Tracks />
      <EventFacts />
      <Participate />
      <FinalCta />
    </>
  );
}
