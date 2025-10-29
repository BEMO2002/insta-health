import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";

const AddRecordModal = ({ isOpen, onClose, fileId, recordTypeId, recordTypeName }) => {
  const [form, setForm] = useState({
    MedicalFileId: fileId || 0,
    Content: "",
    DoctorName: "",
    DoctorAddress: "",
    ProviderId: "",
    CreatedAt: new Date().toISOString().slice(0, 10),
    AttachmentUrl: null,
    Cost: 0,
    MedicalRecordTypeId: recordTypeId || 0,
  });
  const [submitting, setSubmitting] = useState(false);
  // Sync ids from props whenever modal opens or ids change
  useEffect(() => {
    if (!isOpen) return;
    setForm((p) => ({
      ...p,
      MedicalFileId: fileId || 0,
      MedicalRecordTypeId: recordTypeId || 0,
    }));
  }, [isOpen, fileId, recordTypeId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    setForm((p) => ({ ...p, AttachmentUrl: e.target.files?.[0] || null }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        // Keep keys even if value is an empty string (e.g., ProviderId must be sent empty)
        if (v !== null && v !== undefined) fd.append(k, v);
      });
      const res = await baseApi.post("/MedicalRecords", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true,
      });
      if (res.data?.success) {
        toast.success("تم إضافة السجل بنجاح");
        onClose(true);
      } else {
        toast.error(res.data?.message || "تعذر الإضافة");
      }
    } catch (err) {
      toast.error("تعذر الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl w-full max-w-2xl overflow-hidden"
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold">إضافة سجل طبي</h3>
          <button onClick={() => onClose(false)} className="text-gray-500">
            <FaTimes />
          </button>
        </div>
        <form
          onSubmit={submit}
          className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            label="اسم الطبيب"
            name="DoctorName"
            value={form.DoctorName}
            onChange={handleChange}
          />
          <Input
            label="عنوان الطبيب"
            name="DoctorAddress"
            value={form.DoctorAddress}
            onChange={handleChange}
          />
          <Input
            label="المُقدّم (اختياري)"
            name="ProviderId"
            type="number"
            value={form.ProviderId}
            onChange={handleChange}
            readOnly
          />
          <Input
            label="التاريخ"
            name="CreatedAt"
            type="date"
            value={form.CreatedAt}
            onChange={handleChange}
          />
          <Input
            label="التكلفة"
            name="Cost"
            type="number"
            value={form.Cost}
            onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوع السجل
            </label>
            <div className="w-full border rounded p-3 bg-gray-50">
              {recordTypeName || `#${form.MedicalRecordTypeId}`}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المحتوى
            </label>
            <textarea
              name="Content"
              value={form.Content}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded p-3"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              مرفق
            </label>
            <input type="file" onChange={handleFile} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-second text-white rounded"
            >
              {submitting ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input {...props} className="w-full border rounded p-3" />
  </div>
);

export default AddRecordModal;
