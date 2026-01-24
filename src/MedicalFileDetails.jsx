import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSpinner, FaTimes, FaDownload, FaArrowRight } from "react-icons/fa";
import { toast } from "react-hot-toast";
import baseApi from "./api/baseApi";
import RecordsViewModal from "./Components/RecordsViewModal";
import AddRecordModal from "./Components/AddRecordModal";
const deliveryStatusOptions = [
  {
    value: "NotDispatched",
    label: "لم يتم الشحن",
    color: "bg-gray-100 text-gray-800 border-gray-300",
  },
  {
    value: "Dispatched",
    label: "تم الشحن",
    color: "bg-purple-100 text-purple-800 border-purple-300",
  },
  {
    value: "InTransit",
    label: "قيد التوصيل",
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
  {
    value: "Delivered",
    label: "تم التوصيل",
    color: "bg-green-100 text-green-800 border-green-300",
  },
];

// Payment type enum
const paymentTypeOptions = [
  { value: "Cash", label: "كاش" },
  { value: "Visa", label: "فيزا" },
];

// Sight enum
const sightOptions = [
  { value: "Good", label: "جيد" },
  { value: "VeryGood", label: "جيد جدًا" },
  { value: "Bad", label: "ضعيف" },
  { value: "Excellent", label: "ممتاز" },
];

// Hearing enum
const hearingOptions = [
  { value: "Good", label: "جيد" },
  { value: "VeryGood", label: "جيد جدًا" },
  { value: "Bad", label: "ضعيف" },
  { value: "Excellent", label: "ممتاز" },
];

// Disease enum
const diseaseOptions = [
  { value: "None", label: "لا يوجد" },
  { value: "Low", label: "منخفض" },
  { value: "High", label: "مرتفع" },
];

// Arabic labels for file fields
const fieldLabels = {
  fileNumber: "رقم الملف",
  userName: "الاسم",
  userPhone: "الهاتف",
  userEmail: "البريد الإلكتروني",
  nationalId: "الرقم القومي",
  jobTitle: "الوظيفة",
  paymentStatus: "حالة الدفع",
  paymentType: "طريقة الدفع",
  deliveryStatus: "حالة الشحن",
  userTall: "الطول",
  userWeight: "الوزن",
  bloodType: "فصيلة الدم",
  userSight: "النظر",
  userHearing: "السمع",
  bloodPressure: "ضغط الدم",
  diabetes: "السكر",
  otherDiseases: "أمراض أخرى",
  expirationDate: "تاريخ الانتهاء",
  subscriptionPlanId: "رقم خطة الاشتراك",
};

// Helper to get enum label
const getEnumLabel = (options, value) => {
  if (!value) return "-";
  const option = options.find((opt) => opt.value === value);
  return option ? option.label : value;
};

// Helper to format field value
const formatFieldValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "-";

  const k = String(key || "").toLowerCase();

  switch (k) {
    case "paymenttype":
      return getEnumLabel(paymentTypeOptions, value);
    case "usersight":
      return getEnumLabel(sightOptions, value);
    case "userhearing":
      return getEnumLabel(hearingOptions, value);
    case "bloodpressure":
    case "diabetes":
      return getEnumLabel(diseaseOptions, value);
    case "usertall":
      return `${value} سم`;
    case "userweight":
      return `${value} كجم`;
    case "paymentstatus":
      return value === "Paid"
        ? "مدفوع"
        : value === "Pending"
          ? "قيد الانتظار"
          : value;
    case "deliverystatus":
      return getEnumLabel(deliveryStatusOptions, value);
    case "expirationdate":
      if (value === "0001-01-01" || !value) return "غير محدد";
      try {
        const date = new Date(value);
        return date.toLocaleDateString("ar-EG");
      } catch {
        return value;
      }
    default:
      return String(value);
  }
};

