import { isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import Script from "next/script";

import { createClient } from "@/prismicio";

export default async function Header() {
  const client = createClient();
  const menu = await client.getSingle("menu");

  return (
    <>
      <div id="shader-layer"></div>
      <header className="topbar">
        <span className="topbar-brand"><a href="/">Future Storytelling Lab</a></span>
        <input id="menu-toggle" className="menu-toggle" type="checkbox" aria-label="Open menu" />
        <label htmlFor="menu-toggle" className="menu-button" aria-label="Toggle navigation menu">
          <span></span>
          <span></span>
          <span></span>
        </label>
        <nav className="topbar-links" aria-label="Primary navigation">
          {menu.data.link.map((item, index) => {
            if (!isFilled.link(item)) {
              return null;
            }

            return (
              <PrismicNextLink key={`${item.text ?? "menu-link"}-${index}`} field={item}>
                {item.text ?? "Link"}
              </PrismicNextLink>
            );
          })}
        </nav>
      </header>
      <Script
        src="https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js"
        strategy="afterInteractive"
      />
      <Script id="header-effects" strategy="afterInteractive">
        {`
          (() => {
            if (window.__fslHeaderEffectsInit) return;
            window.__fslHeaderEffectsInit = true;

            const init = () => {
              if (typeof window.p5 !== "function") {
                window.requestAnimationFrame(init);
                return;
              }

              const shaderLayer = document.getElementById("shader-layer");
              if (!shaderLayer) {
                return;
              }

              if (window.__fslP5Instance && typeof window.__fslP5Instance.remove === "function") {
                window.__fslP5Instance.remove();
              }

              const PARTICLE_COUNT = 2500;
              const sketch = (p) => {
                const particles = [];
                let mx = 0;
                let my = 0;
                let targetMX = 0;
                let targetMY = 0;
                let mouseActive = false;

                class Particle {
                  constructor() {
                    this.x = p.random(window.innerWidth);
                    this.y = p.random(window.innerHeight);
                    this.vx = p.random(-0.4, 0.4);
                    this.vy = p.random(-0.4, 0.4);
                    this.size = p.random(1, 3);
                    this.speed = p.random(0.5, 1.2);
                    this.nox = p.random(10000);
                    this.noy = p.random(10000);
                    this.r = p.random(200, 255);
                    this.g = p.random(0, 170);
                    this.b = 0;
                    this.a = p.random(90, 200);
                  }

                  update(t) {
                    const noiseScale = 0.00028;
                    const nx = (p.noise(this.nox + t * noiseScale) - 0.5) * 0.14;
                    const ny = (p.noise(this.noy + t * noiseScale) - 0.5) * 0.14;

                    const dx = mx - this.x;
                    const dy = my - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
                    const pull = this.speed * (mouseActive ? 0.045 : 0.004);

                    this.vx += (dx / dist) * pull + nx;
                    this.vy += (dy / dist) * pull + ny;
                    this.vx *= 0.97;
                    this.vy *= 0.97;

                    this.x += this.vx;
                    this.y += this.vy;

                    if (this.x < -6) this.x = p.width + 6;
                    else if (this.x > p.width + 6) this.x = -6;
                    if (this.y < -6) this.y = p.height + 6;
                    else if (this.y > p.height + 6) this.y = -6;
                  }

                  draw() {
                    p.fill(this.r, this.g, this.b, this.a);
                    p.rect(this.x, this.y, this.size);
                  }
                }

                p.setup = () => {
                  const cnv = p.createCanvas(window.innerWidth, window.innerHeight);
                  cnv.parent(shaderLayer);
                  p.noStroke();

                  mx = p.width / 2;
                  my = p.height / 2;
                  targetMX = mx;
                  targetMY = my;

                  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
                    particles.push(new Particle());
                  }
                };

                p.draw = () => {
                  p.clear();
                  mx += (targetMX - mx) * 0.07;
                  my += (targetMY - my) * 0.07;

                  const t = p.millis();
                  p.noStroke();
                  for (const particle of particles) {
                    particle.update(t);
                    particle.draw();
                  }
                };

                p.windowResized = () => {
                  p.resizeCanvas(window.innerWidth, window.innerHeight);
                };

                window.addEventListener(
                  "pointermove",
                  (e) => {
                    targetMX = e.clientX;
                    targetMY = e.clientY;
                    mouseActive = true;
                  },
                  { passive: true },
                );
              };

              window.__fslP5Instance = new window.p5(sketch);

              const revealTargets = document.querySelectorAll(".reveal");
              revealTargets.forEach((el, i) => {
                if (!el.style.getPropertyValue("--reveal-delay")) {
                  const delay = (i % 8) * 55;
                  el.style.setProperty("--reveal-delay", delay + "ms");
                }
              });

              const revealObserver = new IntersectionObserver(
                (entries) => {
                  entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                      entry.target.classList.add("is-visible");
                    } else {
                      entry.target.classList.remove("is-visible");
                    }
                  });
                },
                {
                  threshold: 0.08,
                  rootMargin: "0px 0px -8% 0px",
                },
              );

              revealTargets.forEach((el) => revealObserver.observe(el));

              const navLinks = document.querySelectorAll(".topbar a");
              const menuToggle = document.getElementById("menu-toggle");
              navLinks.forEach((link) => {
                link.addEventListener("click", (event) => {
                  const href = link.getAttribute("href") || "";
                  if (menuToggle && "checked" in menuToggle) {
                    menuToggle.checked = false;
                  }

                  if (!href.startsWith("#")) return;

                  event.preventDefault();
                  const id = href.slice(1);
                  const target = document.getElementById(id);
                  if (!target) return;

                  const header = document.querySelector(".topbar");
                  const offset = header ? header.offsetHeight + 18 : 0;
                  const y = target.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                });
              });
            };

            init();
          })();
        `}
      </Script>
    </>
  );
}