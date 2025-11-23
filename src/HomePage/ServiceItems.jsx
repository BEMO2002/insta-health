import React, { useState, useEffect, useRef, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import {
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft,
} from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../Context/CartContext";
import "swiper/css";
import baseApi from "../api/baseApi";


const AddToCartButton = ({ service, onAdd }) => {
  const [adding, setAdding] = useState(false);

  const handleClick = async () => {
    if (adding) return;
    setAdding(true);
    try {
      await onAdd(service);
    } finally {
      setAdding(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={adding}
      className="bg-second text-white px-4 py-2 hover:bg-primary/90 transition-colors duration-200 text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {adding ? (
        <span className="inline-flex items-center gap-2">
          <span className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></span>
          جاري الإضافة
        </span>
      ) : (
        <>
          <FiShoppingCart size={16} />
          أضف للسلة
        </>
      )}
    </button>
  );
};

const ServiceItemCard = ({ service, onAdd }) => {
  const navigate = useNavigate();
  const hasDiscount =
    service?.discountPrice != null &&
    service?.price != null &&
    Number(service.discountPrice) < Number(service.price);

  const discountPercent = hasDiscount
    ? Math.round(
        100 - (Number(service.discountPrice) / Number(service.price)) * 100
      )
    : 0;

  return (
    <div className="bg-white mb-5  rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-[400px] flex flex-col">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          onClick={() =>
            navigate(`/products/${service.id}`, { state: { product: service } })
          }
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
        />
        {service.isBestSeller && (
          <div className="absolute top-3 right-3 bg-second text-white px-2 py-1 rounded-full text-xs font-semibold">
            الأكثر مبيعاً
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-extrabold shadow">
            خصم {discountPercent}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col grow" dir="rtl">
        {/* Service Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {service.description}
        </p>

        {/* Provider Name */}
        <p className="text-primary text-sm font-medium mb-3">
          {service.sericeProviderName}
        </p>

        {/* Price */}
        <div className="mt-auto flex flex-col gap-3">
          {hasDiscount ? (
            <>
              <span className="text-xl font-extrabold text-red-600">
                {service.discountPrice?.toFixed
                  ? service.discountPrice.toFixed(2)
                  : service.discountPrice}{" "}
                ج.م
              </span>
              <span className="text-xs text-gray-500 line-through -mt-0.5">
                {service.price?.toFixed
                  ? service.price.toFixed(2)
                  : service.price}{" "}
                ج.م
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-primary">
              {service.price?.toFixed
                ? service.price.toFixed(2)
                : service.price}{" "}
              ج.م
            </span>
          )}
          <div className="flex items-center justify-between gap-2">
            <AddToCartButton service={service} onAdd={onAdd} />
            <button
              onClick={() =>
                navigate(`/products/${service.id}`, {
                  state: { product: service },
                })
              }
              className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors duration-200"
            >
              التفاصيل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceItems = () => {
  const { addToCart } = useContext(CartContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const swiperRef = useRef(null);

  const handleAddToCart = async (service) => {
    return await addToCart(service, 1);
  };
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await baseApi.get("/products", {
          params: {
            PageIndex: 1,
            PageSize: 4000,
          },
        });
        if (response.data.success) {
          setServices(
            (response.data.data.items || []).filter(
              (item) => item.isBestSeller === true
            )
          );
        } else {
          setError("تعذر تحميل الخدمات");
        }
      } catch {
        setError("تعذر تحميل الخدمات");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const goNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const goPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24  ">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              خدماتنا الطبية
            </h2>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 ">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              خدماتنا الطبية
            </h2>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-center text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            الاكثر مبيعا
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة واسعة من المنتجات الطبية المتخصصة مع أفضل مقدمي الرعاية
            الصحية
          </p>
        </div>

        <div className="relative">
          <Swiper
            ref={swiperRef}
            spaceBetween={24}
            slidesPerView={1}
            allowTouchMove={true}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            modules={[Autoplay ]}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 3 },
            }}
            className="mySwiper"
          >
            {services.map((service) => (
              <SwiperSlide key={service.id} className="h-full">
                <ServiceItemCard
                  service={service}
                  onAdd={handleAddToCart}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            className="swiper-nav-btn text-primary rounded-full border-2 border-primary transition-all"
            onClick={goPrev}
          >
            <MdOutlineKeyboardArrowRight size={28} />
          </button>
          <button
            className="swiper-nav-btn text-primary rounded-full border-2 border-primary transition-all"
            onClick={goNext}
          >
            <MdOutlineKeyboardArrowLeft size={28} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceItems;

const styles = `
  .swiper-nav-btn {
    background: none;
    cursor: pointer;
    line-height: 1;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

// Add styles to document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
