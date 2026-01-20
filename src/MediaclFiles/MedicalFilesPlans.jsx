import React, { useEffect, useState, useMemo } from "react";
import Modal from "react-modal";
import { FiLoader, FiAlertCircle, FiX, FiFileText } from "react-icons/fi";
import { toast } from "react-toastify";
import baseApi from "../api/baseApi";
import MedicalFileForm from "./MedicalFileForm";
import { Link } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";
Modal.setAppElement("#root");

const MedicalFilesPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    plan: null,
  });
  const [fileModalState, setFileModalState] = useState({
    isOpen: false,
    file: null,
    loading: false,
    error: "",
    errorCode: null,
    cardNumber: null,
    successMessage: "",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await baseApi.get(
          "/SubscriptionPlans?type=MedicalFile",
        );
        if (response?.data?.success && Array.isArray(response.data.data)) {
          setPlans(response.data.data);
        } else {
          throw new Error("تعذر تحميل الباقات");
        }
      } catch (err) {
        setError(err?.message || "حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const medicalFilePlans = useMemo(
    () => plans.filter((plan) => plan.type === "MedicalFile"),
    [plans],
  );

  const openModal = (plan) => {
    setModalState({ isOpen: true, plan });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, plan: null });
  };

  const handleFormSuccess = (planName) => {
    closeModal();
    toast.success(
      `تم الاشتراك في ${planName} بنجاح، أحد ممثلي خدمة العملاء سوف يتواصل معك قريباً.`,
    );
  };

  const openFileModal = async () => {
    setFileModalState({
      isOpen: true,
      file: null,
      loading: true,
      error: "",
      errorCode: null,
      cardNumber: null,
      successMessage: "",
    });
    try {
      const res = await baseApi.get("/MedicalFiles/user", {
        validateStatus: () => true,
      });
      if (res.data?.success) {
        setFileModalState({
          isOpen: true,
          file: res.data.data || null,
          loading: false,
          error: "",
          errorCode: null,
          cardNumber:
            res.data.data?.cardNumber || res.data.data?.fileId || null,
          successMessage: "",
        });
      } else {
        const statusCode = res.data?.statusCode || res.status;
        const message = res?.data?.message || "تعذر تحميل بيانات الملف.";
        const cardNumber =
          res.data?.data?.cardNumber ||
          res.data?.data?.fileId ||
          res.data?.cardNumber ||
          null;

        setFileModalState({
          isOpen: true,
          file: null,
          loading: false,
          error: message,
          errorCode: statusCode,
          cardNumber: cardNumber,
          successMessage: "",
        });
      }
    } catch (err) {
      const statusCode =
        err?.response?.status || err?.response?.data?.statusCode;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "تعذر تحميل بيانات الملف.";
      const cardNumber =
        err?.response?.data?.data?.cardNumber ||
        err?.response?.data?.data?.fileId ||
        err?.response?.data?.cardNumber ||
        null;

      setFileModalState({
        isOpen: true,
        file: null,
        loading: false,
        error: message,
        errorCode: statusCode,
        cardNumber: cardNumber,
        successMessage: "",
      });
    }
  };

  const closeFileModal = () => {
    setFileModalState({
      isOpen: false,
      file: null,
      loading: false,
      error: "",
      errorCode: null,
      cardNumber: null,
      successMessage: "",
    });
  };

  const handleRenew = async (paymentType) => {
    if (!fileModalState.cardNumber) {
      toast.error("رقم الملف غير متوفر");
      return;
    }

    try {
      const payload = {
        cardNumber: fileModalState.cardNumber,
        paymentType: paymentType,
      };

      if (paymentType === "Visa") {
        payload.clientUrl = `${window.location.origin}/medical-file/status`;
      }

      const res = await baseApi.post(
        "/Subscriptions/renew-medicalfile",
        payload,
        {
          validateStatus: () => true,
        },
      );

      if (res.data?.success) {
        if (paymentType === "Visa" && res.data?.data?.sessionUrl) {
          window.location.href = res.data.data.sessionUrl;
          return;
        }
        const successMsg =
          "تم تنفيذ طلبك بنجاح وسيتم التواصل معك قريباً من أحد ممثلي الخدمة لإتمام الدفع والتجديد";
        toast.success(successMsg);
        setFileModalState((prev) => ({
          ...prev,
          error: "",
          errorCode: null,
          successMessage: successMsg,
        }));
        await openFileModal();
      } else {
        toast.error(res?.data?.message || "فشل تجديد الاشتراك");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "حدث خطأ أثناء تجديد الاشتراك",
      );
    }
  };

  const statusClasses = (status) => {
    const val = (status || "").toString().toLowerCase();
    if (val === "paid") return "bg-green-100 text-green-700";
    if (val === "failed" || val === "cancelled")
      return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const renderModalContent = () => {
    if (!modalState.plan) return null;

    return (
      <MedicalFileForm
        plan={modalState.plan}
        subscriptionPlanId={modalState.plan.id}
        onClose={closeModal}
        onSuccess={() => handleFormSuccess(modalState.plan.name)}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-center px-4">
        <div className="bg-red-50 text-red-700 px-6 py-8 rounded-2xl flex flex-col items-center gap-3">
          <FiAlertCircle className="w-8 h-8" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            باقة الملف الطبي
          </h2>
          <p className="text-gray-600 text-lg">
            اختر الباقة واملأ بياناتك بسهولة
          </p>
        </div>

        <div className="grid gap-8">
          {medicalFilePlans.map((plan) => (
            <article
              key={plan.id}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:border-second transition-all duration-300"
            >
              <div className="p-8 space-y-6">
                <div className="flex flex-col gap-2 text-right">
                  <span className="text-sm font-semibold text-second bg-second/10 px-3 py-1 rounded-full self-end">
                    خطة #{plan.id}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-right leading-relaxed">
                  {plan.description}
                </p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {plan.discountPrice &&
                        plan.price &&
                        plan.discountPrice < plan.price && (
                          <span className="text-lg text-gray-400 line-through">
                            {plan.price?.toLocaleString("ar-EG")} ج.م
                          </span>
                        )}
                      <span className="text-3xl font-bold text-primary">
                        {plan.discountPrice &&
                        plan.price &&
                        plan.discountPrice < plan.price
                          ? plan.discountPrice.toLocaleString("ar-EG")
                          : plan.price?.toLocaleString("ar-EG")}{" "}
                        ج.م
                      </span>
                    </div>
                    <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-lg w-fit text-sm font-medium">
                      المدة: {plan.durationInMonths} شهر
                    </span>
                  </div>
                </div>
                {plan.planAdvantages?.length > 0 && (
                  <ul className="space-y-3 text-right">
                    {plan.planAdvantages.map((adv) => (
                      <li
                        key={adv.id}
                        className="flex items-start gap-2 text-gray-700"
                      >
                        <span className="w-2 h-2 mt-2 rounded-full bg-second"></span>
                        <span>{adv.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  className="w-full inline-flex justify-center items-center gap-2 bg-second text-white font-semibold py-3 rounded-2xl hover:bg-primary transition-all duration-300"
                  onClick={() => openModal(plan)}
                >
                  اشترك الآن
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center flex justify-center gap-4">
          <button
            onClick={openFileModal}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-2xl hover:bg-second transition-all duration-300"
          >
            <FiFileText className="w-5 h-5" />
            <span>عرض بيانات الملف</span>
          </button>
          <Link
            to="/medical-file-record"
            className="inline-flex items-center gap-2 bg-transparent text-primary border border-primary font-semibold px-8 py-3 rounded-2xl hover:bg-second/5 transition-all duration-300"
          >
            <IoReturnUpBackOutline className="w-6 h-6" />
            <span>الذهاب للملف الطبي</span>
          </Link>
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onRequestClose={closeModal}
        className="max-w-6xl w-[1000px] mx-auto mt-20 bg-white rounded-3xl outline-none shadow-2xl overflow-auto max-h-[85vh]"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
        closeTimeoutMS={0}
      >
        <div className="flex justify-end p-4 border-b border-gray-100">
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-second font-semibold"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6">{renderModalContent()}</div>
      </Modal>

      <Modal
        isOpen={fileModalState.isOpen}
        onRequestClose={closeFileModal}
        className="max-w-6xl w-[1000px] mx-auto mt-20 bg-white rounded-3xl outline-none shadow-2xl overflow-auto max-h-[85vh]"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
        closeTimeoutMS={0}
      >
        <div className="flex justify-end p-4 border-b border-gray-100">
          <button
            onClick={closeFileModal}
            className="text-gray-500 hover:text-second font-semibold"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right">
            بيانات الملف الطبي
          </h2>
          {fileModalState.loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : fileModalState.successMessage ? (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-700 px-6 py-4 rounded-2xl text-right">
                <p>{fileModalState.successMessage}</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={closeFileModal}
                  className="px-6 py-3 bg-second text-white rounded-2xl font-semibold hover:bg-primary transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          ) : fileModalState.error ? (
            <div className="space-y-4">
              <div
                className={`px-6 py-4 rounded-2xl text-right ${
                  fileModalState.errorCode === 400
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <p>{fileModalState.error}</p>
              </div>
              {fileModalState.errorCode === 401 &&
                fileModalState.cardNumber &&
                (fileModalState.error?.toLowerCase().includes("expired") ||
                  fileModalState.error?.toLowerCase().includes("منتهي") ||
                  fileModalState.error?.toLowerCase().includes("انتهت") ||
                  fileModalState.error?.toLowerCase().includes("انتهاء") ||
                  fileModalState.error?.toLowerCase().includes("تجديد")) && (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => handleRenew("Cash")}
                      className="px-6 py-3 bg-second text-white rounded-2xl font-semibold hover:bg-primary transition"
                    >
                      تجديد نقداً
                    </button>
                    <button
                      onClick={() => handleRenew("Visa")}
                      className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-second transition"
                    >
                      تجديد بفيزا
                    </button>
                  </div>
                )}
              {fileModalState.errorCode === 400 &&
                fileModalState.cardNumber && (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => handleRenew("Visa")}
                      className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-second transition"
                    >
                      دفع بفيزا لتفعيل الاشتراك
                    </button>
                  </div>
                )}
            </div>
          ) : fileModalState.file ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusClasses(
                    fileModalState.file.paymentStatus ||
                      fileModalState.file.PaymentStatus,
                  )}`}
                >
                  حالة الدفع:{" "}
                  {fileModalState.file.paymentStatus ||
                    fileModalState.file.PaymentStatus ||
                    "-"}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-right">
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      رقم الملف:
                    </span>
                    <p className="text-gray-900 font-bold text-lg">
                      {fileModalState.file.fileNumber ||
                        fileModalState.file.id ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      الاسم:
                    </span>
                    <p className="text-gray-900 font-bold">
                      {fileModalState.file.userName || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      الهاتف:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.userPhone || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      البريد الإلكتروني:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.userEmail || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      الرقم القومي:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.nationalId || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      الوظيفة:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.jobTitle || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      فصيلة الدم:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.bloodType || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      الطول:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.userTall
                        ? `${fileModalState.file.userTall} سم`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      الوزن:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.userWeight
                        ? `${fileModalState.file.userWeight} كجم`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      النظر:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.userSight || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      السمع:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.userHearing || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      ضغط الدم:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.bloodPressure || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      السكر:
                    </span>
                    <p className="text-gray-900">
                      {fileModalState.file.diabetes || "-"}
                    </p>
                  </div>
                  {fileModalState.file.otherDiseases && (
                    <div className="md:col-span-2">
                      <span className="text-sm text-gray-600 font-semibold">
                        أمراض أخرى:
                      </span>
                      <p className="text-gray-900">
                        {fileModalState.file.otherDiseases}
                      </p>
                    </div>
                  )}
                  <div className="">
                    <span className="text-sm text-gray-600 font-semibold">
                      تاريخ الإنتهاء:
                    </span>
                    <p className="text-gray-900 bg-red-200 p-1 w-fit rounded-md">
                      {fileModalState.file.expirationDate
                        ? new Date(
                            fileModalState.file.expirationDate,
                          ).toLocaleDateString("ar-EG")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p>لا توجد بيانات للملف بعد.</p>
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
};

export default MedicalFilesPlans;
