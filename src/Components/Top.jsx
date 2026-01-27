import React, { useEffect, useRef, useState } from "react";
import { GrLinkTop } from "react-icons/gr";

export const Top = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOverFooter, setIsOverFooter] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // حالة البروجريس
  const buttonRef = useRef(null);

  useEffect(() => {
    const toggleVisibility = () => {
      // حساب نسبة السكرول
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);

      setIsVisible(window.scrollY >= 1200);

      const footer = document.querySelector("footer");
      if (footer && buttonRef.current) {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (footerTop <= windowHeight - 60) {
          setIsOverFooter(true);
        } else {
          setIsOverFooter(false);
        }
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // حسابات الدائرة (القطر والمحيط)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scrollProgress / 100) * circumference;

  return (
    isVisible && (
      <button
        aria-label="Scroll to Top"
        ref={buttonRef}
        onClick={scrollToTop}
        className={`top z-50 p-[15px] border-2 border-primary rounded-full font-bold fixed right-[25px] bottom-[80px] cursor-pointer duration-200 flex items-center justify-center
          ${
            isOverFooter
              ? "bg-white text-baseTwo border-baseTwo"
              : "bg-transparent text-baseTwo"
          }`}
      >
        {/* SVG البروجريس */}
        <svg
          className="absolute top-0 left-0 w-full h-full -rotate-90"
          viewBox="0 0 64 64"
        >
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: offset,
              transition: "stroke-dashoffset 0.1s linear",
            }}
            className="text-primary"
          />
        </svg>

        <GrLinkTop className="lg:text-2xl text-primary text-xl font-bold relative z-10" />
      </button>
    )
  );
};
