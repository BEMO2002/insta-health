import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const Testimonials = () => {
  const isRTL = true;

  const testimonials = [
    {
      id: 1,
      name: "أحمد خالد",
      text: "حجزت زيارة تمريض منزلي من خلال التطبيق، التقييم الطبي كان دقيق والخدمة وصلتني في نفس اليوم.",
      position: "مريض - متابعة سكر وضغط",
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
    },
    {
      id: 2,
      name: "مي عبدالله",
      text: "عملت تحاليل معملية في البيت، الممرضة كانت محترفة والنتيجة ظهرت على التطبيق بسرعة.",
      position: "تحاليل معملية منزلية",
      photo:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
    },
    {
      id: 3,
      name: "محمود سمير",
      text: "حجزت أقرب طبيب باطنة لوالدي، الدكتور حضر في الموعد وتعامل باحتراف.",
      position: "زيارة طبيب منزلي",
      photo:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      rating: 5,
    },
    {
      id: 4,
      name: "نور محمد",
      text: "الاستشارة بالفيديو وفرت عليّ وقت العيادة، وقدرت أراجع الدواء مع طبيب مختص.",
      position: "استشارة طبية عن بُعد",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 md:py-24 relative ">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-second to-white rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-100/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      <style jsx global>{`
        .testimonials-swiper .swiper-pagination-bullet {
          background: #d1d5db;
          width: 14px;
          height: 14px;
          opacity: 1;
          margin: 0 8px;
          transition: all 0.3s ease;
          border-radius: 50%;
        }
        .testimonials-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(135deg, #2685c7, #fff);
          transform: scale(1.3);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div
          className={`text-center mb-16 ${isRTL ? "text-right" : "text-left"}`}
        >
          {/* Section tag */}
          <div className="mb-6 flex justify-center">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-second text-white rounded-full text-sm font-medium uppercase tracking-wide shadow-lg">
              آراء عملائنا
            </span>
          </div>

          {/* Main title */}
          <h2 className="text-3xl md:text-3xl text-center lg:text-4xl font-bold mb-6 text-primary leading-tight">
            تجارب حقيقية مع خدماتنا الطبية
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 max-w-3xl text-center mx-auto leading-relaxed">
            نوفر زيارات منزلية، تحاليل بالمنزل، واستشارات عن بُعد عبر فريق طبي
            معتمد.
          </p>
        </div>

        <div className="testimonials-swiper relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{
              clickable: true,
              el: ".custom-pagination",
            }}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
            }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: { slidesPerView: 3, spaceBetween: 40 },
            }}
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="group h-full">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 mb-3 shadow-xl flex flex-col h-[320px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:bg-white relative overflow-hidden">
                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-second/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                    {/* Quote icon */}
                    <div
                      className={`absolute ${
                        isRTL ? "left-6" : "right-6"
                      } top-6 text-primary group-hover:text-primary transition-colors duration-300`}
                    >
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 8.983-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                      </svg>
                    </div>

                    {/* Rating stars */}
                    <div className="flex gap-1 mb-6 relative z-10">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="text-amber-400 drop-shadow-sm"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>

                    {/* Testimonial text */}
                    <blockquote
                      className={`text-gray-700 leading-relaxed mb-6 flex-grow relative z-10 overflow-hidden ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: "vertical",
                        minHeight: "144px",
                        fontSize: "16px",
                      }}
                    >
                      "{testimonial.text}"
                    </blockquote>

                    {/* Patient info */}
                    <div
                      className={`flex items-center gap-4 mt-auto relative z-10 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={testimonial.photo}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#07332f]/20 to-transparent"></div>
                      </div>
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <h4
                          className="font-bold text-primary mb-1 truncate"
                          style={{ fontSize: "16px" }}
                        >
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-500 font-medium truncate">
                          {testimonial.position}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="custom-pagination mt-12 flex justify-center items-center"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
