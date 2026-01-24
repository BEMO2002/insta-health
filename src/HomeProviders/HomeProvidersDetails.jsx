import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaStar,
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaPhone,
  FaArrowLeft,
  FaCity,
  FaArrowRight,
} from "react-icons/fa";
import baseApi from "../api/baseApi";
import HomeBookingModal from "../Components/HomeBookingModal";
import { BsJournalBookmark } from "react-icons/bs";
const HomeProvidersDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    providerId: null,
    providerName: "",
    subSpecialityId: null,
    subSpecialityName: null,
  });

  useEffect(() => {
    const fetchProviderDetails = async () => {
      setLoading(true);
      setError(null);
      let providerData = null;

      try {
        // 1. Try direct fetch using slug
        const response = await baseApi.get(`/HomeProviders/${slug}`);
        if (response.data.success) {
          providerData = response.data.data;
        }
      } catch (err) {
        // 2. Fallback: Search if slug is not an ID
        if (Number.isNaN(Number(slug))) {
          try {
            // Try searching by exact slug (if search param exists)
            // HomeProviders list endpoint supports SearchName
            let searchRes = await baseApi.get("/HomeProviders", {
              params: { SearchName: slug },
            });
            let found = searchRes.data?.success
              ? searchRes.data.data.items.find((p) => p.slug === slug)
              : null;

            // Fuzzy search
            if (!found) {
              const fuzzySearch = slug.replace(/-/g, " ");
              searchRes = await baseApi.get("/HomeProviders", {
                params: { SearchName: fuzzySearch },
              });
              if (searchRes.data?.success) {
                found = searchRes.data.data.items.find((p) => p.slug === slug);
              }
            }

            if (found) {
              // Fetch details by ID
              const idRes = await baseApi.get(`/HomeProviders/${found.id}`);
              if (idRes.data.success) {
                providerData = idRes.data.data;
              }
            }
          } catch (searchErr) {
            console.error("Search resolution failed", searchErr);
          }
        }
      }

      if (providerData) {
        setProvider(providerData);
      } else {
        setError("فشل في تحميل تفاصيل مقدم الخدمة");
      }
      setLoading(false);
    };

    if (slug) {
      fetchProviderDetails();
    }
  }, [slug]);

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
        <FaStar key={`empty-${i}`} className="text-gray-300" size={16} />,
      );
    }

    return stars;
  };

  const handleBookingClick = (
    subSpecialityId = null,
    subSpecialityName = null,
  ) => {
    setBookingModal({
      isOpen: true,
      providerId: provider?.id,
      providerName: provider?.name || "",
      subSpecialityId: subSpecialityId,
      subSpecialityName: subSpecialityName,
    });
  };

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      providerId: null,
      providerName: "",
      subSpecialityId: null,
      subSpecialityName: null,
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
              src={provider.imageUrl}
              alt={provider.name}
              className="w-full h-64 md:h-80 object-contain"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x400?text=No+Image";
              }}
            />
            <div className="absolute top-4 left-4 flex items-center bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
              <FaStar className="ml-1" size={14} />
              {provider.rate}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {provider.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaGraduationCap className="text-second ml-3" size={18} />
                  <div>
                    <span className="font-medium text-gray-700">
                      الدرجة العلمية:
                    </span>
                    <p className="text-gray-600">{provider.academicDegree}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaBriefcase className="text-second ml-3" size={18} />
                  <div>
                    <span className="font-medium text-gray-700">الخبرة:</span>
                    <p className="text-gray-600">{provider.expirence}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaPhone className="text-second ml-3" size={18} />
                  <div>
                    <span className="font-medium text-gray-700">الهاتف:</span>
                    <p className="text-gray-600">{provider.mobile}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {renderStars(provider.rate)}
                  </div>
                  <span className="text-sm text-gray-500 mr-2">
                    ({provider.rate}/5)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <FaUser className="text-gray-400 ml-2" size={16} />
                <span className="text-gray-600">
                  <span className="font-medium">مقدم الخدمة:</span>{" "}
                  {provider.name}
                </span>
              </div>
              <button
                onClick={handleBookingClick}
                className="bg-second text-white px-6 py-3 text-lg font-medium hover:bg-primary transition-colors duration-300 flex items-center justify-center gap-2"
              >
                احجز الآن
              </button>
            </div>
          </div>
        </div>

        {/* Cities Section */}
        {provider.providerCities && provider.providerCities.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              المدن التي يخدمها
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {provider.providerCities.map((city) => (
                <div
                  key={city.id}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaCity className="text-second ml-3" size={16} />
                  <div>
                    <span className="font-medium text-gray-700">
                      {city.arabicName}
                    </span>
                    <p className="text-sm text-gray-500">
                      {city.governorateName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الخدمات المتوفرة - بناءً على الهيكل الجديد */}
        {provider.specialties && provider.specialties.length > 0 && (
          <section className="my-10 px-4 md:px-0" dir="rtl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
              {/* العنوان الرئيسي */}
              <div className="flex items-center mb-8 border-r-4 border-second pr-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary">
                  الخدمات والأسعار المتاحة
                </h2>
              </div>

              <div className="space-y-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                {provider.specialties.map((specialty) => (
                  <div
                    key={specialty.id}
                    className="border-b border-gray-100 pb-8 last:border-0"
                  >
                    {/* اسم التخصص الرئيسي */}
                    <h3 className="text-xl font-bold text-second mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-second rounded-full"></span>
                      {specialty.name}
                    </h3>

                    {/* شبكة الخدمات الفرعية */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {specialty.subSpecialties.map((sub) => (
                        <div
                          key={sub.id}
                          className="group flex flex-col justify-between p-5 bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-xl hover:border-second/30"
                        >
                          <div className="mb-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-3 leading-tight min-h-[3rem]">
                              {sub.name}
                            </h4>

                            <div className="flex flex-col gap-1">
                              {/* عرض السعر الأصلي إذا كان هناك خصم */}
                              {sub.discountPrice > 0 &&
                                sub.discountPrice < sub.price && (
                                  <p className="text-gray-400 text-md line-through decoration-red-500">
                                    {sub.price} ج.م
                                  </p>
                                )}

                              {/* السعر النهائي */}
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-second">
                                  {sub.discountPrice > 0
                                    ? sub.discountPrice
                                    : sub.price}
                                </span>
                                <span className="text-xs font-bold text-gray-500">
                                  ج.م
                                </span>
                                {sub.discountPrice > 0 && (
                                  <span className="mr-2 bg-red-100 text-red-600 text-[13px] px-2 py-0.5 rounded-full font-bold">
                                    وفر{" "}
                                    {(sub.price - sub.discountPrice).toFixed(0)}{" "}
                                    ج.م
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* زر الحجز */}
                          <button
                            onClick={() =>
                              handleBookingClick(sub.subSpecialtyId, sub.name)
                            }
                            className="w-full flex items-center justify-center gap-3 bg-second text-white py-3 px-4 rounded-lg font-bold transition-all hover:bg-primary active:scale-95 shadow-md shadow-second/20"
                          >
                            <span>احجز الخدمة</span>
                            <BsJournalBookmark size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
            معلومات الاتصال
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FaPhone className="text-second ml-3" size={20} />
              <div>
                <span className="font-medium text-gray-700">رقم الهاتف:</span>
                <p className="text-gray-600">{provider.mobile}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FaUser className="text-second ml-3" size={20} />
              <div>
                <span className="font-medium text-gray-700">
                  اسم مقدم الخدمة:
                </span>
                <p className="text-gray-600">{provider.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <HomeBookingModal
        isOpen={bookingModal.isOpen}
        onClose={closeBookingModal}
        providerId={bookingModal.providerId}
        providerName={bookingModal.providerName}
        subSpecialityId={bookingModal.subSpecialityId}
        subSpecialityName={bookingModal.subSpecialityName}
      />
    </div>
  );
};

export default HomeProvidersDetails;
