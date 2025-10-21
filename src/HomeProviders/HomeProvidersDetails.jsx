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
  const { id } = useParams();
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
      try {
        setLoading(true);
        const response = await baseApi.get(`/HomeProviders/${id}`);

        if (response.data.success) {
          setProvider(response.data.data);
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

  const handleBookingClick = (
    subSpecialityId = null,
    subSpecialityName = null
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
              className="w-full h-64 md:h-80 object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x400?text=No+Image";
              }}
            />
            <div className="absolute top-4 right-4 bg-second text-white px-4 py-2 rounded-full text-sm font-medium">
              {provider.specialityName}
            </div>
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
                    <p className="text-sm text-gray-500">{city.englishName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub Specialities Section */}
        {provider.subSpecialities && provider.subSpecialities.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              الخدمات المتوفرة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {provider.subSpecialities.map((subSpeciality) => (
                <div
                  key={subSpeciality.id}
                  className="flex items-center justify-between flex-col md:flex-row gap-4 p-4 bg-second text-white rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-white rounded-full ml-3"></div>
                    <span className="font-medium">{subSpeciality.name}</span>
                  </div>
                  <button
                    onClick={() =>
                      handleBookingClick(subSpeciality.id, subSpeciality.name)
                    }
                    className="bg-white flex items-center gap-2 cursor-pointer text-second px-3 py-2 rounded text-md font-bold transition-colors"
                  >
                    احجز
                    <BsJournalBookmark className="ml-2" size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
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
