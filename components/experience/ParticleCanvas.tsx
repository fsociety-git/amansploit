"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { backgroundFragmentShader, backgroundVertexShader } from "./background";
import { particleFragmentShader, particleVertexShader } from "./particles";
import { computeProgress, experienceProgress } from "./progress";

/**
 * Fixed WebGL backdrop — aurora shader + scroll-driven particle morph + bloom.
 * Adapted from the "New Era" scene (commercial licence) with:
 *   · acid-green palette to match the site
 *   · three-act progress remapping (see ./progress.ts)
 *   · device-aware particle density
 *   · prefers-reduced-motion handling
 */
export default function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- device-aware density ---------------------------------------------
    const w = window.innerWidth;
    const cores = navigator.hardwareConcurrency ?? 4;
    const low = w < 768 || cores <= 4;
    const mid = w < 1280;
    const segW = low ? 80 : mid ? 140 : 200;
    const segH = low ? 240 : mid ? 420 : 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      antialias: !low,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1 : 2));
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);

    // --- aurora background --------------------------------------------------
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        color1: { value: new THREE.Color("#1fa88a") }, // acid, dimmed
        color2: { value: new THREE.Color("#0d3f52") }, // deep teal
      },
      vertexShader: backgroundVertexShader,
      fragmentShader: backgroundFragmentShader,
      depthWrite: false,
    });
    bgScene.add(new THREE.Mesh(bgGeometry, bgMaterial));

    // --- particles ----------------------------------------------------------
    const geometry = new THREE.SphereGeometry(4.2, segW, segH);
    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uIntro: { value: 0 } },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(geometry, material);
    particles.frustumCulled = false;
    scene.add(particles);

    // --- post-processing ----------------------------------------------------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(bgScene, bgCamera));
    const renderFg = new RenderPass(scene, camera);
    renderFg.clear = false;
    renderFg.clearDepth = true;
    composer.addPass(renderFg);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      low ? 0.7 : 1.05,
      0.5,
      0.05,
    );
    composer.addPass(bloomPass);

    let time = 0;
    let raf = 0;
    let introStart = 0;
    const INTRO_MS = 2600;
    let smoothed = 0;
    let opacity = 1;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      bgMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      time += 0.005;

      if (introStart === 0) introStart = now;
      const introRaw = reduced ? 1 : Math.min((now - introStart) / INTRO_MS, 1);
      const introEased = 1 - Math.pow(1 - introRaw, 3);
      material.uniforms.uIntro.value = introEased;

      const { progress, opacity: targetOpacity } = computeProgress();
      smoothed += (progress - smoothed) * (reduced ? 1 : 0.075);
      opacity += (targetOpacity - opacity) * (reduced ? 1 : 0.08);
      container.style.opacity = String(opacity);
      experienceProgress.current = smoothed;
      const s = smoothed;

      material.uniforms.uTime.value = time;
      material.uniforms.uScroll.value = s;
      bgMaterial.uniforms.uTime.value = time;
      bgMaterial.uniforms.uScroll.value = s;

      // --- camera choreography (driven by remapped progress) ---
      const panProgress = Math.min(s / 0.5, 1);
      const smoothPan = panProgress * panProgress * (3 - 2 * panProgress);
      const flyPhase = s < 0.5 ? 0 : Math.min((s - 0.5) / 0.35, 1);
      const dive = s < 0.8 ? 0 : Math.min((s - 0.8) / 0.12, 1);

      camera.position.y = -38 * smoothPan + 5 * Math.pow(dive, 2);
      camera.position.z = 8 - 4 * smoothPan - 55 * flyPhase;

      const pull = s < 0.93 ? 0 : Math.min((s - 0.93) / 0.07, 1);
      const smoothPull = pull * pull * (3 - 2 * pull);
      camera.position.z += 75 * smoothPull;
      camera.position.y += 35 * smoothPull;

      let waveTilt = 0;
      if (s > 0.3 && s < 0.7) waveTilt = Math.sin(((s - 0.3) / 0.4) * Math.PI) * 15;

      const lookY = THREE.MathUtils.lerp(camera.position.y + waveTilt, -33, smoothPull);
      const lookZ = THREE.MathUtils.lerp(camera.position.z - 100, -120, smoothPull);
      camera.position.z += (1 - introEased) * -3 * (1 - Math.min(s / 0.05, 1));
      camera.lookAt(new THREE.Vector3(0, lookY, lookZ));

      particles.rotation.y = smoothPan * Math.PI * 2;
      particles.rotation.x = Math.sin(smoothPan * Math.PI) * 0.15;

      // --- big-bang flash at the galaxy transition ---
      const flashP = s < 0.9 ? 0 : Math.min((s - 0.9) / 0.03, 1);
      const hide = s < 0.93 ? 0 : Math.min((s - 0.93) / 0.02, 1);
      glow.style.transform = `translate(-50%, -50%) scale(${Math.pow(flashP, 4) * 400})`;
      glow.style.opacity = String((1 - hide) * opacity);

      composer.render();
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.remove();
      geometry.dispose();
      material.dispose();
      bgGeometry.dispose();
      bgMaterial.dispose();
      bloomPass.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      />
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-1/2 z-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(210,255,242,1) 40%, rgba(45,224,179,0) 80%)",
        }}
      />
    </>
  );
}
