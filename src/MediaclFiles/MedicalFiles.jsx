import React, { useEffect, useMemo, useState, useContext } from "react";
import baseApi from "../api/baseApi";
import AddRecordModal from "../Components/AddRecordModal";
import RecordsViewModal from "../Components/RecordsViewModal";
import { AuthContext } from "../Context/AuthContext";

const enums = {
  paymentType: [
    { value: "Cash", label: "كاش" },
    { value: "Visa", label: "فيزا" },
  ],
  sight: [
    { value: "Good", label: "جيد" },
    { value: "VeryGood", label: "جيد جدًا" },
    { value: "Bad", label: "ضعيف" },
    { value: "Excellent", label: "ممتاز" },
  ],
  hearing: [
    { value: "Good", label: "جيد" },
    { value: "VeryGood", label: "جيد جدًا" },
    { value: "Bad", label: "ضعيف" },
    { value: "Excellent", label: "ممتاز" },
  ],
  bloodTypes: [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ],
  disease: [
    { value: "None", label: "لا يوجد" },
    { value: "Low", label: "منخفض" },
    { value: "High", label: "مرتفع" },
  ],
};

// Keys to hide from the summary table
const hiddenKeys = new Set([
  "id",
  "Id",
  "userId",
  "UserId",
  "medicalFileId",
  "MedicalFileId",
  "paymentType",
  "PaymentType",
  "paymentStatus",
  "PaymentStatus",
]);

// Arabic labels for user file fields shown in the summary table
const fieldLabels = {
  id: "رقم الملف",
  fileId: "رقم الملف",
  FileId: "رقم الملف",
  userName: "الاسم",
  userPhone: "الهاتف",
  userEmail: "البريد الإلكتروني",
  nationalId: "الرقم القومي",
  jobTitle: "الوظيفة",
  paymentStatus: "الحالة",
  paymentType: "طريقة الدفع",
  userTall: "الطول",
  userWeight: "الوزن",
  bloodType: "فصيلة الدم",
  userSight: "النظر",
  userHearing: "السمع",
  bloodPressure: "ضغط الدم",
  diabetes: "السكر",
  otherDiseases: "أمراض أخرى",
  createdAt: "تاريخ الإنشاء",
  updatedAt: "تاريخ التحديث",
};

// Helpers to localize enum values in the summary table
const enumLabel = (list, v) => {
  if (!list) return v;
  const target = String(v ?? "").toLowerCase();
  const hit = list.find((o) => String(o.value).toLowerCase() === target);
  return hit ? hit.label : v;
};
const toArabicValue = (key, val) => {
  const k = String(key || "").toLowerCase();
  switch (k) {
    case "paymenttype":
    case "payment":
    case "paymentmethod":
      return enumLabel(enums.paymentType, val);
    case "usersight":
      return enumLabel(enums.sight, val);
    case "userhearing":
      return enumLabel(enums.hearing, val);
    case "bloodpressure":
    case "diabetes":
      return enumLabel(enums.disease, val);
    case "usertall":
      return val ? `${val} سم` : val;
    case "userweight":
      return val ? `${val} كجم` : val;
    default:
      return val;
  }
};

