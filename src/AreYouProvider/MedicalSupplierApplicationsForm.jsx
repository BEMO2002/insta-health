import React, { useState } from "react";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import baseApi from "../api/baseApi";

const initialState = {
  CompanyName: "",
  CEOName: "",
  OwnerName: "",
  CompanyEmail: "",
  FacebookLink: "",
  FoundingDate: "",
  ProviderActivity: "",
  PostalCode: "",
  Governrate: "",
  City: "",
  District: "",
  Address: "",
  BusinessPhoneNumber: "",
  PersonalPhoneNumber: "",
  WhatsAppPhoneNumber: "",
  CompanyBranches: "",
  WorkDays: "",
  ProviderServices: "",
  TaxCardImage: null,
  CommercialCardImage: null,
  BrandLogo: null,
};

const MedicalSupplierApplicationsForm = ({
  subscriptionPlanId,
  planName,
  onClose,
  onSuccess,
}) => {
  const [formValues, setFormValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const requiredFields = [
    "CompanyName",
    "CEOName",
    "OwnerName",
    "CompanyEmail",
    "FoundingDate",
    "ProviderActivity",
    "Governrate",
    "City",
    "District",
    "Address",
    "PersonalPhoneNumber",
    "WhatsAppPhoneNumber",
    "CompanyBranches",
  ];

  const requiredFiles = ["TaxCardImage", "CommercialCardImage", "BrandLogo"];

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] || null : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formValues[field]?.trim()) {
        newErrors[field] = "هذا الحقل مطلوب";
      }
    });

    requiredFiles.forEach((field) => {
      if (!formValues[field]) {
        newErrors[field] = "هذا الملف مطلوب";
      }
    });

    if (
      formValues.CompanyEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.CompanyEmail)
    ) {
      newErrors.CompanyEmail = "البريد الإلكتروني غير صالح";
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("subscriptionPlanId", subscriptionPlanId);

      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          payload.append(key, value);
        }
      });

      await baseApi.post("/MedicalSupplierApplications", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("تم إرسال طلبك بنجاح");
      setFormValues(initialState);
      setErrors({});
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.";
      setApiError(errorMessage);
      toast.error(errorMessage);
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
        value={type === "file" ? undefined : (formValues[name] ?? "")}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border px-4 py-3 text-right focus:ring-2 focus:ring-second focus:outline-none ${
          errors[name] ? "border-red-500" : "border-gray-200"
        }`}
        accept={type === "file" ? ".jpg,.jpeg,.png,.pdf" : undefined}
      />
      {errors[name] && (
        <p className="text-xs text-red-600 text-right">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="text-right space-y-1">
        <p className="text-sm text-gray-500">باقة مختارة</p>
        <h3 className="text-2xl font-bold text-second">{planName}</h3>
      </header>

      {apiError && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-2xl">
          <FiAlertCircle className="w-5 h-5" />
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          {renderInput({
            label: "اسم الشركة",
            name: "CompanyName",
            required: true,
          })}
          {renderInput({
            label: "اسم الرئيس التنفيذي",
            name: "CEOName",
            required: true,
          })}
          {renderInput({
            label: "اسم المالك",
            name: "OwnerName",
            required: true,
          })}
          {renderInput({
            label: "البريد الإلكتروني للشركة",
            name: "CompanyEmail",
            type: "email",
            required: true,
          })}
          {renderInput({
            label: "رابط فيسبوك",
            name: "FacebookLink",
            placeholder: "https://facebook.com/...",
          })}
          {renderInput({
            label: "تاريخ التأسيس",
            name: "FoundingDate",
            type: "date",
            required: true,
          })}
          {renderInput({
            label: "نشاط الشركة",
            name: "ProviderActivity",
            required: true,
          })}
          {renderInput({
            label: "الرمز البريدي",
            name: "PostalCode",
          })}
          {renderInput({
            label: "المحافظة",
            name: "Governrate",
            required: true,
          })}
          {renderInput({
            label: "المدينة",
            name: "City",
            required: true,
          })}
          {renderInput({
            label: "المنطقة / الحي",
            name: "District",
            required: true,
          })}
          {renderInput({
            label: "العنوان التفصيلي",
            name: "Address",
            required: true,
          })}
          {renderInput({
            label: "هاتف الشركة",
            name: "BusinessPhoneNumber",
            type: "tel",
          })}
          {renderInput({
            label: "رقم الهاتف الشخصي",
            name: "PersonalPhoneNumber",
            type: "tel",
            required: true,
          })}
          {renderInput({
            label: "رقم الواتساب",
            name: "WhatsAppPhoneNumber",
            type: "tel",
            required: true,
          })}
          {renderInput({
            label: "عدد الفروع",
            name: "CompanyBranches",
            required: true,
          })}
          {renderInput({
            label: "أيام العمل",
            name: "WorkDays",
          })}
          {renderInput({
            label: "الخدمات المقدمة",
            name: "ProviderServices",
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {renderInput({
            label: "صورة البطاقة الضريبية",
            name: "TaxCardImage",
            type: "file",
            required: true,
          })}
          {renderInput({
            label: "صورة السجل التجاري",
            name: "CommercialCardImage",
            type: "file",
            required: true,
          })}
          {renderInput({
            label: "شعار الشركة",
            name: "BrandLogo",
            type: "file",
            required: true,
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            aria-label="Submit Application"
            type="submit"
            disabled={submitting}
            className="flex-1 inline-flex justify-center items-center gap-2 bg-second text-white font-semibold py-3 rounded-2xl hover:bg-primary transition disabled:opacity-70"
          >
            {submitting && <FiLoader className="w-5 h-5 animate-spin" />}
            <span>إرسال الطلب</span>
          </button>
          <button
            aria-label="Close Application"
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

export default MedicalSupplierApplicationsForm;
