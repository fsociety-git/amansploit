import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import ActOne from "@/components/ActOne";
import ToolMarquee from "@/components/ToolMarquee";
import Services from "@/components/Services";
import CaseStudies from "@/components/CaseStudies";
import Process from "@/components/Process";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const ParticleCanvas = dynamic(() => import("@/components/experience/ParticleCanvas"));

export default function Home() {
  return (
    <>
      <ParticleCanvas />
      <Nav />
      <main className="flex-1">
        {/* ---- ACT I — cinematic opening over the particle morph ---- */}
        <ActOne />

        {/* ---- ACT II — the pitch, in normal flow ---- */}
        <div className="relative z-10 bg-void/85 backdrop-blur-[2px] border-t border-line/60">
          <ToolMarquee />
          <Services />
          <CaseStudies />
          <Process />
          <About />
        </div>

        {/* ---- ACT III — galaxy finale ---- */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
