import React, { useState, useEffect } from "react";
import {
  FiLoader,
  FiAlertCircle,
  FiPlus,
  FiMinus,
  FiCheckCircle,
} from "react-icons/fi";
import baseApi from "../api/baseApi";

const memberTemplate = {
  memberName: "",
  gender: "Male",
  relationship: "",
  nationalId: "",
  birthDate: "",
};

const FamilyCardForm = ({ plan, subscriptionPlanId, onClose, onSuccess }) => {
  const [formValues, setFormValues] = useState({
    userName: "",
    gender: "Male",
    paymentType: "Cash",
    nationalId: "",
    birthDate: "",
  });
  const [members, setMembers] = useState([{ ...memberTemplate }]);
  const [errors, setErrors] = useState({});
  const [memberErrors, setMemberErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setMembers([{ ...memberTemplate }]);
    setSuccessMessage("");
    setApiError("");
  }, [plan?.id]);

  const maxMembers = plan?.numberOfMembers || 1;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMemberChange = (index, field, value) => {
    setMembers((prev) =>
      prev.map((member, idx) =>
        idx === index ? { ...member, [field]: value } : member
      )
    );
    setMemberErrors((prev) => {
      const updated = [...prev];
      if (!updated[index]) updated[index] = {};
      updated[index][field] = "";
      return updated;
    });
  };

  const addMember = () => {
    if (members.length >= maxMembers) return;
    setMembers((prev) => [...prev, { ...memberTemplate }]);
    setMemberErrors((prev) => [...prev, {}]);
  };

  const removeMember = (index) => {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((_, idx) => idx !== index));
    setMemberErrors((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validate = () => {
    const formErr = {};
    const membersErr = members.map(() => ({}));

    const requiredFields = ["userName", "gender", "paymentType", "birthDate"];
    requiredFields.forEach((field) => {
      if (!formValues[field]?.trim()) {
        formErr[field] = "هذا الحقل مطلوب";
      }
    });

    members.forEach((member, index) => {
      ["memberName", "gender", "relationship", "birthDate"].forEach((field) => {
        if (!member[field]?.trim()) {
          membersErr[index][field] = "هذا الحقل مطلوب";
        }
      });
    });

    setErrors(formErr);
    setMemberErrors(membersErr);
    return (
      !Object.keys(formErr).length &&
      membersErr.every((err) => Object.keys(err).length === 0)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formValues,
        subscriptionPlanId,
        members: members,
      };

      if (formValues.paymentType === "Visa") {
        payload.clientUrl = `${window.location.origin}/family-card/status`;
      }

      const res = await baseApi.post("/HealthCards", payload, {
        validateStatus: () => true,
      });

      if (res.data?.success) {
        if (formValues.paymentType === "Visa" && res.data?.data?.sessionUrl) {
          window.location.href = res.data.data.sessionUrl;
          return;
        }

        setSuccessMessage(
          "تم إرسال طلبك وسيتم التواصل معك قريباً من ممثلي خدمة العملاء."
        );

        setFormValues({
          userName: "",
          gender: "Male",
          paymentType: "Cash",
          nationalId: "",
          birthDate: "",
        });
        setMembers([{ ...memberTemplate }]);
        setErrors({});
        setMemberErrors([]);
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

  const renderMemberInput = (
    label,
    field,
    index,
    { type = "text", required = false } = {}
  ) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-600 text-right">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <input
        type={type}
        value={members[index][field]}
        onChange={(e) => handleMemberChange(index, field, e.target.value)}
        className={`w-full rounded-xl border px-3 py-2 text-right focus:ring-2 focus:ring-second focus:outline-none ${
          memberErrors[index]?.[field] ? "border-red-500" : "border-gray-200"
        }`}
      />
      {memberErrors[index]?.[field] && (
        <p className="text-[11px] text-red-600 text-right">
          {memberErrors[index][field]}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="text-right space-y-1">
        <p className="text-sm text-gray-500">باقة مختارة</p>
        <h3 className="text-2xl font-bold text-second">{plan?.name}</h3>
        <p className="text-gray-600 text-sm">
          الحد الأقصى للأفراد: {plan?.numberOfMembers}
        </p>
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-5">
          {renderInput({
            label: "اسم مقدم الطلب",
            name: "userName",
            required: true,
          })}
          {renderSelect({
            label: "النوع",
            name: "gender",
            required: true,
            options: [
              { label: "ذكر", value: "Male" },
              { label: "أنثى", value: "Female" },
            ],
          })}
          {renderSelect({
            label: "طريقة الدفع",
            name: "paymentType",
            required: true,
            options: [
              { label: "نقداً", value: "Cash" },
              { label: "فيزا", value: "Visa" },
            ],
          })}
          {renderInput({
            label: "الرقم القومي (اختياري)",
            name: "nationalId",
            placeholder: "مثال: 12345678901234",
          })}
          {renderInput({
            label: "تاريخ الميلاد",
            name: "birthDate",
            type: "date",
            required: true,
          })}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-gray-900">أفراد العائلة</h4>
            <button
              type="button"
              onClick={addMember}
              disabled={members.length >= maxMembers}
              className="inline-flex items-center gap-2 bg-second text-white px-4 py-2 rounded-2xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus className="w-4 h-4" />
              <span>إضافة فرد</span>
            </button>
          </div>

          <div className="space-y-4">
            {members.map((member, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-gray-700">
                    فرد #{index + 1}
                  </h5>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-red-500 hover:text-red-700 inline-flex items-center gap-1 text-sm"
                    >
                      <FiMinus className="w-4 h-4" />
                      إزالة
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {renderMemberInput("اسم الفرد", "memberName", index, {
                    required: true,
                  })}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-600 text-right">
                      النوع<span className="text-red-500 mr-1">*</span>
                    </label>
                    <select
                      value={member.gender}
                      onChange={(e) =>
                        handleMemberChange(index, "gender", e.target.value)
                      }
                      className={`w-full rounded-xl border px-3 py-2 text-right focus:ring-2 focus:ring-second focus:outline-none ${
                        memberErrors[index]?.gender
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    >
                      <option value="Male">ذكر</option>
                      <option value="Female">أنثى</option>
                    </select>
                    {memberErrors[index]?.gender && (
                      <p className="text-[11px] text-red-600 text-right">
                        {memberErrors[index].gender}
                      </p>
                    )}
                  </div>
                  {renderMemberInput("صلة القرابة", "relationship", index, {
                    required: true,
                  })}
                  {renderMemberInput(
                    "الرقم القومي (اختياري)",
                    "nationalId",
                    index
                  )}
                  {renderMemberInput("تاريخ الميلاد", "birthDate", index, {
                    type: "date",
                    required: true,
                  })}
                </div>
              </div>
            ))}
          </div>
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

export default FamilyCardForm;
