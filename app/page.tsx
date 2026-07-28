import dynamic from "next/dynamic";
import { connection } from "next/server";
import Nav from "@/components/Nav";
import ActOne from "@/components/ActOne";
import ToolMarquee from "@/components/ToolMarquee";
import Services from "@/components/Services";
import CaseStudies from "@/components/CaseStudies";
import Process from "@/components/Process";
import Packages from "@/components/Packages";
import Estimator from "@/components/Estimator";
import WorkingWithMe from "@/components/WorkingWithMe";
import SelfScan from "@/components/SelfScan";
import HashScroll from "@/components/HashScroll";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const ParticleCanvas = dynamic(() => import("@/components/experience/ParticleCanvas"));

// Nonce-based CSP (proxy.ts) requires a per-request render — a statically
// prerendered page has no request to mint a nonce for.
export default async function Home() {
  await connection();

  return (
    <>
      <ParticleCanvas />
      <HashScroll />
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
          <Packages />
          <Estimator />
          <Testimonials />
          <WorkingWithMe />
          <SelfScan />
          <About />
        </div>

        {/* ---- ACT III — galaxy finale ---- */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
