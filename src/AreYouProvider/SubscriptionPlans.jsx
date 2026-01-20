import React, { useEffect, useState, useMemo } from "react";
import Modal from "react-modal";
import { FiLoader, FiAlertCircle, FiX } from "react-icons/fi";
import baseApi from "../api/baseApi";
import ServiceProviderApplicationsForm from "./ServiceProviderApplicationsForm";
import MedicalSupplierApplicationsForm from "./MedicalSupplierApplicationsForm";

Modal.setAppElement("#root");

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    formType: null, // 'service' | 'supplier'
    plan: null,
  });
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await baseApi.get("/SubscriptionPlans");
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

  const servicePlans = useMemo(
    () => plans.filter((plan) => plan.type === "ServiceProvider"),
    [plans],
  );

  const openModal = (formType, plan) => {
    setModalState({
      isOpen: true,
      formType,
      plan,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      formType: null,
      plan: null,
    });
  };

  const handleFormSuccess = (planName) => {
    closeModal();
    setSuccessToast(
      `تم الاشتراك في ${planName} بنجاح، أحد ممثلي خدمة العملاء سوف يتواصل معك قريباً.`,
    );
  };

  useEffect(() => {
    if (!successToast) return;
    const timer = setTimeout(() => setSuccessToast(""), 6000);
    return () => clearTimeout(timer);
  }, [successToast]);

  const renderModalContent = () => {
    if (!modalState.plan) return null;

    const sharedProps = {
      subscriptionPlanId: modalState.plan.id,
      planName: modalState.plan.name,
      onClose: closeModal,
      onSuccess: () => handleFormSuccess(modalState.plan.name),
    };

    if (modalState.formType === "service") {
      return <ServiceProviderApplicationsForm {...sharedProps} />;
    }

    if (modalState.formType === "supplier") {
      return <MedicalSupplierApplicationsForm {...sharedProps} />;
    }

    return null;
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
      <div className="max-w-6xl mx-auto px-4">
        {successToast && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-green-50 text-green-800 px-6 py-4 rounded-3xl shadow-sm text-right">
            <p className="text-sm md:text-base">{successToast}</p>
            <button
              onClick={() => setSuccessToast("")}
              className="text-green-700 hover:text-green-900 font-semibold"
            >
              إغلاق
            </button>
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            باقات مقدمي الخدمات
          </h2>
          <p className="text-gray-600 text-lg">
            اختر الباقة الأنسب وابدأ شراكتك معنا بخطوات بسيطة
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {servicePlans.map((plan) => (
            <article
              key={plan.id}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:border-primary transition-all duration-300 flex flex-col"
            >
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    خطة #{plan.id}
                  </span>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-right">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-right mb-6 leading-relaxed">
                  {plan.description}
                </p>
                {plan.planAdvantages?.length > 0 && (
                  <ul className="space-y-3 text-right mb-6">
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
              </div>

              <div className="border-t border-gray-100 p-6 flex flex-col gap-4 md:flex-row md:gap-3">
                <button
                  className="w-full inline-flex justify-center items-center gap-2 bg-second text-white font-semibold py-3 rounded-2xl hover:bg-primary transition-all duration-300"
                  onClick={() => openModal("service", plan)}
                >
                  اشترك كمقدم خدمة طبية
                </button>
                <button
                  className="w-full inline-flex justify-center items-center gap-2 border-2 border-second text-second font-semibold py-3 rounded-2xl hover:bg-second hover:text-white transition-all duration-300"
                  onClick={() => openModal("supplier", plan)}
                >
                  اشترك كمورد للمستلزمات
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onRequestClose={closeModal}
        className="max-w-4xl mx-auto mt-20   bg-white rounded-3xl outline-none shadow-2xl overflow-auto max-h-[85vh]"
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
    </section>
  );
};

export default SubscriptionPlans;
