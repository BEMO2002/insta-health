import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiUpload, FiCalendar } from "react-icons/fi";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";

const ConsultationBookingModal = ({ isOpen, onClose, doctor }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    passportId: "",
    passportImage: null,
    userName: "",
    userMobile: "",
    userEmail: "",
    medicalComplaint: "",
    complaintImage: null,
    reservationDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const validateForm = () => {
    if (!formData.passportId.trim()) {
      toast.error("رقم جواز السفر مطلوب");
      return false;
    }
    if (!formData.passportImage) {
      toast.error("صورة جواز السفر مطلوبة");
      return false;
    }
    if (!formData.userName.trim()) {
      toast.error("اسم المستخدم مطلوب");
      return false;
    }
    if (!formData.userMobile.trim()) {
      toast.error("رقم الهاتف مطلوب");
      return false;
    }
    if (!formData.userEmail.trim()) {
      toast.error("البريد الإلكتروني مطلوب");
      return false;
    }
    if (!formData.reservationDate) {
      toast.error("تاريخ الحجز مطلوب");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("PassportId", formData.passportId);
      formDataToSend.append("PassportImage", formData.passportImage);
      formDataToSend.append("UserName", formData.userName);
      formDataToSend.append("UserMobile", formData.userMobile);
      formDataToSend.append("UserEmail", formData.userEmail);
      formDataToSend.append("ReservationDate", formData.reservationDate);
      formDataToSend.append("DoctorId", doctor.id);

      if (formData.medicalComplaint) {
        formDataToSend.append("MedicalComplaint", formData.medicalComplaint);
      }
      if (formData.complaintImage) {
        formDataToSend.append("ComplaintImage", formData.complaintImage);
      }

      const response = await baseApi.post(
        "/MedicalConsultationReservations",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        // Check if payment URL is returned directly (redirect to payment gateway)
        if (response.data.data?.sessionUrl || response.data.data?.paymentUrl) {
          const paymentUrl =
            response.data.data.sessionUrl || response.data.data.paymentUrl;
          toast.success("تم الحجز بنجاح! جاري التوجيه لبوابة الدفع...");

          // Close modal and redirect to payment gateway
          onClose();
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 1000);
        } else {
          // If no payment URL, navigate to reservation details page
          const reservationNumber =
            response.data.data?.reservationNumber || response.data.data?.id;
          toast.success("تم الحجز بنجاح! جاري التوجيه لصفحة الدفع...");

          onClose();
          setTimeout(() => {
            navigate(`/medical-consultation-reservations/${reservationNumber}`);
          }, 1000);
        }
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء الحجز");
      }
    } catch (error) {
      console.error("Error booking consultation:", error);
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء حجز الاستشارة",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-primary">حجز استشارة طبية</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Doctor Info */}
        {doctor && (
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/64x64?text=د.م";
                }}
              />
              <div>
                <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                <p className="text-sm text-second">{doctor.speciality}</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${
                        star <= doctor.rate
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passport ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم جواز السفر <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="passportId"
                value={formData.passportId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="أدخل رقم جواز السفر"
                required
              />
            </div>

            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>

            {/* User Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="userMobile"
                value={formData.userMobile}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="01xxxxxxxxx"
                required
              />
            </div>

            {/* User Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="example@email.com"
                required
              />
            </div>

            {/* Reservation Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الحجز <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="reservationDate"
                  value={formData.reservationDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Passport Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة جواز السفر <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                <FiUpload className="ml-2" />
                <span className="text-sm text-gray-600">
                  {formData.passportImage
                    ? formData.passportImage.name
                    : "اختر ملف"}
                </span>
                <input
                  type="file"
                  name="passportImage"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  required
                />
              </label>
            </div>
          </div>

          {/* Medical Complaint */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الشكوى الطبية (اختياري)
            </label>
            <textarea
              name="medicalComplaint"
              value={formData.medicalComplaint}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="اكتب شكواك الطبية هنا..."
            />
          </div>

          {/* Complaint Image */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              صورة للشكوى (اختياري)
            </label>
            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
              <FiUpload className="ml-2" />
              <span className="text-sm text-gray-600">
                {formData.complaintImage
                  ? formData.complaintImage.name
                  : "اختر ملف"}
              </span>
              <input
                type="file"
                name="complaintImage"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-second transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white ml-2"></div>
                  جاري الحجز...
                </>
              ) : (
                "تأكيد الحجز والدفع"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationBookingModal;
