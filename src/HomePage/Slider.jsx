import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import looder from "../assets/Home/Isolation_Mode (2).png";
import looder2 from "../assets/Home/Isolation_Mode.png";
import looder3 from "../assets/Home/Isolation_Mode (1).png";
import looder4 from "../assets/Home/Polygon 1.png";

import { motion } from "framer-motion";
import { fadeIn } from "../Framermotion/Varient";
import playStore from "../assets/Home/google.png";
import appStore from "../assets/Home/apple (1).png";
import baseApi from "../api/baseApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Search from "./Search";

const MotionDiv = motion.div;

const ProfessionalCarousel = ({ items }) => {
  return (
    <div className="relative  z-2 w-full h-[95vh] md:h-[90vh]  ">
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

      {/* Swiper Container */}
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 6000,
          disableOnInteraction: true,
          pauseOnMouseEnter: false,
        }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        pagination={{
          clickable: true,
          el: ".swiper-pagination-custom",
          bulletClass: "swiper-pagination-bullet-custom",
          bulletActiveClass: "swiper-pagination-bullet-active-custom",
        }}
        loop={true}
        className="w-full h-full"
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            <div className="relative w-full h-full flex items-center overflow-hidden justify-center">
              <img
                src={looder}
                alt=""
                className="absolute opacity-30 lg:opacity-100 md:opacity-100 md:left-20 left-5 top-0 w-40 -z-50"
              />
              <img
                src={looder2}
                alt=""
                className="absolute hidden lg:block opacity-30 lg:opacity-55 md:opacity-100 md:right-20 right-5 bottom-0 w-40 -z-50"
              />
              <img
                src={looder3}
                alt=""
                className="absolute hidden lg:block opacity-30 lg:opacity-55 md:opacity-100 md:left-20 left-5 bottom-0 w-40 -z-50"
              />
              <img
                src={looder4}
                alt=""
                className="absolute hidden lg:block opacity-30 lg:opacity-55 md:opacity-100 right-0 top-20 -50"
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
                    className="w-full lg:w-1/2 relative z-[9999]"
                  >
                    <h2 className="text-2xl font-[700] p-2 px-6 w-fit ml-auto border border-base hover:bg-second hover:text-white transition-all duration-300 cursor-pointer rounded-full mb-4 text-black leading-tight">
                      {item.paragraph || "انستا هيلث"}
                    </h2>

                    {item.descriptionTwo && (
                      <p className="text-sm md:text-lg lg:text-xl font-semibold md:w-[520px] ml-auto text-base mt-5 mb-6">
                        {item.descriptionTwo}
                      </p>
                    )}
                    {item.title && (
                      <h3 className="text-lg md:text-3xl lg:text-[32px] font-bold mb-2 lg:mt-[50px] text-base">
                        {item.title}
                      </h3>
                    )}
                    <div className="flex gap-2 mt-5">
                      <img src={playStore} alt="" className="lg:w-52 w-32" />
                      <img src={appStore} alt="" className="lg:w-52 w-32" />
                    </div>
                    {/* Search Component */}
                    <div className=" items-start ml-auto max-w-lg mt-2 relative z-[9999]">
                      <Search />
                    </div>
                  </MotionDiv>
                  <MotionDiv
                    variants={fadeIn("right", 0.2)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0 }}
                    className="w-full lg:w-1/2 relative"
                  >
                    <div className="relative w-full h-auto flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.alt || `Slide ${index + 1}`}
                        className="w-full lg:h-auto  h-[350px]   object-contain rounded-xl"
                      />
                    </div>
                  </MotionDiv>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows */}
      <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 shadow-lg bg-white text-black hover:bg-black hover:text-white transition duration-300">
        <FiChevronLeft className="w-6 h-6" />
      </button>
      <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 shadow-lg bg-white text-black hover:bg-black hover:text-white transition duration-300">
        <FiChevronRight className="w-6 h-6" />
      </button>

      {/* Custom Pagination */}
      <div className="swiper-pagination-custom absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20"></div>

      {/* Custom Styles */}
      <style jsx>{`
        .swiper-pagination-bullet-custom {
          width: 12px;
          height: 12px;
          background-color: #3b82f6;
          border-radius: 50%;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .swiper-pagination-bullet-active-custom {
          background-color: #2685c7;
          width: 24px;
          border-radius: 6px;
        }
        .swiper-button-prev-custom:after,
        .swiper-button-next-custom:after {
          display: none;
        }
      `}</style>
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
          const advertisements = response.data.data
            .filter((ad) => ad.placement === "Slider")
            .map((ad) => ({
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
      <div className="relative pt-10 bg-third h-screen overflow-hidden">
        <div className="h-full w-full max-w-[1600px] mx-auto flex items-center justify-center px-4 md:px-8">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="animate-pulse">
              <div className="h-12 md:h-14 bg-gray-200 rounded-xl w-4/5 mb-5" />
              <div className="h-12 md:h-14 bg-gray-200 rounded-xl w-3/5 mb-7" />
              <div className="h-5 bg-gray-200 rounded w-full mb-3" />
              <div className="h-5 bg-gray-200 rounded w-11/12 mb-3" />
              <div className="h-5 bg-gray-200 rounded w-10/12 mb-8" />
              <div className="h-12 bg-gray-200 rounded-full w-48" />
            </div>

            <div className="animate-pulse flex items-center justify-center">
              <div className="w-full max-w-[640px] aspect-[4/3] bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`dot-${idx}`}
              className="h-2.5 w-2.5 rounded-full bg-gray-200 animate-pulse"
            />
          ))}
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
        interval={3000}
      />
    </div>
  );
};

export default Slider;
