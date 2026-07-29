"use client";

import { type FC, useEffect, useRef, useState } from "react";
import { type Content } from "@prismicio/client";
import {
  PrismicImage,
  type SliceComponentProps,
} from "@prismicio/react";

/**
 * Props for `Slider`.
 */
type SliderProps = SliceComponentProps<Content.SliderSlice>;

/**
 * Component for "Slider" Slices.
 */
const Slider: FC<SliderProps> = ({ slice }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [offsetPx, setOffsetPx] = useState(0);

  const images = slice.primary.image.filter((item) => item.image);

  const getCardsPerView = () => {
    const viewportCards = window.innerWidth <= 700 ? 1 : window.innerWidth <= 1100 ? 2 : 3;
    return Math.min(viewportCards, images.length);
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

  const maxIndex = Math.max(0, images.length - cardsPerView);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const slides = track.querySelectorAll<HTMLElement>(".slide");
    const target = slides[activeIndex];
    setOffsetPx(target?.offsetLeft ?? 0);
  }, [activeIndex, cardsPerView, images.length]);

  const goPrev = () => {
    setActiveIndex((current) => (current === 0 ? maxIndex : current - 1));
  };

  const goNext = () => {
    setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1));
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="slider reveal">
      <div
        className="slider-carousel"
        style={{ "--cards-per-view": String(cardsPerView) } as React.CSSProperties}
      >
        <div className="slider-container">
          <div
            ref={trackRef}
            className="slider-track"
            style={{ transform: `translateX(-${offsetPx}px)` }}
          >
            {images.map((item, index) => (
              <div key={index} className="slide">
                {item.image && (
                  <PrismicImage
                    field={item.image}
                    className="slide-image"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {images.length > cardsPerView && (
          <>
            <div className="slider-controls">
              <button
                type="button"
                className="slider-nav slider-nav-prev"
                onClick={goPrev}
                aria-label="Previous slide"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="slider-nav slider-nav-next"
                onClick={goNext}
                aria-label="Next slide"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="slider-dots">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`slider-dot ${index === activeIndex ? "slider-dot-active" : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === activeIndex}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Slider;