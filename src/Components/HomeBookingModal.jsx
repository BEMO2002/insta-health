import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaUpload,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaFileAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import baseApi from "../api/baseApi";

const HomeBookingModal = ({
  isOpen,
  onClose,
  providerId,
  providerName,
  subSpecialityId = null,
  subSpecialityName = null,
}) => {
  const normalizedSubSpecialityId =
    subSpecialityId && typeof subSpecialityId === "object"
      ? subSpecialityId.id
      : subSpecialityId;
  const [formData, setFormData] = useState({
    UserName: "",
    UserPhoneNumber: "",
    UserAddress: "",
    Content: "",
    PrescriptionImage: null,
    SubSpecialityId: normalizedSubSpecialityId,
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isHealthCardUser, setIsHealthCardUser] = useState(false);
  const [healthCardMembers, setHealthCardMembers] = useState([]);
  const [healthCardLoading, setHealthCardLoading] = useState(false);
  const [selectedHealthCardName, setSelectedHealthCardName] = useState("");
  const [healthCardMessage, setHealthCardMessage] = useState("");

  // Update SubSpecialityId when prop changes
  useEffect(() => {
    const normalized =
      subSpecialityId && typeof subSpecialityId === "object"
        ? subSpecialityId.id
        : subSpecialityId;
    setFormData((prev) => ({
      ...prev,
      SubSpecialityId: normalized,
    }));
  }, [subSpecialityId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        PrescriptionImage: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      PrescriptionImage: null,
    }));
    setImagePreview(null);
  };

  const fetchHealthCard = async () => {
    try {
      setHealthCardLoading(true);
      setHealthCardMessage("");
      const res = await baseApi.get("/HealthCards/user-card");
      if (res.data?.success && res.data?.data) {
        const card = res.data.data;
        const list = [];
        if (card.userName) {
          list.push({ key: `user-${card.id}`, name: card.userName });
        }
        if (Array.isArray(card.members)) {
          card.members.forEach((m) => {
            if (m?.memberName) {
              list.push({ key: `member-${m.id}`, name: m.memberName });
            }
          });
        }
        setHealthCardMembers(list);
        setHealthCardMessage("");
      } else {
        setHealthCardMembers([]);
        setHealthCardMessage("انت غير مشترك يرجي الاشتراك اولا");
      }
    } catch {
      setHealthCardMembers([]);
      setHealthCardMessage("انت غير مشترك يرجي الاشتراك اولا");
    } finally {
      setHealthCardLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const effectiveIsHealthCardUser =
      isHealthCardUser && healthCardMembers.length > 0;
    const effectiveUserName = effectiveIsHealthCardUser
      ? selectedHealthCardName
      : formData.UserName;

    if (effectiveIsHealthCardUser && !selectedHealthCardName) {
      toast.error("يرجى اختيار اسم من كارت الأسرة", {
        position: "top-center",
        autoClose: 3000,
        rtl: true,
        theme: "colored",
      });
      return;
    }

    if (
      !effectiveUserName ||
      !formData.UserPhoneNumber ||
      !formData.UserAddress
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة", {
        position: "top-center",
        autoClose: 3000,
        rtl: true,
        theme: "colored",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("UserName", effectiveUserName);
      submitData.append("UserPhoneNumber", formData.UserPhoneNumber);
      submitData.append("UserAddress", formData.UserAddress);
      submitData.append("Content", formData.Content);
      submitData.append("ServiceProviderId", providerId);
      submitData.append("IsHealthCardUser", effectiveIsHealthCardUser);

      // Add SubSpecialityId if available
      if (formData.SubSpecialityId != null && formData.SubSpecialityId !== "") {
        const subId =
          typeof formData.SubSpecialityId === "object"
            ? formData.SubSpecialityId.id
            : formData.SubSpecialityId;
        submitData.append("SubSpecialityId", String(subId));
      }

      if (formData.PrescriptionImage) {
        submitData.append("PrescriptionImage", formData.PrescriptionImage);
      }

      const response = await baseApi.post("/HomeReservations", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("تم إرسال طلب الحجز بنجاح", {
          position: "top-center",
          autoClose: 3000,
          rtl: true,
          theme: "colored",
        });

        // Reset form
        setFormData({
          UserName: "",
          UserPhoneNumber: "",
          UserAddress: "",
          Content: "",
          PrescriptionImage: null,
          SubSpecialityId: normalizedSubSpecialityId,
        });
        setImagePreview(null);
        setIsHealthCardUser(false);
        setSelectedHealthCardName("");
        setHealthCardMembers([]);
        onClose();
      } else {
        toast.error(response.data.message || "حدث خطأ في إرسال طلب الحجز", {
          position: "top-center",
          autoClose: 3000,
          rtl: true,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("حدث خطأ في إرسال طلب الحجز", {
        position: "top-center",
        autoClose: 3000,
        rtl: true,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-primary">حجز خدمة منزلية</h2>
            <p className="text-gray-600 mt-1">مقدم الخدمة: {providerName}</p>
            {subSpecialityName && (
              <div>
                <p className="text-gray-600 mt-1">
                  الخدمة المختارة: {subSpecialityName}
                </p>
              </div>
            )}
          </div>

          <button
            aria-label="Close Modal"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                استخدام كارت الأسرة؟
              </label>
              <select
                value={isHealthCardUser ? "true" : "false"}
                onChange={async (e) => {
                  const value = e.target.value === "true";
                  setIsHealthCardUser(value);
                  setSelectedHealthCardName("");
                  if (value && healthCardMembers.length === 0) {
                    await fetchHealthCard();
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent bg-white"
              >
                <option value="false">لا</option>
                <option value="true">نعم</option>
              </select>
            </div>

            {isHealthCardUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر اسم من كارت الأسرة
                </label>
                {healthCardLoading ? (
                  <div className="flex items-center justify-center py-3 text-gray-500 text-sm">
                    جاري تحميل بيانات كارت الأسرة...
                  </div>
                ) : healthCardMembers.length === 0 ? (
                  <div className="text-sm text-red-600">
                    {healthCardMessage || "انت غير مشترك يرجي الاشتراك اولا"}
                  </div>
                ) : (
                  <select
                    value={selectedHealthCardName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedHealthCardName(value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent bg-white"
                  >
                    <option value="">اختر اسم</option>
                    {healthCardMembers.map((m) => (
                      <option key={m.key} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* User Name */}
            {(!isHealthCardUser ||
              (isHealthCardUser && healthCardMembers.length === 0)) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline ml-2" size={14} />
                  اسم المستخدم *
                </label>
                <input
                  type="text"
                  name="UserName"
                  value={formData.UserName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline ml-2" size={14} />
                رقم الهاتف *
              </label>
              <input
                type="tel"
                name="UserPhoneNumber"
                value={formData.UserPhoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent"
                placeholder="أدخل رقم هاتفك"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline ml-2" size={14} />
                العنوان *
              </label>
              <textarea
                name="UserAddress"
                value={formData.UserAddress}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent"
                placeholder="أدخل عنوانك بالتفصيل"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFileAlt className="inline ml-2" size={14} />
                ملاحظات إضافية
              </label>
              <textarea
                name="Content"
                value={formData.Content}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent"
                placeholder="أدخل أي ملاحظات أو تفاصيل إضافية"
              />
            </div>

            {/* SubSpecialityId - Hidden field */}
            {formData.SubSpecialityId && (
              <input
                type="hidden"
                name="SubSpecialityId"
                value={formData.SubSpecialityId}
              />
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUpload className="inline ml-2" size={14} />
                صورة الروشتة (اختياري)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-second transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FaUpload className="text-gray-400 mb-2" size={32} />
                  <span className="text-gray-600">
                    {formData.PrescriptionImage
                      ? "تغيير الصورة"
                      : "اضغط لرفع صورة الروشتة"}
                  </span>
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    aria-label="Remove Image"
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              aria-label="Close Modal"
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              aria-label="Submit Booking"
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-second text-white rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white ml-2"></div>
                  جاري الإرسال...
                </>
              ) : (
                "إرسال طلب الحجز"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomeBookingModal;
