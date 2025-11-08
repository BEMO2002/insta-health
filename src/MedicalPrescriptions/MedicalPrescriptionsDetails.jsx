import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFileText, FiDownload, FiArrowRight, FiCalendar, FiHash } from 'react-icons/fi';
import baseApi from '../api/baseApi';
import { toast } from 'react-toastify';

const MedicalPrescriptionsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrescriptionDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPrescriptionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await baseApi.get(`/MedicalPrescriptions/${id}`);

      if (response.data.success && response.data.data) {
        setPrescription(response.data.data);
      } else {
        setError('لم يتم العثور على الوصفة الطبية');
      }
    } catch (err) {
      console.error('Error fetching prescription details:', err);
      setError('حدث خطأ في تحميل تفاصيل الوصفة الطبية');
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (prescription?.attachment) {
      window.open(prescription.attachment, '_blank');
      toast.success('جاري تحميل المرفق...');
    }
  };

  const handleGoBack = () => {
    navigate('/medical-prescriptions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="bg-gradient-to-r from-primary to-second text-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              خطأ في تحميل الوصفة الطبية
            </h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-xl font-semibold mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchPrescriptionDetails}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-second transition-colors font-bold"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-bold flex items-center gap-2"
              >
                <FiArrowRight />
                العودة للقائمة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary to-second text-white py-20 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
          >
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            <span className="font-semibold">العودة للقائمة</span>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              {prescription.title}
            </h1>
          </div>
          <div className="w-24 h-1 bg-white rounded-full mb-4"></div>
          <div className="flex flex-wrap gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <FiHash className="text-xl" />
              <span className="font-semibold">رقم الوصفة: {prescription.id}</span>
            </div>
            {prescription.createdDate && (
              <div className="flex items-center gap-2">
                <FiCalendar className="text-xl" />
                <span className="font-semibold">
                  {new Date(prescription.createdDate).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Image */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8">
                <div className="relative">
                  <img
                    src={prescription.attachment}
                    alt={prescription.title}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%234b5563" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3Eوصفة طبية%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <span className="text-primary font-bold">#{prescription.id}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-primary to-second text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <FiDownload className="text-2xl" />
                    <span>تحميل المرفق</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description Card */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary to-second rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900">وصف الوصفة الطبية</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {prescription.content}
                  </p>
                </div>
              </div>


              {/* Actions Card */}
              <div className="bg-gradient-to-r from-primary to-second rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-xl font-bold mb-4">هل تحتاج إلى مساعدة؟</h3>
                <p className="mb-6 text-white/90">
                  إذا كان لديك أي استفسارات حول هذه الوصفة الطبية، يرجى التواصل مع فريق الدعم الخاص بنا.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MedicalPrescriptionsDetails;