import React, { useEffect, useState, useMemo } from "react";
import Modal from "react-modal";
import {
  FiLoader,
  FiAlertCircle,
  FiUsers,
  FiX,
  FiCreditCard,
  FiPlus,
} from "react-icons/fi";
import { toast } from "react-toastify";
import baseApi from "../api/baseApi";
import FamilyCardForm from "./FamilyCardForm";

Modal.setAppElement("#root");

const SubscriptionFamilyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    plan: null,
  });
  const [cardModalState, setCardModalState] = useState({
    isOpen: false,
    card: null,
    loading: false,
    error: "",
  });
  const [addMemberModalState, setAddMemberModalState] = useState({
    isOpen: false,
    submitting: false,
    error: "",
  });
  const [newMemberForm, setNewMemberForm] = useState({
    memberName: "",
    gender: "Male",
    relationship: "",
    nationalId: "",
    birthDate: "",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await baseApi.get(
          "/SubscriptionPlans?type=HealthCard"
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

  const healthPlans = useMemo(
    () => plans.filter((plan) => plan.type === "HealthCard"),
    [plans]
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
      `تم الاشتراك في ${planName} بنجاح، أحد ممثلي خدمة العملاء سوف يتواصل معك قريباً.`
    );
  };

  const openCardModal = async () => {
    setCardModalState({ isOpen: true, card: null, loading: true, error: "" });
    try {
      const res = await baseApi.get("/HealthCards/user-card", {
        validateStatus: () => true,
      });
      if (res.data?.success) {
        setCardModalState({
          isOpen: true,
          card: res.data.data || null,
          loading: false,
          error: "",
        });
      } else {
        setCardModalState({
          isOpen: true,
          card: null,
          loading: false,
          error: res?.data?.message || "تعذر تحميل بيانات الكارت.",
        });
      }
    } catch (err) {
      setCardModalState({
        isOpen: true,
        card: null,
        loading: false,
        error: err?.message || "تعذر تحميل بيانات الكارت.",
      });
    }
  };

  const closeCardModal = () => {
    setCardModalState({ isOpen: false, card: null, loading: false, error: "" });
  };

  const statusClasses = (status) => {
    const val = (status || "").toString().toLowerCase();
    if (val === "paid") return "bg-green-100 text-green-700";
    if (val === "failed" || val === "cancelled")
      return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const deliveryStatusClasses = (status) => {
    const val = (status || "").toString().toLowerCase();
    if (val === "dispatched") return "bg-green-100 text-green-700";
    if (val === "notdispatched") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const deliveryStatusText = (status) => {
    const val = (status || "").toString().toLowerCase();
    if (val === "dispatched") return "تم الشحن";
    if (val === "notdispatched") return "لم يتم الشحن";
    return status || "-";
  };

  const openAddMemberModal = () => {
    setAddMemberModalState({ isOpen: true, submitting: false, error: "" });
    setNewMemberForm({
      memberName: "",
      gender: "Male",
      relationship: "",
      nationalId: "",
      birthDate: "",
    });
  };

  const closeAddMemberModal = () => {
    setAddMemberModalState({ isOpen: false, submitting: false, error: "" });
    setNewMemberForm({
      memberName: "",
      gender: "Male",
      relationship: "",
      nationalId: "",
      birthDate: "",
    });
  };

  const handleAddMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMemberForm((prev) => ({ ...prev, [name]: value }));
    setAddMemberModalState((prev) => ({ ...prev, error: "" }));
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    const { memberName, gender, relationship, birthDate } = newMemberForm;

    if (!memberName?.trim() || !relationship?.trim() || !birthDate) {
      setAddMemberModalState((prev) => ({
        ...prev,
        error: "يرجى ملء جميع الحقول المطلوبة",
      }));
      return;
    }

    setAddMemberModalState((prev) => ({
      ...prev,
      submitting: true,
      error: "",
    }));

    try {
      const res = await baseApi.post("/HealthCards/add-member", {
        memberName: memberName.trim(),
        gender,
        relationship: relationship.trim(),
        nationalId: newMemberForm.nationalId?.trim() || "",
        birthDate,
      });

      if (res.data?.success) {
        closeAddMemberModal();
        // إعادة تحميل بيانات الكارت
        try {
          const cardRes = await baseApi.get("/HealthCards/user-card", {
            validateStatus: () => true,
          });
          if (cardRes.data?.success) {
            setCardModalState((prev) => ({
              ...prev,
              card: cardRes.data.data || null,
            }));
          }
        } catch (err) {
          console.error("Failed to reload card data", err);
        }
        toast.success("تم إضافة العضو بنجاح");
      } else {
        setAddMemberModalState((prev) => ({
          ...prev,
          error: res?.data?.message || "فشل إضافة العضو",
        }));
      }
    } catch (err) {
      setAddMemberModalState((prev) => ({
        ...prev,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "حدث خطأ أثناء إضافة العضو",
      }));
    } finally {
      setAddMemberModalState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const canAddMember = () => {
    if (!cardModalState.card) return false;

    // التحقق من حالة الدفع
    const paymentStatusRaw =
      cardModalState.card.paymentStatus ||
      cardModalState.card.PaymentStatus ||
      "";
    const paymentStatus = String(paymentStatusRaw).toLowerCase().trim();

    // يجب أن تكون حالة الدفع Paid
    if (paymentStatus !== "paid") {
      return false;
    }

    // الحصول على الحد الأقصى من الباقة الأصلية
    const subscriptionPlanId = cardModalState.card.subscriptionPlanId;
    const plan = plans.find((p) => p.id === subscriptionPlanId);
    const maxMembers = plan?.numberOfMembers || 0;

    // عدد الأعضاء الحالي
    const currentMembers = cardModalState.card.members?.length || 0;

    // يجب أن يكون عدد الأعضاء الحالي أقل من الحد الأقصى
    return currentMembers < maxMembers;
  };

  const renderModalContent = () => {
    if (!modalState.plan) return null;

    return (
      <FamilyCardForm
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
            باقة كارت الصحة العائلية
          </h2>
          <p className="text-gray-600 text-lg">
            اختر الباقة الأنسب واملأ بيانات العائلة بسهولة
          </p>
        </div>

        <div className="grid gap-8">
          {healthPlans.map((plan) => (
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
                  <div className="flex items-center gap-3 text-second font-semibold">
                    <FiUsers className="w-6 h-6" />
                    <span>عدد الأفراد المسموح به: {plan.numberOfMembers}</span>
                  </div>
                  <span className="text-3xl font-bold text-primary">
                    {plan.priceInYear?.toLocaleString("ar-EG")} ج.م / سنة
                  </span>
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

        <div className="mt-12 text-center">
          <button
            onClick={openCardModal}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-2xl hover:bg-second transition-all duration-300"
          >
            <FiCreditCard className="w-5 h-5" />
            <span>عرض بيانات الكارت</span>
          </button>
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
        isOpen={cardModalState.isOpen}
        onRequestClose={closeCardModal}
        className="max-w-6xl w-[1000px] mx-auto mt-20 bg-white rounded-3xl outline-none shadow-2xl overflow-auto max-h-[85vh]"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
        closeTimeoutMS={0}
      >
        <div className="flex justify-end p-4 border-b border-gray-100">
          <button
            onClick={closeCardModal}
            className="text-gray-500 hover:text-second font-semibold"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right">
            بيانات كارت الصحة
          </h2>
          {cardModalState.loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : cardModalState.error ? (
            <div className="bg-red-50 text-red-700 px-6 py-4 rounded-2xl text-right">
              <p>{cardModalState.error}</p>
            </div>
          ) : cardModalState.card ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusClasses(
                    cardModalState.card.paymentStatus ||
                      cardModalState.card.PaymentStatus
                  )}`}
                >
                  حالة الدفع:{" "}
                  {cardModalState.card.paymentStatus ||
                    cardModalState.card.PaymentStatus ||
                    "-"}
                </span>
                {cardModalState.card.deliveryStatus && (
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${deliveryStatusClasses(
                      cardModalState.card.deliveryStatus
                    )}`}
                  >
                    حالة الشحن:{" "}
                    {deliveryStatusText(cardModalState.card.deliveryStatus)}
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-right">
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      رقم الكارت:
                    </span>
                    <p className="text-gray-900 font-bold text-lg">
                      {cardModalState.card.cardNumber || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      تاريخ الانتهاء:
                    </span>
                    <p className="text-gray-900 font-bold">
                      {cardModalState.card.expirationDate || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      اسم مقدم الطلب:
                    </span>
                    <p className="text-gray-900 font-bold">
                      {cardModalState.card.userName || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      النوع:
                    </span>
                    <p className="text-gray-900">
                      {cardModalState.card.gender === "Male" ? "ذكر" : "أنثى"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      تاريخ الميلاد:
                    </span>
                    <p className="text-gray-900">
                      {cardModalState.card.birthDate || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      الرقم القومي:
                    </span>
                    <p className="text-gray-900">
                      {cardModalState.card.nationalId || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      اسم الباقة:
                    </span>
                    <p className="text-gray-900">
                      {cardModalState.card.planName || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-semibold">
                      عدد الأفراد المسموح:
                    </span>
                    <p className="text-gray-900">
                      {(() => {
                        const subscriptionPlanId =
                          cardModalState.card.subscriptionPlanId;
                        const plan = plans.find(
                          (p) => p.id === subscriptionPlanId
                        );
                        return plan?.numberOfMembers || "-";
                      })()}
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 text-right">
                      أفراد العائلة ({cardModalState.card.members?.length || 0}{" "}
                      /{" "}
                      {(() => {
                        const subscriptionPlanId =
                          cardModalState.card.subscriptionPlanId;
                        const plan = plans.find(
                          (p) => p.id === subscriptionPlanId
                        );
                        return plan?.numberOfMembers || 0;
                      })()}
                      )
                    </h3>
                    <div className="flex items-center gap-2">
                      {canAddMember() && (
                        <button
                          onClick={openAddMemberModal}
                          className="inline-flex items-center gap-2 bg-second text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-primary transition"
                        >
                          <FiPlus className="w-4 h-4" />
                          <span>إضافة عضو جديد</span>
                        </button>
                      )}
                    </div>
                  </div>
                  {cardModalState.card.members?.length > 0 ? (
                    <div className="space-y-4">
                      {cardModalState.card.members.map((member, idx) => (
                        <div
                          key={member.id || idx}
                          className="bg-white rounded-xl p-4 border border-gray-200"
                        >
                          <div className="grid md:grid-cols-2 gap-4 text-right">
                            <div>
                              <span className="text-sm text-gray-600 font-semibold">
                                الاسم:
                              </span>
                              <p className="text-gray-900 font-bold">
                                {member.memberName || "-"}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-semibold">
                                النوع:
                              </span>
                              <p className="text-gray-900">
                                {member.gender === "Male" ? "ذكر" : "أنثى"}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-semibold">
                                صلة القرابة:
                              </span>
                              <p className="text-gray-900">
                                {member.relationship || "-"}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-semibold">
                                تاريخ الميلاد:
                              </span>
                              <p className="text-gray-900">
                                {member.birthDate || "-"}
                              </p>
                            </div>
                            {member.nationalId && (
                              <div>
                                <span className="text-sm text-gray-600 font-semibold">
                                  الرقم القومي:
                                </span>
                                <p className="text-gray-900">
                                  {member.nationalId}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-right">
                      لا يوجد أفراد مسجلين بعد
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p>لا توجد بيانات للكارت بعد.</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={addMemberModalState.isOpen}
        onRequestClose={closeAddMemberModal}
        className="max-w-2xl mx-auto mt-20 bg-white rounded-3xl outline-none shadow-2xl overflow-auto max-h-[85vh]"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
        closeTimeoutMS={0}
      >
        <div className="flex justify-end p-4 border-b border-gray-100">
          <button
            onClick={closeAddMemberModal}
            className="text-gray-500 hover:text-second font-semibold"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right">
            إضافة عضو جديد
          </h2>
          {addMemberModalState.error && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-2xl text-right">
              {addMemberModalState.error}
            </div>
          )}
          <form onSubmit={handleAddMemberSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 text-right">
                  اسم العضو <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="memberName"
                  value={newMemberForm.memberName}
                  onChange={handleAddMemberChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-right focus:ring-2 focus:ring-second focus:outline-none"
                  placeholder="أدخل اسم العضو"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 text-right">
                  النوع <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={newMemberForm.gender}
                  onChange={handleAddMemberChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-right focus:ring-2 focus:ring-second focus:outline-none"
                >
                  <option value="Male">ذكر</option>
                  <option value="Female">أنثى</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 text-right">
                  صلة القرابة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="relationship"
                  value={newMemberForm.relationship}
                  onChange={handleAddMemberChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-right focus:ring-2 focus:ring-second focus:outline-none"
                  placeholder="مثال: ابن، ابنة، زوجة"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 text-right">
                  تاريخ الميلاد <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={newMemberForm.birthDate}
                  onChange={handleAddMemberChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-right focus:ring-2 focus:ring-second focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 text-right">
                  الرقم القومي (اختياري)
                </label>
                <input
                  type="text"
                  name="nationalId"
                  value={newMemberForm.nationalId}
                  onChange={handleAddMemberChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-right focus:ring-2 focus:ring-second focus:outline-none"
                  placeholder="مثال: 12345678901234"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={addMemberModalState.submitting}
                className="flex-1 inline-flex justify-center items-center gap-2 bg-second text-white font-semibold py-3 rounded-2xl hover:bg-primary transition disabled:opacity-70"
              >
                {addMemberModalState.submitting && (
                  <FiLoader className="w-5 h-5 animate-spin" />
                )}
                <span>إضافة العضو</span>
              </button>
              <button
                type="button"
                onClick={closeAddMemberModal}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:border-second hover:text-second transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </section>
  );
};

export default SubscriptionFamilyPlans;
