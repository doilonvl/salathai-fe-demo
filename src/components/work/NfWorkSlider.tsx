"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import SplitType from "split-type";
import * as THREE from "three";
import { useTranslations } from "next-intl";
import { nfWorkSlides } from "@/data/nf-work-slides";
import { scrambleIn, scrambleOut, scrambleVisible } from "@/lib/nf-scramble";
import { ReservationForm } from "@/components/shared/reservation-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import LandingHeader from "@/components/shared/LandingHeader";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec2 uTexture1Size;
  uniform vec2 uTexture2Size;
  varying vec2 vUv;

  vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    vec2 s = uResolution / textureSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
  }

  vec2 getDistortedUv(vec2 uv, vec2 direction, float factor) {
    vec2 scaledDirection = direction;
    scaledDirection.y *= 2.0;
    return uv - scaledDirection * factor;
  }

  struct LensDistortion {
    vec2 distortedUV;
    float inside;
  };

  LensDistortion getLensDistortion(
    vec2 p,
    vec2 uv,
    vec2 sphereCenter,
    float sphereRadius,
    float focusFactor
  ) {
    vec2 distortionDirection = normalize(p - sphereCenter);
    float focusRadius = sphereRadius * focusFactor;
    float focusStrength = sphereRadius / 3000.0;
    float focusSdf = length(sphereCenter - p) - focusRadius;
    float sphereSdf = length(sphereCenter - p) - sphereRadius;
    float inside = smoothstep(0.0, 1.0, -sphereSdf / (sphereRadius * 0.001));

    float magnifierFactor = focusSdf / (sphereRadius - focusRadius);
    float mFactor = clamp(magnifierFactor * inside, 0.0, 1.0);
    mFactor = pow(mFactor, 5.0);

    float distortionFactor = mFactor * focusStrength;
    vec2 distortedUV = getDistortedUv(uv, distortionDirection, distortionFactor);

    return LensDistortion(distortedUV, inside);
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 p = vUv * uResolution;

    vec2 uv1 = getCoverUV(vUv, uTexture1Size);
    vec2 uv2 = getCoverUV(vUv, uTexture2Size);

    float maxRadius = length(uResolution) * 1.5;
    float bubbleRadius = uProgress * maxRadius;
    vec2 sphereCenter = center * uResolution;
    float focusFactor = 0.25;

    float dist = length(sphereCenter - p);
    float mask = step(bubbleRadius, dist);

    vec4 currentImg = texture2D(uTexture1, uv1);

    LensDistortion distortion = getLensDistortion(
      p, uv2, sphereCenter, bubbleRadius, focusFactor
    );

    vec4 newImg = texture2D(uTexture2, distortion.distortedUV);

    float finalMask = max(mask, 1.0 - distortion.inside);
    vec4 color = mix(newImg, currentImg, finalMask);

    gl_FragColor = color;
  }
