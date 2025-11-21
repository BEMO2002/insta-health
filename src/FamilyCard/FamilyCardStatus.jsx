import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import baseApi from "../api/baseApi";

const statusClasses = (status) => {
  const val = (status || "").toString().toLowerCase();
  if (val === "paid") return "bg-green-100 text-green-700";
  if (val === "failed" || val === "cancelled") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

const FamilyCardStatus = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState(null);
  const [cardNumber, setCardNumber] = useState(null);

  const fetchCard = async () => {
    try {
      setLoading(true);
      setError("");
      setErrorCode(null);
      setCardNumber(null);
      const res = await baseApi.get("/HealthCards/user-card", {
        validateStatus: () => true,
      });
      if (res.data?.success) {
        setCard(res.data.data || null);
        setCardNumber(res.data.data?.cardNumber || null);
      } else {
        // الأولوية لـ statusCode من res.data.statusCode
        const statusCode = res.data?.statusCode || res.status;
        const message = res?.data?.message || "تعذر تحميل بيانات الكارت.";
        const cardNum =
          res.data?.data?.cardNumber || res.data?.cardNumber || null;
        setError(message);
        setErrorCode(statusCode);
        setCardNumber(cardNum);
        setCard(null);
      }
    } catch (err) {
      const statusCode =
        err?.response?.status || err?.response?.data?.statusCode;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "تعذر تحميل بيانات الكارت.";
      const cardNum =
        err?.response?.data?.data?.cardNumber ||
        err?.response?.data?.cardNumber ||
        null;
      setError(message);
      setErrorCode(statusCode);
      setCardNumber(cardNum);
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (paymentType) => {
    if (!cardNumber) {
      toast.error("رقم الكارت غير متوفر");
      return;
    }

    try {
      const payload = {
        cardNumber: cardNumber,
        paymentType: paymentType,
      };

      if (paymentType === "Visa") {
        payload.clientUrl = `${window.location.origin}/family-card/status`;
      }

      const res = await baseApi.post(
        "/Subscriptions/renew-medicalcard",
        payload,
        {
          validateStatus: () => true,
        }
      );

      if (res.data?.success) {
        if (paymentType === "Visa" && res.data?.data?.sessionUrl) {
          window.location.href = res.data.data.sessionUrl;
          return;
        }
        toast.success("تم تجديد الاشتراك بنجاح");
        // إعادة تحميل بيانات الكارت
        await fetchCard();
      } else {
        toast.error(res?.data?.message || "فشل تجديد الاشتراك");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "حدث خطأ أثناء تجديد الاشتراك"
      );
    }
  };

  useEffect(() => {
    fetchCard();
  }, []);

  useEffect(() => {
    const status = (card?.paymentStatus || card?.PaymentStatus || "")
      .toString()
      .toLowerCase();
    if (!card || status !== "pending") return undefined;
    const id = setInterval(fetchCard, 5000);
    return () => clearInterval(id);
  }, [card]);

  const infoRows = [
    { label: "الاسم", value: card?.userName },
    { label: "النوع", value: card?.gender === "Male" ? "ذكر" : "أنثى" },
    { label: "طريقة الدفع", value: card?.paymentType },
    { label: "حالة الدفع", value: card?.paymentStatus || card?.PaymentStatus },
    { label: "رقم الطلب", value: card?.id },
    { label: "الباقة", value: card?.planName },
    { label: "عدد الأفراد", value: card?.cardMembers?.length },
    { label: "تاريخ الإنشاء", value: card?.createdAt },
  ];

  return (
    <section className="py-16 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-3xl shadow p-6 md:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">
                متابعة دفع كارت الصحة
              </h1>
              <p className="text-gray-600">
                يمكنك العودة لتعديل البيانات أو متابعة حالة الدفع في أي وقت.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/family-card"
                className="px-4 py-2 rounded-2xl border border-gray-200 text-gray-700 hover:border-second hover:text-second transition"
              >
                الرجوع إلى الباقات
              </Link>
              <button
                onClick={fetchCard}
                className="px-4 py-2 rounded-2xl bg-second text-white hover:bg-primary transition"
              >
                تحديث الحالة
              </button>
            </div>
          </div>

          {card && (
            <span
              className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusClasses(
                card.paymentStatus || card.PaymentStatus
              )}`}
            >
              حالة الدفع: {card.paymentStatus || card.PaymentStatus || "-"}
            </span>
          )}

          {loading ? (
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          ) : error ? (
            <div className="space-y-4">
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl">
                {error}
              </div>
              {/* زر التجديد عند 401 expired */}
              {errorCode === 401 &&
                cardNumber &&
                (error?.toLowerCase().includes("expired") ||
                  error?.toLowerCase().includes("منتهي") ||
                  error?.toLowerCase().includes("انتهت") ||
                  error?.toLowerCase().includes("انتهاء") ||
                  error?.toLowerCase().includes("تجديد")) && (
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
              {/* زر دفع فيزا عند 400 - الملف مش متفعل */}
              {errorCode === 400 && cardNumber && (
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
          ) : card ? (
            <>
              <div className="overflow-auto border border-gray-100 rounded-2xl">
                <table className="min-w-full text-right">
                  <tbody className="text-gray-700 text-sm">
                    {infoRows.map(
                      (row) =>
                        row.value && (
                          <tr
                            key={row.label}
                            className="border-b border-gray-100"
                          >
                            <td className="py-3 px-4 font-semibold">
                              {row.label}
                            </td>
                            <td className="py-3 px-4">{row.value}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900">
                  أفراد العائلة
                </h2>
                {card.cardMembers?.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {card.cardMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-100 rounded-2xl p-4 bg-gray-50 space-y-1"
                      >
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>فرد #{idx + 1}</span>
                          <span>{member.relationship || "-"}</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {member.memberName}
                        </p>
                        <p className="text-sm text-gray-600">
                          النوع: {member.gender === "Male" ? "ذكر" : "أنثى"}
                        </p>
                        <p className="text-sm text-gray-600">
                          تاريخ الميلاد: {member.birthDate || "-"}
                        </p>
                        {member.nationalId && (
                          <p className="text-sm text-gray-600">
                            الرقم القومي: {member.nationalId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    لم يتم تسجيل أفراد حتى الآن.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-600">
              لا توجد بيانات للاشتراك حتى الآن. يمكنك العودة لطلب كارت جديد.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FamilyCardStatus;
