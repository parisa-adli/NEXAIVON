"use client";
import Link from "next/link";
import { useState } from "react";
import { LuArrowLeft, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { heroSlides } from "@/constants/home";

function Hero() {
  const [index, setIndex] = useState(0);
  const slide = heroSlides[index];
  const Icon = slide.icon;
  const go = (step) =>
    setIndex((i) => (i + step + heroSlides.length) % heroSlides.length);

  return (
    <section
      aria-roledescription="carousel"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-stone-200 via-stone-100 to-stone-300 dark:from-secondary-100 dark:to-secondary-200"
    >
      <div className="grid md:grid-cols-2 items-center gap-8 p-8 md:p-16 min-h-[22rem]">
        <div className="space-y-4" aria-live="polite">
          <p className="text-secondary-500">{slide.eyebrow}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-900">
            {slide.title}
          </h1>
          <p className="text-secondary-600">{slide.subtitle}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-x-3 rounded-full bg-brand px-7 py-3 text-white font-medium"
          >
            مشاهده محصولات
            <LuArrowLeft />
          </Link>
        </div>
        <Icon
          aria-hidden
          className="hidden md:block justify-self-center w-56 h-56 text-secondary-700 stroke-1"
        />
      </div>
      <div className="absolute bottom-6 left-8 flex items-center gap-x-3">
        <button type="button" aria-label="اسلاید قبلی" onClick={() => go(-1)}>
          <LuChevronRight />
        </button>
        <button type="button" aria-label="اسلاید بعدی" onClick={() => go(1)}>
          <LuChevronLeft />
        </button>
        <div className="flex gap-x-1.5 mr-2">
          {heroSlides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`اسلاید ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full border border-secondary-800 ${
                i === index ? "bg-secondary-800" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
export default Hero;
