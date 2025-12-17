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
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setLoading(true);
        const response = await baseApi.get('/Attachments');
        
        if (response.data.success && response.data.data) {
          const allowedTypes = new Set(['Image', 'Video', 'File']);
          const filteredAttachments = response.data.data.filter(
            item => item.slug === slugProp && allowedTypes.has(item.type)
          );
          setAttachments(filteredAttachments);
        }
      } catch (err) {
        console.error('Error fetching attachments:', err);
        setError('حدث خطأ في تحميل المرفقات');
      } finally {
        setLoading(false);
      }
    };

    if (slugProp) {
      fetchAttachments();
    }
  }, [slugProp]);

  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsViewerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerOpen]);

  const mediaAttachments = attachments.filter(
    (a) => a.type === 'Image' || a.type === 'Video'
  );

  const openViewer = (attachment) => {
    const index = mediaAttachments.findIndex((a) => a.id === attachment.id);
    setViewerInitialIndex(Math.max(index, 0));
    setIsViewerOpen(true);
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

  if (error || attachments.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8"> 
          <div className="relative">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
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
                  <div
                    className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      if (attachment.type === 'Image' || attachment.type === 'Video') {
                        openViewer(attachment);
                      }
                    }}
                  >
                    {attachment.type === 'Image' ? (
                      <img
                        src={attachment.attachmentUrl}
                        alt={`مرفق السياحة العلاجية ${attachment.id}`}
                        className="w-full h-64 md:h-72 object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    ) : attachment.type === 'Video' ? (
                      <video
                        src={attachment.attachmentUrl}
                        controls
                        className="w-full h-64 md:h-72 object-cover"
                      />
                    ) : (
                      <a
                        href={attachment.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full h-64 md:h-72 bg-gray-100 text-gray-700 font-medium"
                      >
                        {attachment.fileName || attachment.name || `تحميل الملف ${attachment.id}`}
                      </a>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {isViewerOpen && mediaAttachments.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsViewerOpen(false);
          }}
        >
          <div className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl overflow-hidden">
            <button
              type="button"
              className="absolute top-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1 text-white"
              onClick={() => setIsViewerOpen(false)}
            >
              إغلاق
            </button>

            <Swiper
              modules={[Pagination, Navigation]}
              navigation
              pagination={{ clickable: true, dynamicBullets: true }}
              initialSlide={viewerInitialIndex}
              spaceBetween={16}
              slidesPerView={1}
              className="w-full"
            >
              {mediaAttachments.map((attachment) => (
                <SwiperSlide key={`viewer-${attachment.id}`}>
                  <div className="w-full bg-black">
                    {attachment.type === 'Image' ? (
                      <img
                        src={attachment.attachmentUrl}
                        alt={`مرفق السياحة العلاجية ${attachment.id}`}
                        className="w-full max-h-[80vh] object-contain"
                      />
                    ) : (
                      <video
                        src={attachment.attachmentUrl}
                        controls
                        className="w-full max-h-[80vh] object-contain"
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourismAttachments;