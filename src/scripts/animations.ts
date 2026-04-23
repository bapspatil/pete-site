import { gsap } from "gsap";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateHero() {
  if (prefersReducedMotion) return;

  const heroChars = document.querySelectorAll<HTMLElement>("[data-reveal-char] .word > span");
  if (heroChars.length > 0) {
    gsap.to(heroChars, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: "back.out(1.6)",
      stagger: 0.035,
      delay: 0.15,
    });
  }
}

function formatCounter(val: number, decimals: number, suffix: string): string {
  const formatted =
    decimals > 0
      ? val.toFixed(decimals)
      : Math.round(val).toLocaleString("en-US");
  return `${formatted}${suffix}`;
}

function tweenCounter(el: HTMLElement) {
  const target = parseFloat(el.dataset.counterTarget ?? "0");
  const decimals = parseInt(el.dataset.counterDecimals ?? "0", 10);
  const suffix = el.dataset.counterSuffix ?? "";
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: 1.6,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = formatCounter(obj.val, decimals, suffix);
    },
    onComplete: () => {
      el.textContent = formatCounter(target, decimals, suffix);
    },
  });
}

function setupRevealObserver() {
  const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (revealEls.length === 0) return;

  if (prefersReducedMotion) {
    revealEls.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.querySelectorAll<HTMLElement>("[data-counter]").forEach((c) => {
        const target = parseFloat(c.dataset.counterTarget ?? "0");
        const decimals = parseInt(c.dataset.counterDecimals ?? "0", 10);
        const suffix = c.dataset.counterSuffix ?? "";
        c.textContent = formatCounter(target, decimals, suffix);
      });
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        });
        el.querySelectorAll<HTMLElement>("[data-counter]").forEach((c) => tweenCounter(c));
        observer.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function setupSpriteIdles() {
  if (prefersReducedMotion) return;
  const sprites = document.querySelectorAll<HTMLElement>("[data-sprite-idle]");
  sprites.forEach((sprite, i) => {
    gsap.to(sprite, {
      y: "+=6",
      rotation: i % 2 === 0 ? 1.5 : -1.5,
      duration: 2 + (i % 3) * 0.4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  });
}

function init() {
  animateHero();
  setupRevealObserver();
  setupSpriteIdles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
