import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateScrambles() {
  const scrambles = document.querySelectorAll<HTMLElement>("[data-scramble]");
  if (scrambles.length === 0) return;

  if (prefersReducedMotion) {
    scrambles.forEach((el) => {
      const finalText = el.dataset.scramble || el.textContent || "";
      el.textContent = finalText;
      el.style.visibility = "visible";
    });
    return;
  }

  scrambles.forEach((el) => {
    if (!el.dataset.scramble) {
      el.dataset.scramble = el.textContent ?? "";
    }
  });

  const scrambleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        scrambleObserver.unobserve(el);
        const finalText = el.dataset.scramble ?? "";
        gsap.to(el, {
          duration: 1.0,
          ease: "none",
          onStart: () => {
            el.style.visibility = "visible";
          },
          scrambleText: {
            text: finalText,
            chars: "upperCase",
            speed: 0.55,
            revealDelay: 0.25,
          },
        });
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -5% 0px" }
  );

  scrambles.forEach((el) => {
    if (el.closest("#top")) return;
    scrambleObserver.observe(el);
  });
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

function choreographHero() {
  const hero = document.querySelector<HTMLElement>("#top");
  if (!hero) return;

  const navRoot = document.querySelector<HTMLElement>("[data-nav-root]");
  const navItems = document.querySelectorAll<HTMLElement>("[data-nav-item]");
  const chip = hero.querySelector<HTMLElement>('[data-hero="chip"]');
  const tagline = hero.querySelector<HTMLElement>('[data-hero="tagline"]');
  const title = hero.querySelectorAll<HTMLElement>('[data-hero="title"] [data-scramble]');
  const copy = hero.querySelector<HTMLElement>('[data-hero="copy"]');
  const ctas = hero.querySelector<HTMLElement>('[data-hero="ctas"]');
  const supporters = hero.querySelector<HTMLElement>('[data-hero="supporters"]');
  const sprite = hero.querySelector<HTMLElement>('[data-hero="sprite"]');

  if (prefersReducedMotion) {
    [chip, tagline, copy, ctas, supporters, sprite, navRoot].forEach((el) => {
      if (!el) return;
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    navItems.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.55 } });

  if (navRoot) {
    tl.fromTo(navRoot, { y: "-100%" }, { y: "0%", duration: 0.45, ease: "power2.out" }, 0);
  }
  if (navItems.length > 0) {
    tl.fromTo(
      navItems,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" },
      0.1
    );
  }

  if (chip) {
    tl.fromTo(chip, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 0.1);
  }
  if (tagline) {
    tl.fromTo(tagline, { opacity: 0, y: 16 }, { opacity: 1, y: 0 }, "-=0.25");
  }
  title.forEach((t, i) => {
    const finalText = t.dataset.scramble ?? "";
    tl.to(
      t,
      {
        duration: 1.0,
        ease: "none",
        onStart: () => {
          t.style.visibility = "visible";
        },
        scrambleText: {
          text: finalText,
          chars: "upperCase",
          speed: 0.55,
          revealDelay: 0.2,
        },
      },
      i === 0 ? "-=0.15" : "-=0.7"
    );
  });
  if (copy) {
    tl.fromTo(copy, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4");
  }
  if (ctas) {
    tl.fromTo(
      ctas,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" },
      "-=0.35"
    );
  }
  if (supporters) {
    tl.fromTo(supporters, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");
  }
  if (sprite) {
    tl.fromTo(
      sprite,
      { opacity: 0, scale: 0.82, y: 24 },
      { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "back.out(1.3)" },
      0.25
    );
  }
}

function setupRevealObserver() {
  const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-hero])");
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
  animateScrambles();
  choreographHero();
  setupRevealObserver();
  setupSpriteIdles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
