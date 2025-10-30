import React, { useEffect, useMemo, useState, useContext } from "react";
import { toast } from "react-toastify";
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

const translateMessage = (msg) => {
  const key = String(msg || "").trim().toLowerCase();
  const map = {
    "your medical file service hasn't been activated yet": "خدمة الملف الطبي لم يتم تفعيلها بعد  برجاء الانتظار والمتابعه سوف يتم التواصل معك قريبا.....وشكرا لتفهمك",
    "bad request": "طلب غير صالح",
    "unauthorized": "غير مصرح",
    "forbidden": "غير مسموح",
    "not found": "غير موجود",
    "internal server error": "خطأ داخلي في الخادم",
  };
  return map[key] || msg || "حدث خطأ غير متوقع";
};

const initialForm = {
  userName: "",
  userPhone: "",
  userEmail: "",
  nationalId: "",
  jobTitle: "",
  paymentStatus: "",
  userTall: "",
  userWeight: "",
  bloodType: "",
  userSight: "",
  userHearing: "",
  bloodPressure: "",
  diabetes: "",
  otherDiseases: "",
};

const MedicalFiles = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [showInstructions, setShowInstructions] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userFile, setUserFile] = useState(null);
  const [types, setTypes] = useState([]);
  const [addModal, setAddModal] = useState({ open: false, typeId: null });
  const [viewModal, setViewModal] = useState({ open: false, typeId: null });
  const [serverMessage, setServerMessage] = useState("");

  const canSubmit = useMemo(() => {
    return (
      form.userName && form.userPhone && form.userEmail && form.paymentType
    );
  }, [form]);

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

  // اجلب بيانات المستخدم فقط عند وجود جلسة مصادقة
  useEffect(() => {
    if (!isAuthenticated) {
      setUserFile(null);
      setSubmitted(false);
      return;
    }
    (async () => {
      await fetchUserFile();
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (userFile) setSubmitted(true);
  }, [userFile]);

  const fetchUserFile = async () => {
    try {
      const res = await baseApi.get("/MedicalFiles/user", { validateStatus: () => true });
      if (res.data?.success) {
        setUserFile(res.data.data || null);
        return;
      }
      // Not activated or other backend message
      const msg = res?.data?.message || "الخدمة غير مفعلة بعد";
      setUserFile(null);
      setServerMessage(translateMessage(msg));
      setSubmitted(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "تعذر جلب البيانات";
      setUserFile(null);
      setServerMessage(translateMessage(msg));
      setSubmitted(true);
      console.error(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        ...(form.paymentType === "Visa"
          ? { clientUrl: `${window.location.origin}/medical-file/success` }
          : {}),
      };
      const res = await baseApi.post("/MedicalFiles", payload, {
        validateStatus: () => true,
      });

      if (res.data?.success) {
        if (form.paymentType === "Visa" && res.data?.data?.sessionUrl) {
          window.location.href = res.data.data.sessionUrl;
          return;
        }
        toast.success(
          res.data?.message || "تم إرسال البيانات وسيتم التواصل معك"
        );
        setSubmitted(true);
        await fetchUserFile();
        return;
      }

      const msg = res?.data?.message || "تعذر إرسال البيانات";
      setServerMessage(translateMessage(msg));
      toast.warning(msg);
      console.error("MedicalFiles submit status:", res.status, res.data);
      setSubmitted(true);
      return;
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "تعذر إرسال البيانات";
      setServerMessage(translateMessage(msg));
      toast.error(msg);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-6">الملف الطبي</h1>

        {showInstructions && !submitted && (
          <div className="bg-white rounded-xl shadow p-5 mb-6">
            <h3 className="text-xl font-bold text-second mb-2">تعليمات هامة</h3>
            <p className="text-gray-600 mb-3">
              برجاء ملء بيانات الكارت الذكي بعناية لضمان الدقة. اختر وسيلة الدفع
              المناسبة، وفي حالة اختيار فيزا سيتم تحويلك لبوابة الدفع.
            </p>
            <button
              onClick={() => setShowInstructions(false)}
              className="bg-second text-white px-4 py-2 rounded"
            >
              فهمت
            </button>
          </div>
        )}

        {!submitted && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {serverMessage && (
              <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3">
                {serverMessage}
              </div>
            )}
            <Input
              label="الاسم"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              required
            />
            <Input
              label="الهاتف"
              name="userPhone"
              value={form.userPhone}
              onChange={handleChange}
              required
            />
            <Input
              label="البريد الإلكتروني"
              name="userEmail"
              value={form.userEmail}
              onChange={handleChange}
              required
            />
            <Input
              label="الرقم القومي"
              name="nationalId"
              value={form.nationalId}
              onChange={handleChange}
            />
            <Input
              label="الوظيفة"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
            />

            <Select
              label="طريقة الدفع"
              name="paymentType"
              value={form.paymentType}
              onChange={handleChange}
              options={enums.paymentType}
            />

            <Input
              label="الطول (سم)"
              name="userTall"
              value={form.userTall}
              onChange={handleChange}
            />
            <Input
              label="الوزن (كجم)"
              name="userWeight"
              value={form.userWeight}
              onChange={handleChange}
            />
            <Select
              label="فصيلة الدم"
              name="bloodType"
              value={form.bloodType}
              onChange={handleChange}
              options={enums.bloodTypes}
            />

            <Select
              label="النظر"
              name="userSight"
              value={form.userSight}
              onChange={handleChange}
              options={enums.sight}
            />
            <Select
              label="السمع"
              name="userHearing"
              value={form.userHearing}
              onChange={handleChange}
              options={enums.hearing}
            />
            <Select
              label="ضغط الدم"
              name="bloodPressure"
              value={form.bloodPressure}
              onChange={handleChange}
              options={enums.disease}
            />
            <Select
              label="السكر"
              name="diabetes"
              value={form.diabetes}
              onChange={handleChange}
              options={enums.disease}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                أمراض أخرى
              </label>
              <textarea
                name="otherDiseases"
                value={form.otherDiseases}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded p-3"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="bg-second text-white px-6 py-2 rounded disabled:opacity-50"
              >
                {submitting ? "جاري الإرسال..." : "إرسال"}
              </button>
            </div>
          </form>
        )}

        {submitted && (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">بياناتك</h3>
              {serverMessage && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3">
                  {serverMessage}
                </div>
              )}
              {userFile ? (
                <table className="min-w-full text-right">
                  <tbody className="text-sm text-gray-700">
                    {Object.entries(userFile)
                      .filter(([k]) => !hiddenKeys.has(k))
                      .map(([k, v]) => (
                      <tr
                        key={k}
                        className="border-b border-gray-300 last:border-b-0  "
                      >
                        <td className="py-2 font-medium">{fieldLabels[k] ?? k}</td>
                        <td className="py-2">{String(toArabicValue(k, v ?? "-"))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">لا توجد بيانات حالياً</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-bold mb-4">أنواع السجلات الطبية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {types.map((t) => (
                  <div
                    key={t.id}
                    className="border border-gray-300 rounded-lg p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-second font-bold mb-1">{t.name}</div>
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
          </>
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
      />
    </section>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input {...props} className="w-full border border-gray-300 rounded p-3" />
  </div>
);

const Select = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded p-3 bg-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export default MedicalFiles;