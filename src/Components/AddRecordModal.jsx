import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";

const AddRecordModal = ({
  isOpen,
  onClose,
  fileId,
  recordTypeId,
  recordTypeName,
  record, // for edit mode
}) => {
  const [form, setForm] = useState({
    MedicalFileId: fileId || 0,
    Content: "",
    DoctorName: "",
    DoctorAddress: "",
    ProviderId: "",
    CreatedAt: new Date().toISOString().slice(0, 10),
    AttachmentUrl: null,
    Cost: "",
    MedicalRecordTypeId: recordTypeId || 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Sync ids from props whenever modal opens or ids change
  useEffect(() => {
    if (!isOpen) return;
    if (record) {
      // Edit mode: populate form with existing record data
      // Format date for input field (YYYY-MM-DD)
      const formatDate = (dateStr) => {
        if (!dateStr) return new Date().toISOString().slice(0, 10);
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
        return date.toISOString().slice(0, 10);
      };

      setForm({
        MedicalFileId:
          record.medicalFileId || record.MedicalFileId || fileId || 0,
        Content: record.content || record.Content || "",
        DoctorName: record.doctorName || record.DoctorName || "",
        DoctorAddress: record.doctorAddress || record.DoctorAddress || "",
        ProviderId: record.providerId || record.ProviderId || "",
        CreatedAt: formatDate(record.createdAt || record.CreatedAt),
        AttachmentUrl: null, // Don't pre-fill file input
        Cost: record.cost || record.Cost || "",
        MedicalRecordTypeId:
          record.medicalRecordTypeId ||
          record.MedicalRecordTypeId ||
          recordTypeId ||
          0,
      });
    } else {
      // Add mode: reset form
      setForm((p) => ({
        ...p,
        MedicalFileId: fileId || 0,
        MedicalRecordTypeId: recordTypeId || 0,
        Content: "",
        DoctorName: "",
        DoctorAddress: "",
        ProviderId: "",
        CreatedAt: new Date().toISOString().slice(0, 10),
        AttachmentUrl: null,
        Cost: "",
      }));
    }
  }, [isOpen, fileId, recordTypeId, record]);

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

      // Check if we're in edit mode - check record prop directly
      const recordId = record?.id || record?.Id;
      const isEditMode = !!(record && recordId);

      if (isEditMode) {
        // Update existing record - ensure id is in FormData and use PUT
        fd.append("id", recordId);
        fd.append("Id", recordId);

        const res = await baseApi.put(`/MedicalRecords/${recordId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          validateStatus: () => true,
        });

        if (res.data?.success || res.status === 200 || res.status === 204) {
          toast.success("تم التعديل بنجاح");
          onClose(true);
        } else {
          toast.error(res.data?.message || res.data?.error || "تعذر التعديل");
        }
      } else {
        // Create new record
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
      }
    } catch {
      toast.error(record?.id ? "تعذر التعديل" : "تعذر الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-[10000] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-bold">
            {record?.id ? "تعديل سجل طبي" : "إضافة سجل طبي"}
          </h3>
          <button
            aria-label="Close Modal"
            onClick={() => onClose(false)}
            className="text-gray-500"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <form
            onSubmit={submit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Input
              label="اسم الطبيب"
              name="DoctorName"
              value={form.DoctorName}
              onChange={handleChange}
              required
            />
            <Input
              label="عنوان الطبيب"
              name="DoctorAddress"
              value={form.DoctorAddress}
              onChange={handleChange}
              required
            />
            {/* <Input
              label="المُقدّم (اختياري)"
              name="ProviderId"
              type="number"
              value={form.ProviderId}
              onChange={handleChange}
              readOnly
            /> */}
            <Input
              label="التاريخ"
              name="CreatedAt"
              type="date"
              value={form.CreatedAt}
              onChange={handleChange}
              required
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
                <span className="text-red-500 mr-1">*</span>
              </label>
              <div className="w-full border border-gray-300 rounded p-3 bg-gray-50">
                {recordTypeName || `#${form.MedicalRecordTypeId}`}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المحتوى
                <span className="text-red-500 mr-1">*</span>
              </label>
              <textarea
                name="Content"
                value={form.Content}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded p-3 break-words overflow-wrap-anywhere"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مرفق
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleFile}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                aria-label="Cancel"
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
                {submitting
                  ? record?.id
                    ? "جاري التحديث..."
                    : "جاري الحفظ..."
                  : record?.id
                    ? "تحديث"
                    : "حفظ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {props.required && <span className="text-red-500 mr-1">*</span>}
    </label>
    <input {...props} className="w-full border border-gray-300 rounded p-3" />
  </div>
);

export default AddRecordModal;
