import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import baseApi from "../api/baseApi";

const MedicalFileStatus = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await baseApi.get("/MedicalFiles/user", {
          validateStatus: () => true,
        });
        if (res.data?.success) setFile(res.data.data || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Poll if pending
  useEffect(() => {
    const status = (file?.paymentStatus || file?.PaymentStatus || "")
      .toString()
      .toLowerCase();
    if (!file || status !== "pending") return;
    const id = setInterval(async () => {
      try {
        const res = await baseApi.get("/MedicalFiles/user", {
          validateStatus: () => true,
        });
        if (res.data?.success) setFile(res.data.data || null);
      } catch {}
    }, 5000);
    return () => clearInterval(id);
  }, [file]);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <section className="py-16 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold text-primary mb-2">
            طلب الكارت الطبي
          </h1>
          {file && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm mb-3 ${(() => {
                const s = (file.paymentStatus || file.PaymentStatus || "")
                  .toString()
                  .toLowerCase();
                if (s === "paid") return "bg-green-100 text-green-700";
                if (s === "failed" || s === "cancelled")
                  return "bg-red-100 text-red-700";
                return "bg-yellow-100 text-yellow-700";
              })()}`}
            >
              حالة الدفع: {file.paymentStatus || file.PaymentStatus || "-"}
            </span>
          )}
          <p className="text-gray-600 mb-4">
            هذا رابط صفحة الكارت الطبي، يمكنك مشاركته أو حفظه:
          </p>
          <div className="bg-gray-100 rounded p-3 break-all mb-4">
            {currentUrl}
          </div>
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => navigator.clipboard.writeText(currentUrl)}
              className="px-4 py-2 bg-second text-white rounded"
            >
              نسخ الرابط
            </button>
            <Link to="/medical-file" className="px-4 py-2 bg-gray-200 rounded">
              الذهاب إلى الملف الطبي
            </Link>
          </div>

          {loading ? (
            <div className="text-gray-600">جاري التحميل...</div>
          ) : file ? (
            <div className="overflow-auto">
              <table className="min-w-full text-right">
                <tbody className="text-sm text-gray-700">
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">الاسم</td>
                    <td className="py-2">{file.userName || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">الهاتف</td>
                    <td className="py-2">{file.userPhone || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">البريد</td>
                    <td className="py-2">{file.userEmail || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">الوظيفة</td>
                    <td className="py-2">{file.jobTitle || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">فصيلة الدم</td>
                    <td className="py-2">{file.bloodType || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">الطول</td>
                    <td className="py-2">{file.userTall || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">الوزن</td>
                    <td className="py-2">{file.userWeight || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">النظر</td>
                    <td className="py-2">{file.userSight || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">السمع</td>
                    <td className="py-2">{file.userHearing || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">السكر</td>
                    <td className="py-2">{file.diabetes || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">الضغط</td>
                    <td className="py-2">{file.bloodPressure || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300   ">
                    <td className="py-2 font-medium">أمراض أخرى</td>
                    <td className="py-2">{file.otherDiseases || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">رقم الملف</td>
                    <td className="py-2">{file.fileId || file.id || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium">حالة الدفع</td>
                    <td className="py-2">
                      {file.paymentStatus || file.PaymentStatus || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">لا توجد بيانات للملف بعد.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default MedicalFileStatus;
