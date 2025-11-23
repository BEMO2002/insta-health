import React, { useEffect, useRef, useState } from "react";
import { GrLinkTop } from "react-icons/gr";

export const Top = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOverFooter, setIsOverFooter] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY >= 600);

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

  return (
    isVisible && (
      <button
        ref={buttonRef}
        onClick={scrollToTop}
        className={`top z-50  p-[15px] border-2 border-primary rounded-full font-bold fixed right-[10px] bottom-[20px] cursor-pointer duration-200
          ${
            isOverFooter
              ? "bg-white text-baseTwo border-baseTwo"
              : "bg-transparent text-baseTwo hover:bg-baseTwo hover:text-white"
          }`}
      >
        <GrLinkTop className="lg:text-2xl text-primary text-xl font-bold" />
      </button>
    )
  );
};
