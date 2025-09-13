import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import looder4 from "../assets/Home/Polygon 4.png";
import baseApi from "../api/baseApi";

const SliderOne = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const res = await baseApi.get("/SuccessPartners");
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setImages(res.data.data.map((it) => it.imageUrl));
        } else {
          setImages([]);
        }
      } catch {
        setError("تعذر تحميل شركاء النجاح");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return (
    <div className="relative">
      <img
        src={looder4}
        alt=""
        className="absolute hidden lg:block opacity-30 lg:opacity-60 md:opacity-100 left-0 top-4  z-5"
      />

      <div className="w-full max-w-6xl mx-auto py-4 px-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-center font-bold text-2xl md:text-3xl text-second">
            شركاء النجاح
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <Swiper
            modules={[Autoplay, FreeMode]}
            loop={true}
            freeMode={true}
            speed={1850}
            loopedSlides={images.length}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
            }}
            spaceBetween={12}
            slidesPerView={1}
            breakpoints={{
              480: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <div className="h-50 sm:h-48 md:h-56 lg:h-60 xl:h-64 flex items-center justify-center p-1">
                  <img
                    src={img}
                    alt={`partner-${idx + 1}`}
                    className=" object-contain  bg-white"
                    style={{ display: "block" }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default SliderOne;