const MedicalFiles = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [userFile, setUserFile] = useState(null);
  const [types, setTypes] = useState([]);
  const [addModal, setAddModal] = useState({ open: false, typeId: null });
  const [viewModal, setViewModal] = useState({ open: false, typeId: null });
  const [serverMessage, setServerMessage] = useState("");
  const isActivated = useMemo(() => {
    const s = (userFile?.paymentStatus || userFile?.PaymentStatus || "")
      .toString()
      .toLowerCase();
    return s === "paid";
  }, [userFile]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await baseApi.get("/MedicalRecordTypes");
        if (res.data?.success) setTypes(res.data.data || []);
      } catch (err) {
        console.error("Failed to load record types", err);
        setTypes([]);
      }
    };
    fetchTypes();
  }, []);

  // اجلب بيانات المستخدم فقط عند وجود جلسة مصادقة أو تبديل الحساب
  const userId = user?.id || user?.email;
  useEffect(() => {
    // Reset all state when user changes
    setUserFile(null);
    setServerMessage("");

    if (!isAuthenticated) {
      return;
    }
    (async () => {
      await fetchUserFile();
    })();
  }, [isAuthenticated, userId]);

  const fetchUserFile = async () => {
    try {
      const res = await baseApi.get("/MedicalFiles/user", {
        validateStatus: () => true,
      });

      // Handle explicit Not Found first => new user
      if (res.status === 404 || res.data?.statusCode === 404) {
        setUserFile(null);
        setServerMessage("");
        return;
      }

      // Success with data => show user file
      if (res.data?.success) {
        const data = res.data.data;
        setUserFile(data);
        setServerMessage("");
        return;
      }

      // Not activated or other backend message => show message
      const statusCode = res.data?.statusCode || res.status;
      const msg = res?.data?.message || "الخدمة غير مفعلة بعد";

      // If statusCode is 400, we might have partial data
      if (statusCode === 400 && res.data?.data) {
        setUserFile(res.data.data);
      } else {
        setUserFile(null);
      }
      setServerMessage(msg);
    } catch (e) {
      setUserFile(null);
      const msg =
        e?.response?.data?.message || e?.message || "تعذر جلب البيانات";
      setServerMessage(msg);
      console.error(e);
    }
  };

  return (
    <section className="py-12 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-6">الملف الطبي</h1>

        {userFile && (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">بياناتك</h3>
              {serverMessage && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3">
                  {serverMessage}
                </div>
              )}
              <table className="min-w-full text-right">
                <tbody className="text-sm text-gray-700">
                  {Object.entries(userFile)
                    .filter(([k]) => !hiddenKeys.has(k))
                    .map(([k, v]) => (
                      <tr
                        key={k}
                        className="border-b border-gray-300 last:border-b-0"
                      >
                        <td className="py-2 font-medium">
                          {fieldLabels[k] ?? k}
                        </td>
                        <td className="py-2">
                          {String(toArabicValue(k, v ?? "-"))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {isActivated && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">أنواع السجلات الطبية</h3>
                  <button
                    onClick={() => setViewModal({ open: true, typeId: null })}
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 flex items-center gap-2"
                  >
                    عرض الجميع
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {types.map((t) => (
                    <div
                      key={t.id}
                      className="border border-gray-300 rounded-lg p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-second font-bold mb-1">
                          {t.name}
                        </div>
                        <p className="text-gray-500 text-sm">
                          إدارة السجلات الخاصة بهذا النوع
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() =>
                            setAddModal({ open: true, typeId: t.id })
                          }
                          className="bg-second text-white px-3 py-1 rounded"
                        >
                          إضافة جديد
                        </button>
                        <button
                          onClick={() =>
                            setViewModal({ open: true, typeId: t.id })
                          }
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded"
                        >
                          عرض السجلات
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!userFile && isAuthenticated && serverMessage && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">بياناتك</h3>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3 mb-4">
              {serverMessage}
            </div>
            <p className="text-gray-600 text-center">لا توجد بيانات حالياً</p>
          </div>
        )}

        {!userFile && isAuthenticated && !serverMessage && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-600">
              لا توجد بيانات للملف الطبي. يرجى الاشتراك في إحدى الباقات أولاً.
            </p>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-600">
              يرجى تسجيل الدخول لعرض بيانات الملف الطبي.
            </p>
          </div>
        )}
      </div>
      {/* Modals */}
      <AddRecordModal
        isOpen={addModal.open}
        onClose={(ok) => {
          setAddModal({ open: false, typeId: null });
          if (ok) {
            /* could refresh */
          }
        }}
        fileId={userFile?.id}
        recordTypeId={addModal.typeId}
        recordTypeName={types.find((t) => t.id === addModal.typeId)?.name}
      />
      <RecordsViewModal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, typeId: null })}
        fileId={userFile?.id}
        recordTypeId={viewModal.typeId}
        recordTypeName={types.find((t) => t.id === viewModal.typeId)?.name}
      />
    </section>
  );
};

export default MedicalFiles;
