/**
 * Three-act experience progress.
 *
 * The particle shader expects a single 0→1 value that walks it through
 * sphere → DNA → wave → tunnel → galaxy. Our page is not one continuous
 * scroll experience — it's a cinematic opening act, a normal-flow content
 * body, and a galaxy finale. So we remap document scroll onto the shader's
 * timeline instead of feeding it raw scroll.
 *
 *   Act I   (#act1, tall section at top)  → shader 0.00 … 0.60   (sphere → wave)
 *   Act II  (content in normal flow)      → shader held at 0.60, canvas faded
 *   Act III (#contact in view)            → shader 0.60 … 1.00   (tunnel → galaxy)
 */

export const experienceProgress = { current: 0 };
export const canvasOpacity = { current: 1 };

const ACT1_END = 0.6;

export function computeProgress(): { progress: number; opacity: number } {
  const act1 = document.getElementById("act1");
  const contact = document.getElementById("contact");
  const vh = window.innerHeight;

  // --- Act I -------------------------------------------------------------
  if (act1) {
    const r = act1.getBoundingClientRect();
    const span = r.height - vh;
    if (r.bottom > vh && span > 0) {
      const p = Math.min(Math.max(-r.top / span, 0), 1);
      return { progress: p * ACT1_END, opacity: 1 };
    }
  }

  // --- Act III -----------------------------------------------------------
  if (contact) {
    const r = contact.getBoundingClientRect();
    // ramp begins when the contact section's top enters the lower viewport
    const start = vh;
    const end = 0;
    if (r.top < start) {
      const p = Math.min(Math.max((start - r.top) / (start - end + 1), 0), 1);
      return { progress: ACT1_END + p * (1 - ACT1_END), opacity: 0.35 + p * 0.65 };
    }
  }

  // --- Act II: hold the wave, fade the canvas back ------------------------
  return { progress: ACT1_END, opacity: 0.14 };
}
