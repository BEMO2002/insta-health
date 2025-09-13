import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "../Framermotion/Varient";
const MotionSection = motion.section;
export const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = [
    {
      src: "/portrait-doctor-standing-against-blue-background 1.png",
      label: "حجز أقرب طبيب",
    },
    {
      src: "/scientists-examining-tissue-samples-microscope-laboratory-with-digital-displays-graphs 1.png",
      label: "المعامل",
    },
    {
      src: "/pharam.jpg",
      label: "الصيدليات",
    },
  ];

  return (
    <>
      {/* Mobile (no animation) */}
      <section id="About" className="py-16 p-4 root lg:hidden">
        <div className="container mx-auto mb-3">
          <div className="flex items-center justify-center flex-col gap-3 ">
            <span className="mx-4 text-xl font-bold text-second">خدماتنا</span>
            <p className="mx-4 text-lg font-semibold">
              كل قطاعات المجال الصحي بين ايديك
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3">
            {images.map((item, index) => (
              <div
                key={index}
                className="h-[220px] rounded-2xl overflow-hidden relative"
              >
                <img
                  className="h-full w-full object-cover"
                  src={item.src}
                  alt={`service-${index}`}
                />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-lg px-3 py-1 rounded-md">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop/large screens (with animation/hover) */}
      <MotionSection
        id="About"
        variants={fadeIn("down", 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
        className="py-20 p-8 root hidden lg:block"
      >
        <div className="container mx-auto max-w-7xl mb-3  cursor-pointer">
          <div className="flex items-center justify-center flex-col gap-3 ">
            <span className="mx-4 text-xl lg:text-3xl text-second font-bold">
              خدماتنا
            </span>
            <p className="mx-4 text-lg lg:text-2xl font-semibold">
              كل قطاعات المجال الصحي بين ايديك
            </p>
          </div>

          <div className="container mx-auto flex items-center flex-col lg:flex-row gap-x-3 gap-y-3 list-image mt-8 ">
            {images.map((item, index) => (
              <div
                key={index}
                onMouseOver={() => {
                  setActiveIndex(index);
                }}
                className={`h-[200px] lg:h-[600px]  rounded-2xl cursor-pointer overflow-hidden relative transition-all duration-300 ${
                  activeIndex === index ? "active" : ""
                }`}
              >
                <img
                  className="overflow-hidden h-full w-full object-cover"
                  src={item.src}
                  alt={`car${index}`}
                />
                <span className="absolute bottom-4 left-4 bg-black/60 text-white lg:text-2xl px-6 py-2 rounded-md">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>
    </>
  );
};
