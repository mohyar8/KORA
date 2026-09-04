import { AboutKora } from "./components/AboutKora/AboutKora";
import { Benefits } from "./components/Benefits/Benefits";
import { EventFacts } from "./components/EventFacts/EventFacts";
import { EventTracks } from "./components/EventTracks/EventTracks";
import { FinalCTA } from "./components/FinalCTA/FinalCTA";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { Hero } from "./components/Hero/Hero";
import { Teams } from "./components/Teams/Teams";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">تجاوز إلى المحتوى الرئيسي</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <div id="top" />
        <Hero />
        <EventFacts />
        <AboutKora />
        <EventTracks />
        <Benefits />
        <Teams />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
