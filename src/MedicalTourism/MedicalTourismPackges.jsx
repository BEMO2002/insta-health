import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import baseApi from "../api/baseApi";
import PackageBookingModal from "./PackageBookingModal";

const MedicalTourismPackges = () => {
  const [packagesData, setPackagesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    package: null,
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await baseApi.get("/MedicalTourismPackges");

        if (response.data.success && response.data.data) {
          setPackagesData(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleBooking = (packageItem) => {
    setBookingModal({
      isOpen: true,
      package: packageItem,
    });
  };

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      package: null,
    });
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || packagesData.length === 0) {
    return null;
  }

  const renderSection = (typeData) => {
    const title =
      typeData.type === "Package" ? "الباقات الطبية" : "العروض الخاصة";
    const items = typeData.items || [];

    const maxSlidesPerView = Math.min(3, items.length);
    const shouldLoop = items.length > maxSlidesPerView;

    if (items.length === 0) return null;

    return (
      <div key={typeData.type} className="mb-16">
        <h3 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
          {title}
        </h3>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          loop={shouldLoop}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: Math.min(2, items.length),
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: Math.min(3, items.length),
              spaceBetween: 30,
            },
          }}
        >
          {items.map((item) => {
            const hasDiscount =
              item?.discountPrice != null &&
              item?.price != null &&
              Number(item.discountPrice) < Number(item.price);
            const discountPercent = hasDiscount
              ? Math.round(
                  100 - (Number(item.discountPrice) / Number(item.price)) * 100,
                )
              : 0;
            return (
              <SwiperSlide key={item.id}>
                <div className="bg-white mb-5 rounded-xl shadow-lg overflow-hidden h-full flex flex-col hover:shadow-2xl transition-shadow duration-300">
                  {/* Package Image */}
                  <div className="relative h-50">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%234b5563" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3Eباقة طبية%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {/* Price Badge */}
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-extrabold shadow">
                        خصم {discountPercent}%
                      </div>
                    )}
                  </div>

                  {/* Package Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 ">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[60px]">
                      {item.description}
                    </p>
                    <div className="flex flex-col mb-3 min-h-[70px]">
                      {hasDiscount ? (
                        <>
                          <span className="text-2xl font-extrabold text-red-600">
                            {item.discountPrice?.toFixed
                              ? item.discountPrice.toFixed(2)
                              : item.discountPrice}{" "}
                            $
                          </span>
                          <span className="text-lg font-bold text-gray-500 line-through -mt-0.5">
                            {item.price?.toFixed
                              ? item.price.toFixed(2)
                              : item.price}{" "}
                            $
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl font-bold text-second">
                            {item.price?.toFixed
                              ? item.price.toFixed(2)
                              : item.price}{" "}
                            $
                          </span>
                          <span className="text-lg font-bold text-gray-500 line-through -mt-0.5 opacity-0">
                            {item.price?.toFixed
                              ? item.price.toFixed(2)
                              : item.price}{" "}
                            $
                          </span>
                        </>
                      )}
                    </div>
                    {/* Booking Button */}
                    <button
                      aria-label="Book Package"
                      onClick={() => handleBooking(item)}
                      className="w-full bg-primary hover:bg-second text-white py-2 rounded-lg font-bold text-md transition-colors duration-300 shadow-md hover:shadow-lg"
                    >
                      احجز الآن
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  };

  return (
    <>
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
            الباقات والعروض الطبية
          </h2>

          {packagesData.map((typeData) => renderSection(typeData))}
        </div>
      </div>

      {/* Booking Modal */}
      <PackageBookingModal
        isOpen={bookingModal.isOpen}
        onClose={closeBookingModal}
        package={bookingModal.package}
      />
    </>
  );
};

export default MedicalTourismPackges;
