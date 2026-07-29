"use client";

import { useEffect, useRef, useState } from "react";

import type { RichTextField } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";

type ResidentItem = {
  id: string;
  uid: string;
  name: string;
  category?: string | null;
  text: RichTextField;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

type ResidentsCarouselProps = {
  title: string;
  items: ResidentItem[];
};

export default function ResidentsCarousel({ title, items }: ResidentsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [offsetPx, setOffsetPx] = useState(0);
  const [introActive, setIntroActive] = useState(true);

  const getCardsPerView = () => {
    if (window.innerWidth <= 700) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 4;
  };

  useEffect(() => {
    const onResize = () => {
      setCardsPerView(getCardsPerView());
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const maxIndex = Math.max(0, items.length - cardsPerView);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = track.querySelectorAll<HTMLElement>(".resident-card");
    const target = cards[activeIndex];
    setOffsetPx(target?.offsetLeft ?? 0);
  }, [activeIndex, cardsPerView, items.length]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIntroActive(false);
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const goPrev = () => {
    setActiveIndex((current) => (current === 0 ? maxIndex : current - 1));
  };

  const goNext = () => {
    setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1));
  };

  if (items.length === 0) {
    return (
      <div className="residents-carousel">
        <div className="section-head residents-head">
          <h2>{title}</h2>
        </div>
        <div className="residents-track">
          <article className="resident-card reveal is-visible">
            <h3>No persons yet</h3>
            <p>Publish Person documents in Prismic</p>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div
      className="residents-carousel"
      style={{ "--cards-per-view": String(cardsPerView) } as React.CSSProperties}
    >
      <div className="section-head residents-head">
        <h2>{title}</h2>
        <div className="residents-controls" aria-label="Residents carousel controls">
          <button
            type="button"
            className="residents-nav"
            onClick={goPrev}
            aria-label="Previous resident"
            disabled={items.length <= cardsPerView}
          >
            Prev
          </button>
          <button
            type="button"
            className="residents-nav"
            onClick={goNext}
            aria-label="Next resident"
            disabled={items.length <= cardsPerView}
          >
            Next
          </button>
        </div>
      </div>

      <div className="residents-viewport" aria-live="polite">
        <div
          ref={trackRef}
          className="residents-track"
          style={{ transform: `translateX(-${offsetPx}px)` }}
        >
          {items.map((item, index) => {
            const category = item.category?.trim() ? item.category : "Person";
            const slot = index - activeIndex;
            const inVisibleRange = slot >= 0 && slot < cardsPerView;
            const introDelay = inVisibleRange ? slot * 120 : 0;
            const cardClassName = introActive
              ? `resident-card reveal${inVisibleRange ? " is-visible" : ""}`
              : "resident-card reveal is-visible";

            return (
              <article
                key={item.id}
                className={cardClassName}
                style={{ "--reveal-delay": `${introDelay}ms` } as React.CSSProperties}
              >
                <a href={`/person/${item.uid}`} className="resident-link" aria-label={`View ${item.name}`}>
                  {item.imageUrl && (
                    <div className="resident-image-wrap">
                      <img src={item.imageUrl} alt={item.imageAlt ?? item.name ?? "Person image"} />
                    </div>
                  )}
                  <h3>{item.name || "Unnamed person"}</h3>
                  <PrismicRichText field={item.text} />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}