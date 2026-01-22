import React, { useState, useEffect, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import baseApi from "../api/baseApi";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import { FiStar, FiSend } from "react-icons/fi";

const Testimonials = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userFeedback: "",
    stars: 5,
    serviceName: "",
  });

  const isRTL = true;

  const fetchTestimonials = async () => {
    try {
      const response = await baseApi.get("/ServicesRatings?pageSize=100");
      if (response.data?.success) {
        setTestimonials(response.data.data.items);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userFeedback || !formData.serviceName) {
      toast.warning("يرجى ملء جميع الحقول");
      return;
    }

    setSubmitting(true);
    try {
      const response = await baseApi.post("/ServicesRatings", formData);
      if (response.data?.success || response.status === 200) {
        toast.success("تم إضافة تقييمك بنجاح");
        setFormData({ userFeedback: "", stars: 5, serviceName: "" });
        fetchTestimonials(); // Refetch to show the new review
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("حدث خطأ أثناء إضافة التقييم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 relative bg-gray-50/50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-second to-white rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-100/30 to-transparent rounded-full blur-3xl opacity-50"></div>
      </div>

      <style jsx global>{`
        .testimonials-swiper .swiper-pagination-bullet {
          background: #d1d5db;
          width: 12px;
          height: 12px;
          opacity: 1;
          margin: 0 6px;
          transition: all 0.3s ease;
          border-radius: 50%;
        }
        .testimonials-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(135deg, #2685c7, #fff);
          transform: scale(1.2);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div
          className={`text-center mb-12 ${isRTL ? "text-right" : "text-left"}`}
        >
          <div className="mb-4 flex justify-center">
            <span className="inline-block px-5 py-2 bg-gradient-to-r from-primary to-second text-white rounded-full text-sm font-medium uppercase tracking-wide shadow-md">
              آراء عملائنا
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-primary leading-tight text-center">
            تجارب حقيقية مع خدماتنا الطبية
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl text-center mx-auto leading-relaxed">
            نوفر زيارات منزلية، تحاليل بالمنزل، واستشارات عن بُعد عبر فريق طبي
            معتمد.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="testimonials-swiper relative mb-20">
            {testimonials.length > 0 ? (
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                loop={testimonials.length > 1}
                breakpoints={{
                  640: { slidesPerView: 1, spaceBetween: 20 },
                  768: { slidesPerView: 2, spaceBetween: 30 },
                  1024: { slidesPerView: 3, spaceBetween: 40 },
                }}
                dir="rtl"
              >
                {testimonials.map((testimonial) => (
                  <SwiperSlide key={testimonial.id}>
                    <div className="group h-full py-4">
                      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 h-[300px] flex flex-col relative overflow-hidden mx-2">
                        {/* Quote icon */}
                        <div className="absolute left-6 top-6 text-primary/20 group-hover:text-primary/40 transition-colors duration-300">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 8.983-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                          </svg>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-5 h-5 ${
                                i < testimonial.stars
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Text */}
                        <blockquote
                          className="text-gray-700 leading-relaxed mb-6 flex-grow overflow-hidden text-right"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          "{testimonial.userFeedback}"
                        </blockquote>

                        {/* User Info */}
                        <div className="flex flex-col text-right mt-auto">
                          <h4 className="font-bold text-gray-900 truncate">
                            {testimonial.userName}
                          </h4>
                          <p className="text-sm text-second font-medium truncate">
                            {testimonial.serviceName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">لا توجد تقييمات حالياً.</p>
              </div>
            )}
          </div>
        )}

        {/* Add Review Form */}
        {isAuthenticated && (
          <div className="max-w-3xl mx-auto mt-16 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
              شاركنا تجربتك
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block text-right">
                    الخدمة التي تلقيتها
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={formData.serviceName}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceName: e.target.value })
                    }
                    placeholder="مثال: استشارة طبية، تمريض منزلي..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block text-right">
                    تقييمك
                  </label>
                  <div className="flex gap-2 justify-end bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 h-[50px] items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, stars: star })
                        }
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <FiStar
                          className={`w-6 h-6 ${
                            star <= formData.stars
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block text-right">
                  رأيك يهمنا
                </label>
                <textarea
                  required
                  maxLength={500}
                  value={formData.userFeedback}
                  onChange={(e) =>
                    setFormData({ ...formData, userFeedback: e.target.value })
                  }
                  placeholder="اكتب تفاصيل تجربتك هنا..."
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-right"
                ></textarea>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-second transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FiSend />
                      <span>إرسال التقييم</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
