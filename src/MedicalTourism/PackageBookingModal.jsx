import React, { useState } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import baseApi from '../api/baseApi';
import { toast } from 'react-toastify';

const PackageBookingModal = ({ isOpen, onClose, package: packageItem }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    passportId: '',
    passportImage: null,
    userName: '',
    userMobile: '',
    userEmail: '',
    reservationDate: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        passportImage: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!packageItem) return;

    // Validation
    if (!formData.passportId || !formData.passportImage || !formData.userName || 
        !formData.userMobile || !formData.userEmail || !formData.reservationDate) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for multipart/form-data
      const submitData = new FormData();
      submitData.append('PassportId', formData.passportId);
      submitData.append('PassportImage', formData.passportImage);
      submitData.append('UserName', formData.userName);
      submitData.append('UserMobile', formData.userMobile);
      submitData.append('UserEmail', formData.userEmail);
      submitData.append('PackageId', packageItem.id);
      submitData.append('ReservationDate', formData.reservationDate);

      const response = await baseApi.post('/MedicalTourismPackageReservations', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Check if payment URL is returned directly (redirect to payment gateway)
        if (response.data.data?.sessionUrl || response.data.data?.paymentUrl) {
          const paymentUrl = response.data.data.sessionUrl || response.data.data.paymentUrl;
          toast.success('تم الحجز بنجاح! جاري التوجيه لبوابة الدفع...');
          
          // Close modal and redirect to payment gateway
          onClose();
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 1000);
        } else {
          // If no payment URL, navigate to reservation details page
          const reservationNumber = response.data.data?.reservationNumber || response.data.data?.id;
          toast.success('تم الحجز بنجاح! جاري التوجيه لصفحة الدفع...');
          
          onClose();
          setTimeout(() => {
            navigate(`/package-reservation/${reservationNumber}`);
          }, 1000);
        }
      } else {
        toast.error(response.data.message || 'حدث خطأ أثناء الحجز');
      }
    } catch (error) {
      console.error('Error booking package:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحجز');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !packageItem) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">حجز الباقة</h3>
            <p className="text-sm opacity-90 mt-1">{packageItem.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:text-primary rounded-full p-2 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Package Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">السعر الإجمالي:</span>
              <span className="text-2xl font-bold text-primary">{packageItem.price} ج.م</span>
            </div>
          </div>

          {/* Passport ID */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              رقم جواز السفر <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="passportId"
              value={formData.passportId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="أدخل رقم جواز السفر"
              required
            />
          </div>

          {/* Passport Image */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              صورة جواز السفر <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="passport-upload"
                required
              />
              <label
                htmlFor="passport-upload"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <FiUpload className="w-5 h-5 ml-2" />
                <span className="text-gray-600">
                  {formData.passportImage ? formData.passportImage.name : 'اختر صورة جواز السفر'}
                </span>
              </label>
            </div>
          </div>

          {/* User Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="أدخل اسمك الكامل"
              required
            />
          </div>

          {/* User Mobile */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="userMobile"
              value={formData.userMobile}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="أدخل رقم الهاتف"
              required
            />
          </div>

          {/* User Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="أدخل البريد الإلكتروني"
              required
            />
          </div>

          {/* Reservation Date */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              تاريخ الحجز <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="reservationDate"
              value={formData.reservationDate}
              onChange={handleInputChange}
              min={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex  flex-col md:flex-row gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-second transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'جاري الحجز...' : 'تأكيد الحجز والدفع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageBookingModal;
