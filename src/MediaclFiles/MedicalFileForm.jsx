import React, { useState } from "react";
import { FiLoader, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import baseApi from "../api/baseApi";

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

const MedicalFileForm = ({ plan, subscriptionPlanId, onClose, onSuccess }) => {
  const [formValues, setFormValues] = useState({
    userName: "",
    userPhone: "",
    userEmail: "",
    nationalId: "",
    jobTitle: "",
    paymentType: "Cash",
    userTall: "",
    userWeight: "",
    bloodType: "A+",
    userSight: "Good",
    userHearing: "Good",
    bloodPressure: "None",
    diabetes: "None",
    otherDiseases: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const formErr = {};
    const requiredFields = [
      "userName",
      "userPhone",
      "userEmail",
      "paymentType",
    ];
    requiredFields.forEach((field) => {
      if (!formValues[field]?.trim()) {
        formErr[field] = "هذا الحقل مطلوب";
      }
    });

    setErrors(formErr);
    return Object.keys(formErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      // Build clean payload: remove empty strings to avoid DTO errors
      const clean = Object.fromEntries(
        Object.entries(formValues).filter(([, v]) => v !== "")
      );
      const payload = {
        ...clean,
        subscriptionPlanId,
        ...(clean.paymentType === "Visa"
          ? { clientUrl: `${window.location.origin}/medical-file/status` }
          : {}),
      };

      const res = await baseApi.post("/MedicalFiles", payload, {
        validateStatus: () => true,
      });

      if (res.data?.success) {
        if (formValues.paymentType === "Visa" && res.data?.data?.sessionUrl) {
          window.location.href = res.data.data.sessionUrl;
          return;
        }

        const successMsg =
          res.data?.message ||
          "تم إرسال البيانات وسيتم التواصل معك قريباً من ممثلي خدمة العملاء.";
        toast.success(successMsg);
        setSuccessMessage(successMsg);

        setFormValues({
          userName: "",
          userPhone: "",
          userEmail: "",
          nationalId: "",
          jobTitle: "",
          paymentType: "Cash",
          userTall: "",
          userWeight: "",
          bloodType: "A+",
          userSight: "Good",
          userHearing: "Good",
          bloodPressure: "None",
          diabetes: "None",
          otherDiseases: "",
        });
        setErrors({});
        onSuccess?.();
        return;
      }

      const msg = res?.data?.message || "حدث خطأ أثناء إرسال الطلب";
      setApiError(msg);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = ({
    label,
    name,
    type = "text",
    placeholder = "",
    required = false,
  }) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700 text-right">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formValues[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border px-4 py-3 text-right focus:ring-2 focus:ring-second focus:outline-none ${
          errors[name] ? "border-red-500" : "border-gray-200"
        }`}
      />
      {errors[name] && (
        <p className="text-xs text-red-600 text-right">{errors[name]}</p>
      )}
    </div>
  );

  const renderSelect = ({ label, name, options, required = false }) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700 text-right">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <select
        name={name}
        value={formValues[name]}
        onChange={handleChange}
        className={`w-full rounded-2xl border px-4 py-3 text-right focus:ring-2 focus:ring-second focus:outline-none ${
          errors[name] ? "border-red-500" : "border-gray-200"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-xs text-red-600 text-right">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="text-right space-y-1">
        <p className="text-sm text-gray-500">باقة مختارة</p>
        <h3 className="text-2xl font-bold text-second">{plan?.name}</h3>
        <p className="text-gray-600 text-sm">{plan?.description}</p>
      </header>

      {successMessage && (
        <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-2xl">
          <FiCheckCircle className="w-5 h-5" />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {apiError && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-2xl">
          <FiAlertCircle className="w-5 h-5" />
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          {renderInput({
            label: "الاسم",
            name: "userName",
            required: true,
          })}
          {renderInput({
            label: "الهاتف",
            name: "userPhone",
            required: true,
          })}
          {renderInput({
            label: "البريد الإلكتروني",
            name: "userEmail",
            type: "email",
            required: true,
          })}
          {renderInput({
            label: "الرقم القومي",
            name: "nationalId",
          })}
          {renderInput({
            label: "الوظيفة",
            name: "jobTitle",
          })}
          {renderSelect({
            label: "طريقة الدفع",
            name: "paymentType",
            required: true,
            options: enums.paymentType,
          })}
          {renderInput({
            label: "الطول (سم)",
            name: "userTall",
            type: "number",
          })}
          {renderInput({
            label: "الوزن (كجم)",
            name: "userWeight",
            type: "number",
          })}
          {renderSelect({
            label: "فصيلة الدم",
            name: "bloodType",
            options: enums.bloodTypes,
          })}
          {renderSelect({
            label: "النظر",
            name: "userSight",
            options: enums.sight,
          })}
          {renderSelect({
            label: "السمع",
            name: "userHearing",
            options: enums.hearing,
          })}
          {renderSelect({
            label: "ضغط الدم",
            name: "bloodPressure",
            options: enums.disease,
          })}
          {renderSelect({
            label: "السكر",
            name: "diabetes",
            options: enums.disease,
          })}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 text-right">
            أمراض أخرى
          </label>
          <textarea
            name="otherDiseases"
            value={formValues.otherDiseases}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-right focus:ring-2 focus:ring-second focus:outline-none"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 inline-flex justify-center items-center gap-2 bg-second text-white font-semibold py-3 rounded-2xl hover:bg-primary transition disabled:opacity-70"
          >
            {submitting && <FiLoader className="w-5 h-5 animate-spin" />}
            <span>إرسال الطلب</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:border-second hover:text-second transition"
          >
            إغلاق
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalFileForm;
