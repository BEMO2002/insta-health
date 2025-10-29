import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import baseApi from "../api/baseApi";
import AddRecordModal from "../Components/AddRecordModal";
import RecordsViewModal from "../Components/RecordsViewModal";

const enums = {
  paymentType: [
    { value: "Cash", label: "كاش" },
    { value: "Visa", label: "فيزا" },
  ],
  sight: [
    { value: "Good", label: "جيد" },
    { value: "VeryGood", label: "جيد جدًا" },
    { value: "Bad", label: "سيء" },
    { value: "Excellent", label: "ممتاز" },
  ],
  hearing: [
    { value: "Good", label: "جيد" },
    { value: "VeryGood", label: "جيد جدًا" },
    { value: "Bad", label: "سيء" },
    { value: "Excellent", label: "ممتاز" },
  ],
  disease: [
    { value: "None", label: "لا يوجد" },
    { value: "Low", label: "منخفض" },
    { value: "High", label: "مرتفع" },
  ],
};

const initialForm = {
  userName: "",
  userPhone: "",
  userEmail: "",
  jobTitle: "",
  paymentType: "Cash",
  userTall: "",
  userWeight: "",
  bloodType: "",
  userSight: "Good",
  userHearing: "Good",
  bloodPressure: "None",
  diabetes: "None",
  otherDiseases: "",
};

const MedicalFiles = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userFile, setUserFile] = useState(null);
  const [types, setTypes] = useState([]);
  const [addModal, setAddModal] = useState({ open: false, typeId: null });
  const [viewModal, setViewModal] = useState({ open: false, typeId: null });

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

  // اجلب بيانات المستخدم فور الدخول حتى بعد الريفريش
  useEffect(() => {
    (async () => {
      await fetchUserFile();
    })();
  }, []);

  useEffect(() => {
    if (userFile) setSubmitted(true);
  }, [userFile]);

  const fetchUserFile = async () => {
    try {
      const res = await baseApi.get("/MedicalFiles/user");
      if (res.data?.success) setUserFile(res.data.data || null);
    } catch (e) {
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

      console.error("MedicalFiles submit status:", res.status, res.data);
      throw new Error(res.data?.message || "Bad Request");
    } catch (err) {
      console.error(err);
      toast.error("تعذر إرسال البيانات");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-6">الملف الطبي</h1>

        {showInstructions && (
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
              label="الطول"
              name="userTall"
              value={form.userTall}
              onChange={handleChange}
            />
            <Input
              label="الوزن"
              name="userWeight"
              value={form.userWeight}
              onChange={handleChange}
            />
            <Input
              label="فصيلة الدم"
              name="bloodType"
              value={form.bloodType}
              onChange={handleChange}
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
              {userFile ? (
                <table className="min-w-full text-right">
                  <tbody className="text-sm text-gray-700">
                    {Object.entries(userFile).map(([k, v]) => (
                      <tr
                        key={k}
                        className="border-b border-gray-300 last:border-b-0  "
                      >
                        <td className="py-2 font-medium">{k}</td>
                        <td className="py-2">{String(v)}</td>
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
