import React, { useState } from "react";
import {
  FiUpload,
  FiUser,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiCheck,
  FiX,
} from "react-icons/fi";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";

const PrescriptionBookingModal = ({
  isOpen,
  onClose,
  providerId,
  providerName,
}) => {
  const [formData, setFormData] = useState({
    userName: "",
    userMobile: "",
    userAddress: "",
    medicinesNames: "",
    prescriptionImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          prescriptionImage: "يرجى اختيار صورة بصيغة JPG, PNG أو WebP",
        }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          prescriptionImage: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        prescriptionImage: file,
      }));
      setErrors((prev) => ({
        ...prev,
        prescriptionImage: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "اسم المستخدم مطلوب";
    }

    if (!formData.userMobile.trim()) {
      newErrors.userMobile = "رقم الهاتف مطلوب";
    } else if (!/^01[0-2,5]\d{8}$/.test(formData.userMobile)) {
      newErrors.userMobile = "رقم الهاتف غير صحيح";
    }

    if (!formData.userAddress.trim()) {
      newErrors.userAddress = "العنوان مطلوب";
    }

    if (!formData.medicinesNames.trim()) {
      newErrors.medicinesNames = "أسماء الأدوية مطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("UserName", formData.userName);
      formDataToSend.append("UserMobile", formData.userMobile);
      formDataToSend.append("UserAddress", formData.userAddress);
      formDataToSend.append("MedicinesNames", formData.medicinesNames);
      formDataToSend.append("ProviderId", providerId);

      if (formData.prescriptionImage) {
        formDataToSend.append("PrescriptionImage", formData.prescriptionImage);
      }

      const response = await baseApi.post(
        "/PrescriptionReservations",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data?.success) {
        toast.success("تم إرسال طلب الحجز بنجاح");
        // Reset form
        setFormData({
          userName: "",
          userMobile: "",
          userAddress: "",
          medicinesNames: "",
          prescriptionImage: null,
        });
        // Clear file input
        const fileInput = document.getElementById("prescriptionImage");
        if (fileInput) fileInput.value = "";
        // Close modal
        onClose();
      } else {
        toast.error("فشل في إرسال الطلب");
      }
    } catch (error) {
      console.error("Error submitting prescription:", error);
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userName: "",
      userMobile: "",
      userAddress: "",
      medicinesNames: "",
      prescriptionImage: null,
    });
    setErrors({});
    const fileInput = document.getElementById("prescriptionImage");
    if (fileInput) fileInput.value = "";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/50 bg-opacity-50 flex items-center justify-center z-[10000] p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-primary">حجز الوصفة الطبية</h2>
          <button
            aria-label="Close Modal"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Provider Info */}
        {providerName && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <p className="text-blue-800 font-medium">
              مقدم الخدمة: {providerName}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiUser className="text-primary" />
                  اسم المستخدم *
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    errors.userName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="أدخل اسمك الكامل"
                />
                {errors.userName && (
                  <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiPhone className="text-primary" />
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  name="userMobile"
                  value={formData.userMobile}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    errors.userMobile ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="01xxxxxxxxx"
                />
                {errors.userMobile && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.userMobile}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FiMapPin className="text-primary" />
                العنوان *
              </label>
              <input
                type="text"
                name="userAddress"
                value={formData.userAddress}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  errors.userAddress ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="أدخل عنوانك الكامل"
              />
              {errors.userAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.userAddress}
                </p>
              )}
            </div>

            {/* Medicines Names */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FiFileText className="text-primary" />
                أسماء الأدوية *
              </label>
              <textarea
                name="medicinesNames"
                value={formData.medicinesNames}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none ${
                  errors.medicinesNames ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="اكتب أسماء الأدوية المطلوبة، كل دواء في سطر منفصل"
              />
              {errors.medicinesNames && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.medicinesNames}
                </p>
              )}
            </div>

            {/* Prescription Image Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FiUpload className="text-primary" />
                صورة الوصفة الطبية
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="prescriptionImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="prescriptionImage" className="cursor-pointer">
                  <FiUpload className="mx-auto text-2xl text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-1 text-sm">
                    {formData.prescriptionImage
                      ? formData.prescriptionImage.name
                      : "اضغط لاختيار صورة الوصفة الطبية"}
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG أو WebP - الحد الأقصى 5 ميجابايت
                  </p>
                </label>
              </div>
              {errors.prescriptionImage && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.prescriptionImage}
                </p>
              )}
              {formData.prescriptionImage && (
                <div className="mt-2 flex items-center gap-2 text-green-600">
                  <FiCheck />
                  <span className="text-sm">تم اختيار الملف بنجاح</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col md:flex-row gap-3 pt-4">
              <button
                aria-label="Close Modal"
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                إلغاء
              </button>
              <button
                aria-label="Submit Form"
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    إرسال طلب الحجز
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2 text-sm">
              معلومات مهمة:
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• تأكد من وضوح صورة الوصفة الطبية</li>
              <li>• اكتب أسماء الأدوية بوضوح</li>
              <li>• سيتم التواصل معك خلال 24 ساعة</li>
              <li>• التوصيل متاح في جميع أنحاء مصر</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionBookingModal;
