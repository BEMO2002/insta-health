import React, { useState, useEffect } from "react";
import baseApi from "../api/baseApi";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCreditCard,
  FiPackage,
  FiActivity,
  FiHome,
  FiMapPin,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import { toast } from "react-toastify";
import userPhoto from "../assets/Home/user.png";
const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("orders"); // 'orders', 'tourism', 'home', 'consultations', 'services'
  const [listData, setListData] = useState({
    items: [],
    count: 0,
    pageIndex: 1,
    pageSize: 5,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await baseApi.get("/Accounts/UserProfile");
        if (response.data.success) {
          setUserData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("حدث خطأ أثناء تحميل بيانات الملف الشخصي");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch List Data based on Tab and Page
  useEffect(() => {
    const fetchListData = async () => {
      setLoadingList(true);
      try {
        let endpoint = "";
        switch (activeTab) {
          case "orders":
            endpoint = `/Orders/UserOrders?pageIndex=${page}&pageSize=5`;
            break;
          case "tourism":
            endpoint = `/MedicalTourismPackageReservations/UserReservations?pageIndex=${page}&pageSize=5`;
            break;
          case "consultations":
            endpoint = `/MedicalConsultationReservations/UserReservations?pageIndex=${page}&pageSize=5`;
            break;
          case "home":
            endpoint = `/HomeReservations/userReservations?pageIndex=${page}&pageSize=5`;
            break;
          case "services":
            endpoint = `/ServicesReservations/userReservations?pageIndex=${page}&pageSize=5`;
            break;
          default:
            return;
        }

        const response = await baseApi.get(endpoint);
        if (response.data.success) {
          setListData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching list data:", error);
        toast.error("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoadingList(false);
      }
    };

    fetchListData();
  }, [activeTab, page]);

  // Reset page on tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (
      s === "paid" ||
      s === "completed" ||
      s === "delivered" ||
      s === "confirmed"
    )
      return "bg-green-100 text-green-700";
    if (s === "pending" || s === "dispatched")
      return "bg-yellow-100 text-yellow-700";
    if (s === "cancelled" || s === "refused") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const translateStatus = (status) => {
    const s = status?.toLowerCase() || "";
    const translations = {
      paid: "مدفوع",
      pending: "قيد الانتظار",
      completed: "مكتمل",
      cancelled: "ملغي",
      dispatched: "تم الشحن",
      delivered: "تم التوصيل",
      confirmed: "مؤكد",
      refused: "مرفوض",
      none: "غير محدد",
    };
    return translations[s] || status;
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(listData.count / listData.pageSize);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          aria-label="Previous Page"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 bg-white"
        >
          السابق
        </button>
        <span className="text-gray-600 font-medium bg-white px-4 py-2 rounded-lg border border-gray-300">
          صفحة {page} من {totalPages}
        </span>
        <button
          aria-label="Next Page"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 bg-white"
        >
          التالي
        </button>
      </div>
    );
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-30 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header Card */}
        {userData && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100">
            <div className="px-8 pb-8">
              <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6 gap-6">
                <img
                  src={userPhoto}
                  alt={userData.displayName}
                  className="w-32 h-32 md:w-50 md:h-50 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                />
                <div className="text-center md:text-right flex-1 mb-3">
                  <h1 className="text-3xl font-bold text-gray-700 mb-1">
                    {userData.displayName}
                  </h1>
                  <p className="text-gray-500 font-medium text-lg">
                    {userData.arabicName}
                  </p>
                  <p className="text-second mt-1 inline-block bg-second/10 px-3 py-1 rounded-full text-sm font-semibold">
                    {userData.roles?.[0]}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 border-t border-gray-300 pt-8">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-primary">
                    <FiMail size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm text-gray-500 mb-1">
                      البريد الإلكتروني
                    </p>
                    <p
                      className="font-semibold text-gray-900 "
                      title={userData.email}
                    >
                      {userData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-primary">
                    <FiPhone size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
                    <p className="font-semibold text-gray-900 dir-ltr text-right">
                      {userData.mobile}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-primary">
                    <FiCreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">الرقم القومي</p>
                    <p className="font-semibold text-gray-900">
                      {userData.nationalId || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-primary">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">تاريخ الانضمام</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(userData.joiningDate).toLocaleDateString(
                        "ar-EG",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto">
          {[
            { id: "orders", label: "الطلبات", icon: FiPackage },
            { id: "tourism", label: "السياحة العلاجية", icon: FiActivity },
            { id: "consultations", label: "استشارات طبية", icon: FiUser },
            { id: "home", label: "حجوزات المنزل", icon: FiHome },
            { id: "services", label: "حجوزات الخدمات", icon: FiActivity },
          ].map((tab) => (
            <button
              aria-label={`Switch to ${tab.label}`}
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-bold ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg scale-105"
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary"
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="space-y-6">
          {loadingList ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-second"></div>
            </div>
          ) : listData.items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl shadow-sm">
              <p className="text-gray-500 text-lg">
                لا توجد بيانات لعرضها حالياً
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeTab === "orders" &&
                listData.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">رقم الطلب</p>
                        <p className="font-bold text-lg text-gray-900">
                          {item.merchantOrderId}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusColor(
                          item.status,
                        )}`}
                      >
                        {translateStatus(item.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          التكلفة الإجمالية
                        </p>
                        <p className="font-bold text-second text-lg">
                          {item.totalCost} ج.م
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          حالة التوصيل
                        </p>
                        <p className="font-semibold text-gray-800">
                          {translateStatus(item.deliveryStatus)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          تاريخ الطلب
                        </p>
                        <p className="font-semibold text-gray-800">
                          {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    {item.items && item.items.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          المنتجات المطلوبة:
                        </p>
                        <div className="space-y-2">
                          {item.items.map((prod, pIndex) => (
                            <div
                              key={pIndex}
                              className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-gray-100"
                            >
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {prod.productName}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {prod.providerName}
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-second">
                                  {prod.totalPrice} ج.م
                                </p>
                                <p className="text-gray-500 text-xs">
                                  الكمية: {prod.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {activeTab === "tourism" &&
                listData.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {item.passportImageUrl && (
                        <div className="w-full lg:w-48 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.passportImageUrl}
                            alt="Passport"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {item.packageName}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <FiFileText size={16} />
                              <span className="text-sm">
                                {item.reservationNumber}
                              </span>
                            </div>
                            <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                              {item.packageType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              حالة الحجز:
                            </span>
                            <span
                              className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusColor(
                                item.reservationStatus,
                              )}`}
                            >
                              {translateStatus(item.reservationStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-sm text-gray-500">تاريخ الحجز</p>
                            <p className="font-semibold">
                              {item.reservationDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">حالة الدفع</p>
                            <p className="font-semibold">
                              {translateStatus(item.paymentStatus)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">السعر</p>
                            <p className="font-bold text-second">
                              {item.price} $
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {activeTab === "consultations" &&
                listData.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {item.complaintImageUrl && (
                        <div className="w-full lg:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.complaintImageUrl}
                            alt="Complaint"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {item.doctorName}
                            </h3>
                            <p className="text-second font-medium text-sm mb-2">
                              {item.medicalSpecialityName}
                            </p>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                              <FiFileText size={14} />
                              <span>{item.reservationNumber}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              حالة الحجز:
                            </span>
                            <span
                              className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusColor(
                                item.reservationStatus,
                              )}`}
                            >
                              {translateStatus(item.reservationStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                تاريخ الحجز
                              </p>
                              <div className="flex items-center gap-2 text-gray-700">
                                <FiCalendar size={16} className="text-second" />
                                <span className="font-semibold">
                                  {item.reservationDate}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                التكلفة
                              </p>
                              <div className="flex items-center gap-2 text-gray-700">
                                <FiCreditCard
                                  size={16}
                                  className="text-second"
                                />
                                <span className="font-bold">
                                  {item.price} ج.م
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                حالة الدفع
                              </p>
                              <span className="font-semibold text-gray-700">
                                {translateStatus(item.paymentStatus)}
                              </span>
                            </div>
                          </div>
                          {item.medicalComplaint && (
                            <div className="bg-gray-50 p-3 rounded-xl">
                              <p className="text-xs text-gray-500 font-bold mb-1">
                                الشكوى الطبية:
                              </p>
                              <p className="text-sm text-gray-700">
                                {item.medicalComplaint}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {activeTab === "home" &&
                listData.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {item.prescriptionImage && (
                        <div className="w-full lg:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.prescriptionImage}
                            alt="Prescription"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {item.subSpecialityName}
                            </h3>
                            {item.subscriptionPlanType && (
                              <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-lg">
                                {item.subscriptionPlanType}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              حالة الحجز:
                            </span>
                            <span
                              className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusColor(
                                item.reservationStatus,
                              )}`}
                            >
                              {translateStatus(item.reservationStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 mt-4">
                          <div className="flex gap-2 items-start">
                            <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
                            <p className="text-gray-600 text-sm line-clamp-1">
                              {item.userAddress}
                            </p>
                          </div>
                          {item.reservationCost && (
                            <div className="flex gap-2 items-center">
                              <FiCreditCard className="text-gray-400 flex-shrink-0" />
                              <p className="font-bold text-second">
                                {item.reservationCost} ج.م
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2 items-center">
                            <FiClock className="text-gray-400 flex-shrink-0" />
                            <p className="text-sm text-gray-600">
                              {new Date(item.createdAt).toLocaleDateString(
                                "ar-EG",
                              )}
                            </p>
                          </div>
                        </div>
                        {item.doctorNotes && (
                          <div className="mt-4 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                            <p className="text-xs text-yellow-700 font-bold mb-1">
                              ملاحظات الطبيب:
                            </p>
                            <p className="text-sm text-gray-700">
                              {item.doctorNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {activeTab === "services" &&
                listData.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {item.prescriptionImage && (
                        <div className="w-full lg:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.prescriptionImage}
                            alt="Prescription"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {item.serviceName}
                            </h3>
                            <p className="text-second font-medium text-sm mb-2">
                              {item.serviceProviderName}
                            </p>
                          </div>
                          <span
                            className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusColor(
                              item.status,
                            )}`}
                          >
                            {translateStatus(item.status)}
                          </span>
                        </div>

                        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                الموعد
                              </p>
                              <div className="flex items-center gap-2 text-gray-700">
                                <FiCalendar size={16} className="text-second" />
                                <span className="font-semibold dir-ltr">
                                  {item.date} - {item.appointmentStart}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                التكلفة
                              </p>
                              <div className="flex items-center gap-2 text-gray-700">
                                <FiCreditCard
                                  size={16}
                                  className="text-second"
                                />
                                <span className="font-bold">
                                  {item.price} ج.م
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                مدة الجلسة
                              </p>
                              <div className="flex items-center gap-2 text-gray-700">
                                <FiClock size={16} className="text-second" />
                                <span className="font-semibold">
                                  {item.serviceDuration} دقيقة
                                </span>
                              </div>
                            </div>
                          </div>
                          {item.content && item.content !== "لا يوجد" && (
                            <div className="bg-gray-50 p-3 rounded-xl">
                              <p className="text-xs text-gray-500 font-bold mb-1">
                                تفاصيل:
                              </p>
                              <p className="text-sm text-gray-700">
                                {item.content}
                              </p>
                            </div>
                          )}
                          {item.doctorNotes && (
                            <div className="mt-4 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                              <p className="text-xs text-yellow-700 font-bold mb-1">
                                ملاحظات المستخدم:
                              </p>
                              <p className="text-sm text-gray-700">
                                {item.doctorNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
