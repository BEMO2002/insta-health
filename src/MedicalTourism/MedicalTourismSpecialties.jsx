import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import baseApi from "../api/baseApi";
import ConsultationBookingModal from "../Components/ConsultationBookingModal";
import DoctorsPopup from "./DoctorsPopup";

const MedicalTourismSpecialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [doctorsBySpecialty, setDoctorsBySpecialty] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    doctor: null,
  });
  const [doctorsPopup, setDoctorsPopup] = useState({
    isOpen: false,
    specialty: null,
  });

  useEffect(() => {
    const fetchSpecialtiesAndDoctors = async () => {
      try {
        setLoading(true);

        // Fetch specialties
        const specialtiesResponse = await baseApi.get(
          "/MedicalTourismSpecialties",
        );

        if (specialtiesResponse.data.success && specialtiesResponse.data.data) {
          const specialtiesData = specialtiesResponse.data.data;
          setSpecialties(specialtiesData);

          // Fetch doctors for each specialty
          const doctorsData = {};
          for (const specialty of specialtiesData) {
            try {
              const doctorsResponse = await baseApi.get("/Doctors", {
                params: {
                  tourismSpecialityId: specialty.id,
                },
              });

              if (doctorsResponse.data.success && doctorsResponse.data.data) {
                doctorsData[specialty.id] = doctorsResponse.data.data;
              } else {
                doctorsData[specialty.id] = [];
              }
            } catch (err) {
              console.error(
                `Error fetching doctors for specialty ${specialty.id}:`,
                err,
              );
              doctorsData[specialty.id] = [];
            }
          }
          setDoctorsBySpecialty(doctorsData);
        }
      } catch (err) {
        console.error("Error fetching specialties:", err);
        setError("حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialtiesAndDoctors();
  }, []);

  const handleBooking = (doctor) => {
    setBookingModal({
      isOpen: true,
      doctor: doctor,
    });
  };

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      doctor: null,
    });
  };

  const handleShowDoctors = (specialty) => {
    setDoctorsPopup({
      isOpen: true,
      specialty: specialty,
    });
  };

  const closeDoctorsPopup = () => {
    setDoctorsPopup({
      isOpen: false,
      specialty: null,
    });
  };

  const handleBookFromPopup = (doctor) => {
    handleBooking(doctor);
    closeDoctorsPopup();
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

  if (error || specialties.length === 0) {
    return null;
  }

  return (
    <>
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-10 text-center">
            التخصصات الطبية
          </h2>

          {/* Specialties Swiper */}
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            loop={specialties.length > 1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
          >
            {specialties.map((specialty) => (
              <SwiperSlide key={specialty.id}>
                <div className="bg-white mb-5 rounded-xl shadow-lg overflow-hidden sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
                  {/* Specialty Image with Text Overlay */}
                  <div className="relative h-96 md:h-[400px] lg">
                    <img
                      src={specialty.imageUrl}
                      alt={specialty.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23e5e7eb" width="800" height="400"/%3E%3Ctext fill="%234b5563" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3Eتخصص طبي%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="text-3xl md:text-4xl font-bold mb-3">
                        {specialty.name}
                      </h3>
                      <p className="text-lg text-white opacity-90">
                        {specialty.description}
                      </p>
                    </div>
                  </div>

                  {/* Book Consultation Button */}
                  <div className="p-8">
                    <button
                      aria-label="Book Consultation"
                      onClick={() => handleShowDoctors(specialty)}
                      className="w-full bg-primary hover:bg-second text-white py-3 rounded-lg font-bold text-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                    >
                      احجز استشارة
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Doctors Popup */}
      <DoctorsPopup
        isOpen={doctorsPopup.isOpen}
        onClose={closeDoctorsPopup}
        specialty={doctorsPopup.specialty}
        doctors={
          doctorsPopup.specialty
            ? doctorsBySpecialty[doctorsPopup.specialty.id]
            : []
        }
        onBookDoctor={handleBookFromPopup}
      />

      {/* Booking Modal */}
      <ConsultationBookingModal
        isOpen={bookingModal.isOpen}
        onClose={closeBookingModal}
        doctor={bookingModal.doctor}
      />
    </>
  );
};

export default MedicalTourismSpecialties;
