import React from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

const CounterBox = ({ end, label }) => {
  const { ref, inView } = useInView({ triggerOnce: true });
  return (
    <div ref={ref} className="flex items-center justify-center flex-col">
      <h4 className="text-primary text-[40px] font-[700] leading-[52px]">
        {inView ? <CountUp end={end} duration={5} /> : 0}+
      </h4>
      <h2 className="text-[24px] font-[700] leading-[36px] text-base">
        {label}
      </h2>
    </div>
  );
};

const NumbersTwo = () => {
  const numbersData = [
    { end: 67, label: "مراكز متخصصة" },
    { end: 180, label: "ممرض" },
    { end: 420, label: "طبيب" },
    { end: 25, label: "شركة خدمات" },
    { end: 38, label: "مستلزمات طبية" },
    { end: 12, label: "اسعاف خاص" },
    { end: 95, label: "جهاز طبي" },
    { end: 156, label: "مستلزمات طبية" },
    { end: 1250, label: "متلقي خدمة" },
    { end: 890, label: "عمليه حجز" },
  ];

  return (
    <section className="py-[50px] px-4 sm:px-6 lg:px-8 relative">
      <div className="container mx-auto">
        <div className="max-w-7xl mx-auto">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={2}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 30,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 30,
              },
            }}
            loop={true}
            className="numbers-swiper"
          >
            {numbersData.map((item, index) => (
              <SwiperSlide key={index}>
                <CounterBox end={item.end} label={item.label} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx>{`
        .numbers-swiper {
          padding: 20px 0;
        }
        .numbers-swiper .swiper-slide {
          height: auto;
        }
      `}</style>
    </section>
  );
};

export default NumbersTwo;
