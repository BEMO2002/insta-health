import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import baseApi from '../api/baseApi';

const TourismAttachments = ({ slugProp = 'medical-tourism' }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setLoading(true);
        const response = await baseApi.get('/Attachments');
        
        if (response.data.success && response.data.data) {
          // Filter images by slug
          const filteredImages = response.data.data.filter(
            item => item.slug === slugProp && item.type === 'Image'
          );
          setAttachments(filteredImages);
        }
      } catch (err) {
        console.error('Error fetching attachments:', err);
        setError('حدث خطأ في تحميل الصور');
      } finally {
        setLoading(false);
      }
    };

    if (slugProp) {
      fetchAttachments();
    }
  }, [slugProp]);

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

  if (error || attachments.length === 0) {
    return null; // Don't show anything if error or no images
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8"> 
          <div className="relative">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={true}
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

            >
              {attachments.map((attachment) => (
                <SwiperSlide key={attachment.id}>
                  <div className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                    <img
                      src={attachment.attachmentUrl}
                      alt={`صورة السياحة العلاجية ${attachment.id}`}
                      className="w-full h-64 md:h-72 object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourismAttachments;