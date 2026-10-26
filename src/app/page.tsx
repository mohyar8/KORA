import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { Event } from "@/components/sections/Event";
import { Tracks } from "@/components/sections/Tracks";
import { Participate } from "@/components/sections/Participate";

/** Home: Hero → Event → Tracks → Participate (content brief, 2026-10-26). */
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Event />
      <Tracks />
      <Participate />
    </>
  );
}
