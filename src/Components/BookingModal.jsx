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
    content: "",
    prescriptionImage: null,
    appointmentId: null,
    selectedDay: null,
    selectedSlot: null,
    selectedDoctor: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  const [isHealthCardUser, setIsHealthCardUser] = useState(false);
  const [healthCardMembers, setHealthCardMembers] = useState([]);
  const [healthCardLoading, setHealthCardLoading] = useState(false);
  const [selectedHealthCardName, setSelectedHealthCardName] = useState("");
  const [healthCardMessage, setHealthCardMessage] = useState("");

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
    [serviceItem?.id, serviceItem?.type],
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

  const getDoctorPricing = (doctor) => {
    const basePrice = doctor?.reservationPrice;
    const discountedPrice =
      doctor?.discountReservationPrice ??
      doctor?.reservationDiscountPrice ??
      doctor?.discountPrice;
    const hasDiscount =
      discountedPrice != null &&
      basePrice != null &&
      Number(discountedPrice) < Number(basePrice);
    const discountPercent = hasDiscount
      ? Math.round(100 - (Number(discountedPrice) / Number(basePrice)) * 100)
      : 0;

    return { basePrice, discountedPrice, hasDiscount, discountPercent };
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        userName: "",
        userMobile: "",
        content: "",
        prescriptionImage: null,
        appointmentId: null,
        selectedDay: null,
        selectedSlot: null,
        selectedDoctor: null,
      });
      setPreviewUrl(null);
      setAvailableDays([]);
      setAvailableSlots([]);
      setDoctors([]);
      setIsHealthCardUser(false);
      setHealthCardMembers([]);
      setHealthCardLoading(false);
      setSelectedHealthCardName("");
      setHealthCardMessage("");
    }
  }, [isOpen]);

  // Cleanup preview URL on unmount or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        prescriptionImage: file,
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
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

  const validateForm = () => {
    const effectiveIsHealthCardUser =
      isHealthCardUser && healthCardMembers.length > 0;
    const effectiveUserName = effectiveIsHealthCardUser
      ? selectedHealthCardName
      : formData.userName;

    if (effectiveIsHealthCardUser && !selectedHealthCardName) {
      toast.error("يرجى اختيار اسم من كارت الأسرة");
      return false;
    }

    if (!effectiveUserName.trim()) {
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
      const effectiveIsHealthCardUser =
        isHealthCardUser && healthCardMembers.length > 0;
      const effectiveUserName = effectiveIsHealthCardUser
        ? selectedHealthCardName
        : formData.userName;

      const submissionData = new FormData();
      submissionData.append("AppointmentId", formData.appointmentId);
      submissionData.append("UserName", effectiveUserName);
      submissionData.append("UserMobile", formData.userMobile);
      submissionData.append("IsHealthCardUser", effectiveIsHealthCardUser);

      if (formData.content) {
        submissionData.append("Content", formData.content);
      }

      if (formData.prescriptionImage) {
        submissionData.append("PrescriptionImage", formData.prescriptionImage);
      }

      const response = await baseApi.post(
        "/ServicesReservations",
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
          {serviceItem?.type !== "Clinic" && serviceItem?.discountPrice && (
            <p className="text-lg font-bold text-second mt-2">
              {serviceItem?.discountPrice} ج.م
            </p>
          )}
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
                    className={`md:w-[180px] w-[50px] h-1 mx-2 ${
                      currentStep > step ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px] ">
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
                        {doctors.map((doctor) => {
                          const {
                            basePrice,
                            discountedPrice,
                            hasDiscount,
                            discountPercent,
                          } = getDoctorPricing(doctor);

                          return (
                            <button
                              key={doctor.id}
                              onClick={() => handleDoctorSelect(doctor)}
                              className="w-full p-4 text-right border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img
                                    src={doctor.imageUrl}
                                    alt={doctor.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/64x64?text=د.م";
                                    }}
                                  />
                                  {hasDiscount && (
                                    <div className="absolute -top-8 -right-1">
                                      <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[12px] font-extrabold shadow">
                                        خصم {discountPercent}%
                                      </span>
                                    </div>
                                  )}
                                </div>

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
                                  {(basePrice != null ||
                                    discountedPrice != null) && (
                                    <div className="mt-2 flex items-center justify-between bg-white/70 rounded px-2 py-1 border border-gray-200">
                                      <span className="text-xs text-gray-600 font-semibold">
                                        رسوم الاستشارة:
                                      </span>
                                      {hasDiscount ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg font-extrabold text-red-600">
                                            {discountedPrice} $
                                          </span>
                                          <span className="text-md font-bold text-gray-500 line-through">
                                            {basePrice} $
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm font-bold text-primary">
                                          {basePrice} $
                                        </span>
                                      )}
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
                          );
                        })}
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
                      <div>
                        <p>الطبيب: {formData.selectedDoctor.name}</p>
                        {(() => {
                          const {
                            basePrice,
                            discountedPrice,
                            hasDiscount,
                            discountPercent,
                          } = getDoctorPricing(formData.selectedDoctor);

                          if (basePrice == null && discountedPrice == null)
                            return null;

                          return (
                            <div className="mt-2 flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
                              <span className="text-xs text-gray-600 font-semibold">
                                رسوم الاستشارة:
                              </span>
                              {hasDiscount ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-extrabold text-red-600">
                                    {discountedPrice} $
                                  </span>
                                  <span className="text-xs font-bold text-gray-500 line-through">
                                    {basePrice} $
                                  </span>
                                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-extrabold shadow">
                                    خصم {discountPercent}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-primary">
                                  {basePrice} $
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
                          {healthCardMessage ||
                            "انت غير مشترك يرجي الاشتراك اولا"}
                        </div>
                      ) : (
                        <select
                          value={selectedHealthCardName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedHealthCardName(value);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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

                  {(!isHealthCardUser ||
                    (isHealthCardUser && healthCardMembers.length === 0)) && (
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
                  )}

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تفاصيل إضافية
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="أي تفاصيل أو ملاحظات أخرى..."
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة الروشتة
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="prescription-upload"
                      />
                      <label
                        htmlFor="prescription-upload"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                      >
                        <svg
                          className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">
                          اضغط لرفع صورة الروشتة
                        </span>
                        <span className="text-xs text-gray-400">
                          (PNG, JPG, JPEG)
                        </span>
                      </label>
                    </div>

                    {previewUrl && (
                      <div className="mt-4 relative bg-gray-100 rounded-lg p-2 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              prescriptionImage: null,
                            }));
                            setPreviewUrl(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <FiX size={16} />
                        </button>
                        <img
                          src={previewUrl}
                          alt="Prescription Preview"
                          className="w-full h-48 object-contain rounded-md"
                        />
                        <p className="text-center text-xs text-gray-500 mt-2">
                          معاينة الصورة
                        </p>
                      </div>
                    )}
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