`;

function createCharacterElements(element: HTMLElement) {
  const text = element.textContent ?? "";
  element.textContent = "";

  const words = text.split(" ");
  words.forEach((word, index) => {
    const wordEl = document.createElement("span");
    wordEl.className = "nf-word";

    [...word].forEach((char) => {
      const charEl = document.createElement("span");
      charEl.className = "nf-char";
      charEl.innerHTML = `<span>${char}</span>`;
      wordEl.appendChild(charEl);
    });

    element.appendChild(wordEl);

    if (index < words.length - 1) {
      element.appendChild(document.createTextNode(" "));
    }
  });
}

function splitLines(element: HTMLElement) {
  const original = element.textContent ?? "";
  element.dataset.nfOriginalText = original;
  element.textContent = original;

  new SplitType(element, { types: "lines", lineClass: "nf-line" });
  element.querySelectorAll<HTMLElement>(".nf-line").forEach((line) => {
    line.innerHTML = `<span>${line.textContent ?? ""}</span>`;
  });
}

export default function NfWorkSlider() {
  const tShowcase = useTranslations("showcase");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const rafRef = useRef(0);

  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const firstRenderRef = useRef(true);

  const hoverCleanupRef = useRef<Array<() => void>>([]);

  const processTextElements = (container: HTMLElement) => {
    const title = container.querySelector<HTMLElement>(".nf-work__title h1");
    if (title) createCharacterElements(title);

    container
      .querySelectorAll<HTMLElement>(".nf-work__description p")
      .forEach(splitLines);

    const link = container.querySelector<HTMLElement>(
      ".nf-work__link a, .nf-work__link button"
    );
    if (link) {
      splitLines(link);

      if (window.innerWidth >= 1000 && !link.dataset.nfHoverInit) {
        link.dataset.nfHoverInit = "true";
        let isAnimating = false;
        let currentSplit: ReturnType<typeof scrambleVisible> | null = null;

        if (!link.dataset.nfOriginalColor) {
          link.dataset.nfOriginalColor = getComputedStyle(link).color;
        }

        const onEnter = () => {
          if (isAnimating) return;
          isAnimating = true;

          if (currentSplit) currentSplit.revert();
          currentSplit = scrambleVisible(link, 0, {
            duration: 0.1,
            charDelay: 25,
            stagger: 10,
            maxIterations: 5,
          });

          setTimeout(() => {
            isAnimating = false;
          }, 250);
        };

        const onLeave = () => {
          link.style.color = link.dataset.nfOriginalColor || "";
        };

        link.addEventListener("mouseenter", onEnter);
        link.addEventListener("mouseleave", onLeave);

        hoverCleanupRef.current.push(() => {
          link.removeEventListener("mouseenter", onEnter);
          link.removeEventListener("mouseleave", onLeave);
        });
      }
    }
  };

  const animateSlideTransition = (nextIndex: number) => {
    const content = contentRef.current;
    if (!content) return;

    const lines = content.querySelectorAll<HTMLElement>(".nf-line span");
    const title = content.querySelector<HTMLElement>(".nf-work__title h1");

    if (title) scrambleOut(title, 0);

    gsap
      .timeline()
      .to(
        lines,
        {
          y: "-100%",
          duration: 0.6,
          stagger: 0.025,
          ease: "power2.inOut",
        },
        0.1
      )
      .call(
        () => {
          setSlideIndex(nextIndex);
        },
        [],
        0.8
      );
  };

  const handleSlideChange = () => {
    if (isTransitioningRef.current) return;
    if (texturesRef.current.length < 2 || !materialRef.current) return;

    isTransitioningRef.current = true;

    const current = currentIndexRef.current;
    const next = (current + 1) % nfWorkSlides.length;

    const material = materialRef.current;
    const textures = texturesRef.current;

    material.uniforms.uTexture1.value = textures[current];
    material.uniforms.uTexture2.value = textures[next];
    material.uniforms.uTexture1Size.value = textures[current].userData.size;
    material.uniforms.uTexture2Size.value = textures[next].userData.size;

    animateSlideTransition(next);

    gsap.fromTo(
      material.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 2.5,
        ease: "power2.inOut",
        onComplete: () => {
          material.uniforms.uProgress.value = 0;
          material.uniforms.uTexture1.value = textures[next];
          material.uniforms.uTexture1Size.value = textures[next].userData.size;
        },
      }
    );
  };

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    hoverCleanupRef.current.forEach((fn) => fn());
    hoverCleanupRef.current = [];

    const run = () => {
      processTextElements(content);

      const lines = content.querySelectorAll<HTMLElement>(".nf-line span");
      gsap.set(lines, { y: firstRenderRef.current ? "0%" : "100%" });

      if (firstRenderRef.current) {
        firstRenderRef.current = false;
        return;
      }

      const title = content.querySelector<HTMLElement>(".nf-work__title h1");
      gsap.set(content, { opacity: 1 });

      gsap
        .timeline({
          onComplete: () => {
            isTransitioningRef.current = false;
            currentIndexRef.current = slideIndex;
          },
        })
        .call(() => {
          if (title) scrambleIn(title, 0);
        })
        .to(
          lines,
          { y: "0%", duration: 0.5, stagger: 0.1, ease: "power2.inOut" },
          0.3
        );
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }
  }, [slideIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture1: { value: null },
        uTexture2: { value: null },
        uProgress: { value: 0.0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTexture1Size: { value: new THREE.Vector2(1, 1) },
        uTexture2Size: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader,
      fragmentShader,
    });
    materialRef.current = material;

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    const loader = new THREE.TextureLoader();
    const loadTexture = (url: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });

    let disposed = false;

    (async () => {
      const textures = await Promise.all(
        nfWorkSlides.map((slide) => loadTexture(slide.image))
      );
      textures.forEach((texture) => {
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        const img = texture.image as HTMLImageElement;
        texture.userData = {
          size: new THREE.Vector2(img.width, img.height),
        };
      });

      if (disposed) return;

      texturesRef.current = textures;
      material.uniforms.uTexture1.value = textures[0];
      material.uniforms.uTexture2.value = textures[1];
      material.uniforms.uTexture1Size.value = textures[0].userData.size;
      material.uniforms.uTexture2Size.value = textures[1].userData.size;
    })();

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);

      texturesRef.current.forEach((t) => t.dispose());
      material.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    let resizeTimeout: number | undefined;

    const onResize = () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        const content = contentRef.current;
        if (!content) return;
        processTextElements(content);
        const lines = content.querySelectorAll<HTMLElement>(".nf-line span");
        gsap.set(lines, { y: "0%" });
      }, 120);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimeout);
    };
  }, []);

  const slide = nfWorkSlides[slideIndex];
  const slideCopy = {
    title: tShowcase(`slides.${slide.key}.title`),
    description: tShowcase(`slides.${slide.key}.description`),
    type: tShowcase(`slides.${slide.key}.type`),
    field: tShowcase(`slides.${slide.key}.field`),
    date: tShowcase(`slides.${slide.key}.date`),
  };
  const onSliderClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".nf-work__link a, .nf-work__link button")) return;
    handleSlideChange();
  };

  return (
    <div className="nf-work">
      <LandingHeader onOpenReservation={() => setShowReservationModal(true)} />
      <div className="nf-work__slider" onClick={onSliderClick}>
        <canvas ref={canvasRef} className="nf-work__canvas" />

        <div ref={contentRef} className="nf-work__content" key={slide.key}>
          <div className="nf-work__title">
            <h1>{slideCopy.title}</h1>
          </div>

          <div className="nf-work__description">
            <p>{slideCopy.description}</p>

            <div className="nf-work__info">
              <p>
                {tShowcase("labels.type")}. {slideCopy.type}
              </p>
              <p>
                {tShowcase("labels.field")}. {slideCopy.field}
              </p>
              <p>
                {tShowcase("labels.date")}. {slideCopy.date}
              </p>
            </div>

            <div className="nf-work__link">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowReservationModal(true);
                }}
              >
                [ {tShowcase("cta")} ]
              </button>
            </div>
          </div>
        </div>

        <div className="nf-work__footer">
          <div className="nf-work__footer-inner">
            <p>{tShowcase("footerLeft")}</p>
            <p>{tShowcase("footerRight")}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showReservationModal && (
          <motion.div
            key="reservation-overlay"
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-4 sm:px-4"
            onClick={() => setShowReservationModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              className="relative w-full max-w-3xl md:max-w-4xl h-[90vh] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <button
                type="button"
                onClick={() => setShowReservationModal(false)}
                className="absolute right-3 top-3 z-[1201] inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 text-white shadow-lg transition hover:bg-neutral-800 focus:outline-none"
              >
                X
              </button>
              <ScrollArea className="h-full rounded-3xl">
                <ReservationForm
                  variant="modal"
                  onSuccess={() => setShowReservationModal(false)}
                />
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
