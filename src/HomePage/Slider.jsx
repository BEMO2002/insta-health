import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import looder from "../assets/Home/Isolation_Mode (2).png";
import looder2 from "../assets/Home/Isolation_Mode.png";
import looder3 from "../assets/Home/Isolation_Mode (1).png";
import looder4 from "../assets/Home/Polygon 1.png";
import looder5 from "../assets/Home/Polygon 2.png";
import mouse from "../assets/Home/wireless-mouse_3355048 1.png";
import { motion } from "framer-motion";
import { fadeIn } from "../Framermotion/Varient";
import playStore from "../assets/Home/google.png";
import appStore from "../assets/Home/apple (1).png";
import baseApi from "../api/baseApi";
const MotionDiv = motion.div;

const ProfessionalCarousel = ({ items, autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
    resetTimer();
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
    resetTimer();
  }, [items.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    resetTimer();
  }, []);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    timerRef.current = setTimeout(goToNext, interval);

    return () => {
      resetTimer();
    };
  }, [currentIndex, isPaused, autoPlay, interval, goToNext]);

  return (
    <div
      className="relative bg-baseThree z-2 w-full h-[90vh] max-h-screen overflow-hidden lg:pt-10 md:pt-40 pt-14 "
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Animated Floating Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
        {/* Circle 1 */}
        <div className="absolute top-1/4 left-1/6 w-4 h-4 bg-primary/30 rounded-full animate-float-scale"></div>

        {/* Circle 2 */}
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-second/20 rounded-full animate-bounce-scale"></div>

        {/* Circle 3 */}
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-third/40 rounded-full animate-pulse-scale"></div>

        {/* Circle 4 */}
        <div className="absolute top-1/2 right-1/6 w-5 h-5 bg-primary/25 rounded-full animate-rotate-scale"></div>

        {/* Circle 5 */}
        <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-second/30 rounded-full animate-wave-scale"></div>

        {/* Circle 6 */}
        <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-third/35 rounded-full animate-float-scale"></div>

        {/* Circle 7 */}
        <div className="absolute bottom-1/2 left-1/6 w-6 h-6 bg-primary/20 rounded-full animate-bounce-scale"></div>
      </div>

      {/* Slides */}
      <div className="relative w-full h-full transition-transform duration-700 ease-in-out">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-700 ${
              index === currentIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={index !== currentIndex}
          >
            <img
              src={looder}
              alt=""
              className="absolute opacity-30 lg:opacity-100 md:opacity-100 md:left-20 left-5 top-0 w-40  z-5"
            />
            <img
              src={looder2}
              alt=""
              className="absolute opacity-30 lg:opacity-55 md:opacity-100 md:right-20 right-5 bottom-0 w-40  z-5"
            />
            <img
              src={looder3}
              alt=""
              className="absolute opacity-30 lg:opacity-55 md:opacity-100 md:left-20 left-5 bottom-0 w-40  z-5"
            />
            <img
              src={looder4}
              alt=""
              className="absolute opacity-30 lg:opacity-55 md:opacity-100 right-0 top-20  z-5"
            />

            <div
              className="container mx-auto px-4 py-12 relative z-10"
              dir="rtl"
            >
              <div className="flex flex-col lg:flex-row items-center text-right gap-8 lg:gap-5">
                {/* Text Section */}
                <MotionDiv
                  variants={fadeIn("down", 0.2)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false, amount: 0 }}
                  className="w-full lg:w-1/2 relative z-20"
                >
                  {item.paragraph && (
                    <h2 className="text-2xl font-[700] p-2 px-6 w-fit ml-auto border border-base hover:bg-second hover:text-white transition-all duration-300 cursor-pointer rounded-full  mb-4 text-black leading-tight">
                      {item.paragraph}
                    </h2>
                  )}

                  {item.descriptionTwo && (
                    <p className="text-sm md:text-lg lg:text-xl font-semibold md:w-[520px] ml-auto text-base mt-5 mb-6">
                      {item.descriptionTwo}
                    </p>
                  )}
                  {item.title && (
                    <h3 className="text-lg md:text-3xl lg:text-5xl font-bold mb-2 text-base">
                      {item.title}
                    </h3>
                  )}
                  <div className="flex gap-2 mt-5">
                    <img src={playStore} alt="" className="lg:w-52 w-32" />
                    <img src={appStore} alt="" className="lg:w-52 w-32" />
                  </div>
                </MotionDiv>
                <MotionDiv
                  variants={fadeIn("right", 0.2)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false, amount: 0 }}
                  className="w-full lg:w-1/2 relative z-10"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.alt || `Slide ${index + 1}`}
                      className="w-full h-auto md:max-h-[1320px] object-contain rounded-xl"
                    />
                  </div>
                </MotionDiv>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Centered CTA above indicators (triangle pointing down, content upright) */}
      <div className="absolute left-1/2 -translate-x-1/2 md:bottom-24 bottom-10 z-20 select-none">
        <div className="relative w-[180px] h-[120px]  mx-auto">
          <img
            src={looder5}
            alt=""
            className="absolute inset-0 hidden lg:block  object-contain "
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold">
            <span className="text-sm hidden lg:block md:text-white lg:text-lg mt-1">
              اعرف أكثر
            </span>
            <img
              src={mouse}
              alt=""
              className=" md:w-16 w-12 mt-2 animate-bounce "
            />
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Always Visible */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 shadow-lg bg-white text-black hover:bg-black hover:text-white transition duration-300"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 shadow-lg bg-white text-black hover:bg-black hover:text-white transition duration-300"
        aria-label="Next slide"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === currentIndex
                ? "bg-second w-6"
                : "bg-primary hover:bg-second"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
};

// Example usage
const Slider = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await baseApi.get("/Advertisments");
        if (response.data.success) {
          const advertisements = response.data.data.map((ad) => ({
            id: ad.id,
            image: ad.imageUrl,
            paragraph: "انستا هيلث",
            title: "حمل التطبيق الأن",
            descriptionTwo: ad.description,
          }));
          setCarouselItems(advertisements);
        } else {
          setError("تعذر تحميل الإعلانات");
        }
      } catch {
        setError("تعذر تحميل الإعلانات");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  if (loading) {
    return (
      <div className="bg-secondary">
        <div className="flex justify-center items-center h-[90vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary">
        <div className="flex justify-center items-center h-[90vh]">
          <p className="text-center text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary">
      <ProfessionalCarousel
        items={carouselItems}
        autoPlay={true}
        interval={6000}
      />
    </div>
  );
};

export default Slider;
