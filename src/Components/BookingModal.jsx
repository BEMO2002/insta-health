import React, { useState, useEffect, useCallback } from "react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiX,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";

const BookingModal = ({ isOpen, onClose, serviceItem, providerName }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userMobile: "",
    appointmentId: null,
    selectedDay: null,
    selectedSlot: null,
    selectedDoctor: null,
  });

  // API data states
  const [availableDays, setAvailableDays] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [daysLoading, setDaysLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  const fetchAvailableDays = useCallback(
    async (doctorId = null) => {
      if (!serviceItem?.id) return;

      try {
        setDaysLoading(true);
        const params = {
          ServiceItemId: serviceItem.id,
          IsAvailable: true,
        };

        // If it's a clinic and doctor is selected, filter by doctor
        if (serviceItem.type === "Clinic" && doctorId) {
          params.DoctorId = doctorId;
        }

        const response = await baseApi.get("/Appointments/days", { params });

        if (response.data.success) {
          setAvailableDays(response.data.data.items || []);
        }
      } catch (error) {
        console.error("Error fetching available days:", error);
        toast.error("فشل في تحميل الأيام المتاحة");
      } finally {
        setDaysLoading(false);
      }
    },
    [serviceItem?.id, serviceItem?.type]
  );

  const fetchAvailableSlots = useCallback(async (dayId) => {
    try {
      setSlotsLoading(true);
      const response = await baseApi.get("/Appointments/appointments", {
        params: {
          DayId: dayId,
          IsBooked: false,
        },
      });

      if (response.data.success) {
        setAvailableSlots(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("فشل في تحميل المواعيد المتاحة");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    if (!serviceItem?.id) return;

    try {
      setDoctorsLoading(true);
      const response = await baseApi.get("/Doctors", {
        params: {
          serviceId: serviceItem.id,
        },
      });

      if (response.data.success) {
        setDoctors(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("فشل في تحميل قائمة الأطباء");
    } finally {
      setDoctorsLoading(false);
    }
  }, [serviceItem?.id]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        userName: "",
        userMobile: "",
        appointmentId: null,
        selectedDay: null,
        selectedSlot: null,
        selectedDoctor: null,
      });
      setAvailableDays([]);
      setAvailableSlots([]);
      setDoctors([]);
    }
  }, [isOpen]);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && serviceItem?.id) {
      if (serviceItem.type === "Clinic") {
        // For clinics, fetch doctors first
        fetchDoctors();
      } else {
        // For services, fetch available days directly
        fetchAvailableDays();
      }
    }
  }, [isOpen, serviceItem, fetchAvailableDays, fetchDoctors]);

  const handleDoctorSelect = (doctor) => {
    setFormData((prev) => ({
      ...prev,
      selectedDoctor: doctor,
    }));
    // Fetch available days for this doctor
    fetchAvailableDays(doctor.id);
    setCurrentStep(2);
  };

  const handleDaySelect = (day) => {
    setFormData((prev) => ({
      ...prev,
      selectedDay: day,
    }));
    fetchAvailableSlots(day.id);
    setCurrentStep(3);
  };

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({
      ...prev,
      selectedSlot: slot,
      appointmentId: slot.id,
    }));
    setCurrentStep(4);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.userName.trim()) {
      toast.error("اسم المستخدم مطلوب");
      return false;
    }
    if (!formData.userMobile.trim()) {
      toast.error("رقم الهاتف مطلوب");
      return false;
    }
    if (!/^01[0-2,5]\d{8}$/.test(formData.userMobile)) {
      toast.error("رقم الهاتف غير صحيح");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await baseApi.post("/ServicesReservations", {
        appointmentId: formData.appointmentId,
        userName: formData.userName,
        userMobile: formData.userMobile,
      });

      if (response.data.success) {
        toast.success("تم حجز الموعد بنجاح");
        onClose();
      } else {
        toast.error("فشل في حجز الموعد");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("حدث خطأ أثناء حجز الموعد");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("ar-EG", options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-primary">
            حجز {serviceItem?.type === "Clinic" ? "عيادة" : "خدمة"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Service Info */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-2">
            {serviceItem?.name}
          </h3>
          <p className="text-sm text-gray-600">{providerName}</p>
          <p className="text-lg font-bold text-second mt-2">
            {serviceItem?.price} ج.م
          </p>
        </div>

        {/* Progress Steps */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      currentStep > step ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {/* Step 1: Select Doctor (Only for Clinics) or Day (for Services) */}
            {currentStep === 1 && (
              <div>
                {serviceItem?.type === "Clinic" ? (
                  <>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiUser className="ml-2" />
                      اختر الطبيب
                    </h3>
                    {doctorsLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : doctors.length > 0 ? (
                      <div className="space-y-2">
                        {doctors.map((doctor) => (
                          <button
                            key={doctor.id}
                            onClick={() => handleDoctorSelect(doctor)}
                            className="w-full p-4 text-right border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={doctor.imageUrl}
                                alt={doctor.name}
                                className="w-16 h-16 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/64x64?text=د.م";
                                }}
                              />
                              <div className="flex-1 text-right">
                                <div className="font-medium text-lg">
                                  {doctor.name}
                                </div>
                                {doctor.speciality && (
                                  <div className="text-sm text-second font-medium">
                                    {doctor.speciality}
                                  </div>
                                )}
                                {doctor.expirence && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    {doctor.expirence}
                                  </div>
                                )}
                                {doctor.rate && (
                                  <div className="flex items-center mt-2">
                                    <div className="flex">
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
                                    <span className="text-xs text-gray-500 mr-2">
                                      ({doctor.rate}/5)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        لا توجد أطباء متاحين حالياً
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiCalendar className="ml-2" />
                      اختر اليوم
                    </h3>
                    {daysLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : availableDays.length > 0 ? (
                      <div className="space-y-2">
                        {availableDays.map((day) => (
                          <button
                            key={day.id}
                            onClick={() => handleDaySelect(day)}
                            className="w-full p-3 text-right border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                          >
                            <div className="font-medium">
                              {formatDate(day.date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {day.dayOfWeek}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        لا توجد أيام متاحة حالياً
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 2: Select Day (for Clinics) or Time Slot (for Services) */}
            {currentStep === 2 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goBack}
                    className="flex items-center text-gray-600 hover:text-primary"
                  >
                    <FiArrowLeft className="ml-1" />
                    العودة
                  </button>
                  <h3 className="text-lg font-semibold flex items-center">
                    <FiCalendar className="ml-2" />
                    اختر اليوم
                  </h3>
                </div>

                {serviceItem?.type === "Clinic" && formData.selectedDoctor && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      الطبيب المختار: {formData.selectedDoctor.name}
                    </p>
                  </div>
                )}

                {daysLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : availableDays.length > 0 ? (
                  <div className="space-y-2">
                    {availableDays.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => handleDaySelect(day)}
                        className="w-full p-3 text-right border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium">
                          {formatDate(day.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {day.dayOfWeek}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    لا توجد أيام متاحة حالياً
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Select Time Slot */}
            {currentStep === 3 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goBack}
                    className="flex items-center text-gray-600 hover:text-primary"
                  >
                    <FiArrowLeft className="ml-1" />
                    العودة
                  </button>
                  <h3 className="text-lg font-semibold flex items-center">
                    <FiClock className="ml-2" />
                    اختر الوقت
                  </h3>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    اليوم المختار: {formatDate(formData.selectedDay?.date)}
                  </p>
                  {formData.selectedDoctor && (
                    <p className="text-sm text-blue-800">
                      الطبيب: {formData.selectedDoctor.name}
                    </p>
                  )}
                </div>

                {slotsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        className="p-3 text-center border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium">
                          {formatTime(slot.slotStart)}
                        </div>
                        <div className="text-xs text-gray-500">
                          - {formatTime(slot.slotEnd)}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    لا توجد مواعيد متاحة في هذا اليوم
                  </p>
                )}
              </div>
            )}

            {/* Step 4: User Details */}
            {currentStep === 4 && (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center text-gray-600 hover:text-primary"
                  >
                    <FiArrowLeft className="ml-1" />
                    العودة
                  </button>
                  <h3 className="text-lg font-semibold flex items-center">
                    <FiUser className="ml-2" />
                    بيانات الحجز
                  </h3>
                </div>

                {/* Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">ملخص الحجز:</h4>
                  <div className="text-sm space-y-1">
                    <p>الخدمة: {serviceItem?.name}</p>
                    <p>التاريخ: {formatDate(formData.selectedDay?.date)}</p>
                    <p>
                      الوقت: {formatTime(formData.selectedSlot?.slotStart)} -{" "}
                      {formatTime(formData.selectedSlot?.slotEnd)}
                    </p>
                    {formData.selectedDoctor && (
                      <p>الطبيب: {formData.selectedDoctor.name}</p>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المستخدم *
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف *
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
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        جاري الحجز...
                      </>
                    ) : (
                      <>
                        تأكيد الحجز
                        <FiArrowRight className="mr-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
