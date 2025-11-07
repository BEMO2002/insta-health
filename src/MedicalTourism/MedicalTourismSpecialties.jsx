import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import baseApi from '../api/baseApi';
import ConsultationBookingModal from '../Components/ConsultationBookingModal';
import { FiStar } from 'react-icons/fi';

const MedicalTourismSpecialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [doctorsBySpecialty, setDoctorsBySpecialty] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    doctor: null,
  });

  useEffect(() => {
    const fetchSpecialtiesAndDoctors = async () => {
      try {
        setLoading(true);

        // Fetch specialties
        const specialtiesResponse = await baseApi.get('/MedicalTourismSpecialties');
        
        if (specialtiesResponse.data.success && specialtiesResponse.data.data) {
          const specialtiesData = specialtiesResponse.data.data;
          setSpecialties(specialtiesData);

          // Fetch doctors for each specialty
          const doctorsData = {};
          for (const specialty of specialtiesData) {
            try {
              const doctorsResponse = await baseApi.get('/Doctors', {
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
              console.error(`Error fetching doctors for specialty ${specialty.id}:`, err);
              doctorsData[specialty.id] = [];
            }
          }
          setDoctorsBySpecialty(doctorsData);
        }
      } catch (err) {
        console.error('Error fetching specialties:', err);
        setError('حدث خطأ في تحميل البيانات');
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

          <div className="space-y-12">
            {specialties.map((specialty) => (
              <div key={specialty.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Specialty Header */}
                <div className="relative h-64 md:h-80">
                  <img
                    src={specialty.imageUrl}
                    alt={specialty.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x400?text=تخصص+طبي';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{specialty.name}</h3>
                    <p className="text-md text-white opacity-90">{specialty.description}</p>
                  </div>
                </div>

                {/* Doctors Swiper */}
                {doctorsBySpecialty[specialty.id]?.length > 0 && (
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">الأطباء المتاحون</h4>
                    <Swiper
                      modules={[Autoplay, Pagination]}
                      spaceBetween={20}
                      slidesPerView={1}
                      loop={doctorsBySpecialty[specialty.id].length > 1}
                      autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }}
                      navigation={doctorsBySpecialty[specialty.id].length > 1}
                      pagination={{
                        clickable: true,
                        dynamicBullets: true,
                      }}
                      breakpoints={{
                        640: {
                          slidesPerView: 2,
                          spaceBetween: 20,
                        },
                        1024: {
                          slidesPerView: 3,
                          spaceBetween: 30,
                        },
                      }}
                    //   className="doctors-swiper"
                    >
                      {doctorsBySpecialty[specialty.id].map((doctor) => (
                        <SwiperSlide key={doctor.id}>
                          <div className="bg-gray-50 rounded-lg overflow-hidden h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
                            {/* Doctor Image */}
                            <div className="relative h-50">
                              <img
                                src={doctor.imageUrl}
                                alt={doctor.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/300x200?text=دكتور';
                                }}
                              />
                            </div>

                            {/* Doctor Info */}
                            <div className="p-4 flex-1 flex flex-col">
                              <h5 className="text-lg font-bold text-gray-800 mb-1">{doctor.name}</h5>
                              <p className="text-sm text-second font-medium mb-2">{doctor.speciality}</p>
                              
                              {/* Rating */}
                              {doctor.rate && (
                                <div className="flex items-center mb-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FiStar
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <= doctor.rate
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-600 mr-2">({doctor.rate}/5)</span>
                                </div>
                              )}

                              {/* Experience */}
                              {doctor.expirence && (
                                <p className="text-xs text-gray-600 mb-4 line-clamp-2">{doctor.expirence}</p>
                              )}

                              {/* Booking Button */}
                              <button
                                onClick={() => handleBooking(doctor)}
                                className="mt-auto w-full bg-primary hover:bg-second text-white py-2 rounded-lg font-semibold transition-colors duration-300"
                              >
                                احجز استشارة
                              </button>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}

                {/* No Doctors Message */}
                {doctorsBySpecialty[specialty.id]?.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    لا يوجد أطباء متاحون حالياً في هذا التخصص
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

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