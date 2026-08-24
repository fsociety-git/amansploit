import dynamic from "next/dynamic";
import { connection } from "next/server";
import Nav from "@/components/Nav";
import ActOne from "@/components/ActOne";
import ToolMarquee from "@/components/ToolMarquee";
import ShieldCallout from "@/components/ShieldCallout";
import Credibility from "@/components/Credibility";
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

const ParticleCanvas = dynamic(() => import("@/components/experience/ParticleCanvas"), {
  // The WebGL bundle is large and the hero sits on a transparent body, so
  // without this the first paint is flat black until three.js arrives. A static
  // gradient in the same palette means the page opens looking deliberate rather
  // than broken, and it costs nothing — no JS, no layout shift, and it is simply
  // painted over once the canvas mounts.
  loading: () => (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 bg-void"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% 42%, rgba(45,224,179,0.10), transparent 70%), radial-gradient(ellipse 60% 50% at 78% 30%, rgba(24,140,178,0.10), transparent 72%)",
      }}
    />
  ),
});

// Nonce-based CSP (proxy.ts) requires a per-request render — a statically
// prerendered page has no request to mint a nonce for.
export default async function Home() {
  await connection();

  return (
    <>
      <ParticleCanvas />
      <HashScroll />
      <Nav />
      <main id="content" className="flex-1">
        {/* ---- ACT I — cinematic opening over the particle morph ---- */}
        <ActOne />

        {/* ---- ACT II — the pitch, in normal flow ---- */}
        <div className="relative z-10 bg-void/85 backdrop-blur-[2px] border-t border-line/60">
          <ToolMarquee />
          {/* Before the pitch: the only visitor who cannot wait is the one being
              impersonated. */}
          <ShieldCallout />
          <Credibility />
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
