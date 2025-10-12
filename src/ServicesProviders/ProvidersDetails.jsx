import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaCity,
  FaBuilding,
  FaCodeBranch,
  FaUser,
  FaStar,
  FaArrowLeft,
} from "react-icons/fa";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import baseApi from "../api/baseApi";
import BookingModal from "../Components/BookingModal";
import PrescriptionBookingModal from "../Components/PrescriptionBookingModal";
import { CiMedicalClipboard } from "react-icons/ci";
const ProvidersDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    serviceItem: null,
    providerName: "",
  });
  const [prescriptionModal, setPrescriptionModal] = useState({
    isOpen: false,
    providerId: null,
    providerName: "",
  });

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        setLoading(true);
        const response = await baseApi.get(`/ServicesProviders/${id}`);

        if (response.data.success) {
          const providerData = response.data.data;
          setProvider(providerData);
          // Parse embedded items to services/clinics sections if present
          if (Array.isArray(providerData.items)) {
            const servicesGroup = providerData.items.find(
              (g) => g?.type === "Service"
            );
            const clinicsGroup = providerData.items.find(
              (g) => g?.type === "Clinic"
            );
            setServices(
              Array.isArray(servicesGroup?.items) ? servicesGroup.items : []
            );
            setClinics(
              Array.isArray(clinicsGroup?.items) ? clinicsGroup.items : []
            );
          } else {
            setServices([]);
            setClinics([]);
          }
        } else {
          setError("فشل في تحميل تفاصيل مقدم الخدمة");
        }
      } catch (err) {
        setError("حدث خطأ في تحميل تفاصيل مقدم الخدمة");
        console.error("Error fetching provider details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProviderDetails();
    }
  }, [id]);

  // Items now come embedded within provider response; no separate fetch needed

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={16} />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-yellow-400" size={16} />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="text-gray-300" size={16} />
      );
    }

    return stars;
  };

  const handleBookingClick = (item, type) => {
    setBookingModal({
      isOpen: true,
      serviceItem: { ...item, type },
      providerName: provider?.name || "",
    });
  };

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      serviceItem: null,
      providerName: "",
    });
  };

  const handlePrescriptionClick = () => {
    setPrescriptionModal({
      isOpen: true,
      providerId: provider?.id,
      providerName: provider?.name || "",
    });
  };

  const closePrescriptionModal = () => {
    setPrescriptionModal({
      isOpen: false,
      providerId: null,
      providerName: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-second text-white px-6 py-2 rounded-lg hover:bg-primary transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">مقدم الخدمة غير موجود</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-second text-white px-6 py-2 rounded-lg hover:bg-primary transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <FaArrowLeft className="ml-2" size={16} />
            العودة
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Provider Info Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <img
              src={provider.imageCover}
              alt={provider.name}
              className="w-full h-64 md:h-80 object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x400?text=No+Image";
              }}
            />
            <div className="absolute top-4 right-4 bg-second text-white px-4 py-2 rounded-full text-sm font-medium">
              {provider.specialityName}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {provider.name}
            </h1>

            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {provider.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-second ml-3" size={18} />
                <div>
                  <span className="font-medium text-gray-700">العنوان:</span>
                  <p className="text-gray-600">{provider.address}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FaCity className="text-second ml-3" size={18} />
                <div>
                  <span className="font-medium text-gray-700">المدينة:</span>
                  <p className="text-gray-600">{provider.cityName}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FaBuilding className="text-second ml-3" size={18} />
                <div>
                  <span className="font-medium text-gray-700">المحافظة:</span>
                  <p className="text-gray-600">{provider.goverorateName}</p>
                </div>
              </div>

              {provider.branches && (
                <div className="flex items-center">
                  <FaCodeBranch className="text-second ml-3" size={18} />
                  <div>
                    <span className="font-medium text-gray-700">الفروع:</span>
                    <p className="text-gray-600">{provider.branches}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <FaUser className="text-gray-400 ml-2" size={16} />
                <span className="text-gray-600">
                  <span className="font-medium">مالك:</span>{" "}
                  {provider.ownerName}
                </span>
              </div>
              <button
                onClick={handlePrescriptionClick}
                className="bg-second text-white px-4 py-3  text-md font-medium hover:bg-primary transition-colors duration-300 flex items-center justify-center gap-2"
              >
                حجز روشته
                <CiMedicalClipboard size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Provider Gallery */}
        {provider.attachments && provider.attachments.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              معرض الصور
            </h2>
            <div className="relative">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                loop={true}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                  reverseDirection: true,
                }}
                navigation={{
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                }}
                className="gallery-swiper"
              >
                {provider.attachments.map((attachment) => (
                  <SwiperSlide key={attachment.id}>
                    <div className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                      <img
                        src={attachment.imageUrl}
                        alt={`صورة ${attachment.id}`}
                        className="w-full h-48 md:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}

        {/* Services and Clinics Section */}
        {(services.length > 0 || clinics.length > 0) && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            {services.length > 0 && (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                  الخدمات
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {/* Services */}
                  {services.map((item) => (
                    <div
                      key={`service-${item.id}`}
                      className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={item.imageCover}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x200?text=No+Image";
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                          خدمة
                        </div>
                        {item.isBestSeller && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                            الأكثر مبيعاً
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">
                          {item.name}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {renderStars(item.averageRating)}
                            </div>
                            <span className="text-sm text-gray-500 mr-2">
                              ({item.totalRatings})
                            </span>
                          </div>
                          <span className="text-lg font-bold text-second">
                            {item.price} ج.م
                          </span>
                        </div>

                        <button
                          onClick={() => handleBookingClick(item, "Service")}
                          className="w-full bg-second text-white py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors flex items-center justify-center"
                        >
                          احجز الخدمة
                          <MdOutlineKeyboardArrowRight
                            className="mr-2"
                            size={16}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {clinics.length > 0 && (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                  العيادات
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Clinics */}
                  {clinics.map((item) => (
                    <div
                      key={`clinic-${item.id}`}
                      className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={item.imageCover}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x200?text=No+Image";
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          عيادة
                        </div>
                        {item.isBestSeller && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                            الأكثر مبيعاً
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">
                          {item.name}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {renderStars(item.averageRating)}
                            </div>
                            <span className="text-sm text-gray-500 mr-2">
                              ({item.totalRatings})
                            </span>
                          </div>
                          <span className="text-lg font-bold text-second">
                            {item.price} ج.م
                          </span>
                        </div>

                        <button
                          onClick={() => handleBookingClick(item, "Clinic")}
                          className="w-full bg-second text-white py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors flex items-center justify-center"
                        >
                          احجز العيادة
                          <MdOutlineKeyboardArrowRight
                            className="mr-2"
                            size={16}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .gallery-swiper {
          padding: 0 50px;
        }
        
        .gallery-swiper .swiper-pagination {
          bottom: -40px;
        }
        
        .gallery-swiper .swiper-pagination-bullet {
          background-color: #3B82F6;
          opacity: 0.5;
        }
        
        .gallery-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background-color: #1D4ED8;
        }
        
        .gallery-swiper .swiper-button-prev,
        .gallery-swiper .swiper-button-next {
          color: #1D4ED8;
          font-weight: bold;
        }
        
        .gallery-swiper .swiper-button-prev:after,
        .gallery-swiper .swiper-button-next:after {
          font-size: 20px;
        }
      `}</style>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={closeBookingModal}
        serviceItem={bookingModal.serviceItem}
        providerName={bookingModal.providerName}
      />

      {/* Prescription Booking Modal */}
      <PrescriptionBookingModal
        isOpen={prescriptionModal.isOpen}
        onClose={closePrescriptionModal}
        providerId={prescriptionModal.providerId}
        providerName={prescriptionModal.providerName}
      />
    </div>
  );
};

export default ProvidersDetails;
