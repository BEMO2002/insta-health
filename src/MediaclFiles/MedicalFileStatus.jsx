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

const MedicalFileStatus = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState(null);
  const [cardNumber, setCardNumber] = useState(null);

  const fetchFile = async () => {
    try {
      setLoading(true);
      setError("");
      setErrorCode(null);
      setCardNumber(null);
      const res = await baseApi.get("/MedicalFiles/user", {
        validateStatus: () => true,
      });
      if (res.data?.success) {
        setFile(res.data.data || null);
        setCardNumber(
          res.data.data?.cardNumber || res.data.data?.fileId || null
        );
      } else {
        const statusCode = res.data?.statusCode || res.status;
        const message = res?.data?.message || "تعذر تحميل بيانات الملف.";
        const cardNum =
          res.data?.data?.cardNumber ||
          res.data?.data?.fileId ||
          res.data?.cardNumber ||
          null;
        setError(message);
        setErrorCode(statusCode);
        setCardNumber(cardNum);
        setFile(null);
      }
    } catch (err) {
      const statusCode =
        err?.response?.status || err?.response?.data?.statusCode;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "تعذر تحميل بيانات الملف.";
      const cardNum =
        err?.response?.data?.data?.cardNumber ||
        err?.response?.data?.data?.fileId ||
        err?.response?.data?.cardNumber ||
        null;
      setError(message);
      setErrorCode(statusCode);
      setCardNumber(cardNum);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (paymentType) => {
    if (!cardNumber) {
      toast.error("رقم الملف غير متوفر");
      return;
    }

    try {
      const payload = {
        cardNumber: cardNumber,
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
        }
      );

      if (res.data?.success) {
        if (paymentType === "Visa" && res.data?.data?.sessionUrl) {
          window.location.href = res.data.data.sessionUrl;
          return;
        }
        toast.success(
          "تم تنفيذ طلبك بنجاح وسيتم التواصل معك قريباً من أحد ممثلي الخدمة لإتمام الدفع والتجديد"
        );
        await fetchFile();
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
    fetchFile();
  }, []);

  // Poll if pending
  useEffect(() => {
    const status = (file?.paymentStatus || file?.PaymentStatus || "")
      .toString()
      .toLowerCase();
    if (!file || status !== "pending") return;
    const id = setInterval(fetchFile, 5000);
    return () => clearInterval(id);
  }, [file]);

  return (
    <section className="py-16 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-3xl shadow p-6 md:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">
                متابعة دفع الملف الطبي
              </h1>
              <p className="text-gray-600">
                يمكنك العودة لتعديل البيانات أو متابعة حالة الدفع في أي وقت.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                aria-label="Go to Medical File"
                to="/medical-file"
                className="px-4 py-2 rounded-2xl border border-gray-200 text-gray-700 hover:border-second hover:text-second transition"
              >
                الرجوع إلى الباقات
              </Link>
              <button
                aria-label="Refresh Status"
                onClick={fetchFile}
                className="px-4 py-2 rounded-2xl bg-second text-white hover:bg-primary transition"
              >
                تحديث الحالة
              </button>
            </div>
          </div>

          {file && (
            <span
              className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusClasses(
                file.paymentStatus || file.PaymentStatus
              )}`}
            >
              حالة الدفع: {file.paymentStatus || file.PaymentStatus || "-"}
            </span>
          )}

          {loading ? (
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          ) : error ? (
            <div className="space-y-4">
              <div
                className={`px-4 py-3 rounded-2xl ${
                  errorCode === 400
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {error}
              </div>
              {errorCode === 401 &&
                cardNumber &&
                (error?.toLowerCase().includes("expired") ||
                  error?.toLowerCase().includes("منتهي") ||
                  error?.toLowerCase().includes("انتهت") ||
                  error?.toLowerCase().includes("انتهاء") ||
                  error?.toLowerCase().includes("تجديد")) && (
                  <div className="flex gap-3 justify-center">
                    <button
                      aria-label="Renew Cash"
                      onClick={() => handleRenew("Cash")}
                      className="px-6 py-3 bg-second text-white rounded-2xl font-semibold hover:bg-primary transition"
                    >
                      تجديد نقداً
                    </button>
                    <button
                      aria-label="Renew Visa"
                      onClick={() => handleRenew("Visa")}
                      className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-second transition"
                    >
                      تجديد بفيزا
                    </button>
                  </div>
                )}
              {errorCode === 400 && cardNumber && (
                <div className="flex gap-3 justify-center">
                  <button
                    aria-label="Pay with Visa"
                    onClick={() => handleRenew("Visa")}
                    className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-second transition"
                  >
                    دفع بفيزا لتفعيل الاشتراك
                  </button>
                </div>
              )}
            </div>
          ) : file ? (
            <>
              <div className="overflow-auto border border-gray-100 rounded-2xl">
                <table className="min-w-full text-right">
                  <tbody className="text-gray-700 text-sm">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">الاسم</td>
                      <td className="py-3 px-4">{file.userName || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">الهاتف</td>
                      <td className="py-3 px-4">{file.userPhone || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">البريد</td>
                      <td className="py-3 px-4">{file.userEmail || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">الرقم القومي</td>
                      <td className="py-3 px-4">{file.nationalId || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">الوظيفة</td>
                      <td className="py-3 px-4">{file.jobTitle || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">فصيلة الدم</td>
                      <td className="py-3 px-4">{file.bloodType || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">الطول</td>
                      <td className="py-3 px-4">
                        {file.userTall ? `${file.userTall} سم` : "-"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">الوزن</td>
                      <td className="py-3 px-4">
                        {file.userWeight ? `${file.userWeight} كجم` : "-"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">النظر</td>
                      <td className="py-3 px-4">{file.userSight || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">السمع</td>
                      <td className="py-3 px-4">{file.userHearing || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">السكر</td>
                      <td className="py-3 px-4">{file.diabetes || "-"}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">الضغط</td>
                      <td className="py-3 px-4">{file.bloodPressure || "-"}</td>
                    </tr>
                    {file.otherDiseases && (
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-semibold">أمراض أخرى</td>
                        <td className="py-3 px-4">{file.otherDiseases}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">رقم الملف</td>
                      <td className="py-3 px-4">
                        {file.fileNumber || file.id || "-"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">حالة الدفع</td>
                      <td className="py-3 px-4">
                        {file.paymentStatus || file.PaymentStatus || "-"}
                      </td>
                    </tr>
                    {/* <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">تاريخ الإنشاء</td>
                      <td className="py-3 px-4">
                        {file.createdAt
                          ? new Date(file.createdAt).toLocaleDateString(
                              "ar-EG"
                            ) : "-"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">تاريخ التحديث</td>
                      <td className="py-3 px-4">
                        {file.updatedAt
                          ? new Date(file.updatedAt).toLocaleDateString(
                              "ar-EG"
                            ) : "-"}
                      </td>
                    </tr> */}
                    {file.expirationDate && (
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-semibold">
                          تاريخ الانتهاء
                        </td>
                        <td className="py-3 px-4">
                          {new Date(file.expirationDate).toLocaleDateString(
                            "ar-EG"
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-gray-600">
              لا توجد بيانات للاشتراك حتى الآن. يمكنك العودة لطلب ملف جديد.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default MedicalFileStatus;