const MedicalFileDetails = () => {
  const { fileNumber } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordTypes, setRecordTypes] = useState([]);
  const [recordsModalOpen, setRecordsModalOpen] = useState(false);
  const [recordsModalTypeId, setRecordsModalTypeId] = useState(null);
  const [recordsModalTypeName, setRecordsModalTypeName] = useState(null);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [addRecordTypeId, setAddRecordTypeId] = useState(null);
  const [addRecordTypeName, setAddRecordTypeName] = useState(null);

  // Fetch medical record types
  useEffect(() => {
    const fetchRecordTypes = async () => {
      try {
        const res = await baseApi.get("/MedicalRecordTypes");
        if (res.data?.success) {
          setRecordTypes(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load record types", err);
      }
    };
    fetchRecordTypes();
  }, []);

  // Fetch file details
  useEffect(() => {
    const fetchFileDetails = async () => {
      if (!fileNumber) {
        toast.error("رقم الملف غير موجود");
        navigate("/medical-files");
        return;
      }

      setLoading(true);
      try {
        const res = await baseApi.get(`/MedicalFiles/${fileNumber}`, {
          validateStatus: () => true,
        });
        if (res.data?.success) {
          setFile(res.data.data);
        } else {
          toast.error("تعذر تحميل تفاصيل الملف");
          navigate("/medical-files");
        }
      } catch (error) {
        console.error("Error fetching file details:", error);
        toast.error("تعذر تحميل تفاصيل الملف");
        navigate("/medical-files");
      } finally {
        setLoading(false);
      }
    };

    fetchFileDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileNumber]);

  // Open records modal
  const openRecordsModal = (typeId = null, typeName = null) => {
    setRecordsModalTypeId(typeId);
    setRecordsModalTypeName(typeName);
    setRecordsModalOpen(true);
  };

  // Open add record modal
  const openAddRecordModal = (typeId, typeName) => {
    if (!file) {
      toast.error("يرجى اختيار ملف طبي أولاً");
      return;
    }
    setAddRecordTypeId(typeId);
    setAddRecordTypeName(typeName);
    setAddRecordModalOpen(true);
  };

  // Filter out hidden keys for details display
  const hiddenKeys = new Set([
    "id",
    "qrCodeUrl",
    "userId",
    "UserId",
    "medicalFileId",
    "MedicalFileId",
  ]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-primary w-10 h-10" />
          <span className="text-baseTwo">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-baseTwo">الملف الطبي غير موجود</p>
          <button
            onClick={() => navigate("/medical-files")}
            className="mt-4 px-4 py-2 bg-second text-white rounded-lg hover:bg-second/90"
          >
            العودة إلى قائمة الملفات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          aria-label="Go Back"
          onClick={() => navigate("/medical-files")}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          <FaArrowRight />
          العودة إلى قائمة الملفات
        </button>
        <h2 className="text-2xl font-bold text-primary">تفاصيل الملف الطبي</h2>
      </div>

      {/* QR Code */}
      {file.qrCodeUrl && (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <img
            src={file.qrCodeUrl}
            alt="QR Code"
            className="mx-auto w-48 h-48 object-contain border border-gray-300 rounded-lg"
          />
          <button
            aria-label="Download QR Code"
            onClick={() => {
              const link = document.createElement("a");
              link.href = file.qrCodeUrl;
              link.download = `QRCode-${file.fileNumber || "medical-file"}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-second text-white rounded-lg hover:bg-second/90"
          >
            <FaDownload />
            تنزيل QR Code
          </button>
        </div>
      )}

      {/* File Details Table */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-primary">معلومات الملف</h3>
        </div>
        <table className="min-w-full text-right">
          <tbody className="text-sm text-gray-700">
            {Object.entries(file)
              .filter(([k]) => !hiddenKeys.has(k))
              .map(([k, v]) => (
                <tr
                  key={k}
                  className="border-b border-gray-300 last:border-b-0"
                >
                  <td className="py-2 font-medium px-4">
                    {fieldLabels[k] ?? k}
                  </td>
                  <td className="py-2 px-4">{formatFieldValue(k, v)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Medical Record Types Grid */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">أنواع السجلات الطبية</h3>
          <button
            aria-label="View All Records"
            onClick={() => openRecordsModal(null, "جميع السجلات")}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 flex items-center gap-2"
          >
            عرض الجميع
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recordTypes.map((type) => (
            <div
              key={type.id}
              className="border border-gray-300 rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <div className="text-primary font-bold mb-1">{type.name}</div>
                <p className="text-gray-500 text-sm">
                  إدارة السجلات الخاصة بهذا النوع
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  aria-label="Add New Record"
                  onClick={() => openAddRecordModal(type.id, type.name)}
                  className="bg-second text-white px-3 py-1 rounded text-sm hover:bg-second/90"
                >
                  إضافة جديد
                </button>
                <button
                  aria-label="View Records"
                  onClick={() => openRecordsModal(type.id, type.name)}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                >
                  عرض السجلات
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Records View Modal */}
      {file && (
        <RecordsViewModal
          isOpen={recordsModalOpen}
          onClose={() => {
            setRecordsModalOpen(false);
            setRecordsModalTypeId(null);
            setRecordsModalTypeName(null);
          }}
          fileId={file.id}
          recordTypeId={recordsModalTypeId}
          recordTypeName={recordsModalTypeName}
        />
      )}

      {/* Add Record Modal */}
      {file && (
        <AddRecordModal
          isOpen={addRecordModalOpen}
          onClose={(ok) => {
            setAddRecordModalOpen(false);
            setAddRecordTypeId(null);
            setAddRecordTypeName(null);
            if (ok) {
              // Refresh file details if needed
              const fetchFileDetails = async () => {
                try {
                  const res = await baseApi.get(`/MedicalFiles/${fileNumber}`, {
                    validateStatus: () => true,
                  });
                  if (res.data?.success) {
                    setFile(res.data.data);
                  }
                } catch (error) {
                  console.error("Error refreshing file details:", error);
                }
              };
              fetchFileDetails();
            }
          }}
          fileId={file.id}
          recordTypeId={addRecordTypeId}
          recordTypeName={addRecordTypeName}
        />
      )}
    </div>
  );
};

export default MedicalFileDetails;
