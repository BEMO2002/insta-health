import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaTimes, FaPrint, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";
import AddRecordModal from "./AddRecordModal";

const RecordsViewModal = ({
  isOpen,
  onClose,
  fileId,
  recordTypeId,
  recordTypeName,
}) => {
  const [items, setItems] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [q] = useState("");
  const printRef = useRef();
  const [editModal, setEditModal] = useState({ open: false, record: null });
  const [deleting, setDeleting] = useState(false);

  // Helper to build absolute file URL
  const apiBase = baseApi.defaults?.baseURL || "";
  const siteBase = apiBase.replace(/\/api\/?$/, "");
  const buildFileUrl = (p) => {
    if (!p) return null;
    if (/^https?:\/\//i.test(p)) return p;
    return `${siteBase}${p.startsWith("/") ? "" : "/"}${p}`;
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // More reliable print on mobile: print via hidden iframe instead of window.open
  const printHtmlViaIframe = (html) => {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow || iframe.contentDocument;
      const idoc = doc.document || doc;
      idoc.open();
      idoc.write(html);
      idoc.close();

      const doPrint = () => {
        const imgs = Array.from(idoc.images || []);
        if (!imgs.length) {
          // On iOS Safari, give the engine a tick before printing
          setTimeout(() => {
            doc.focus?.();
            doc.print?.();
            setTimeout(() => document.body.removeChild(iframe), 500);
          }, 0);
          return;
        }
        let loaded = 0;
        const done = () => {
          loaded++;
          if (loaded >= imgs.length) {
            setTimeout(() => {
              doc.focus?.();
              doc.print?.();
              setTimeout(() => document.body.removeChild(iframe), 500);
            }, 0);
          }
        };
        imgs.forEach((im) => {
          if (im.complete) return done();
          im.onload = done;
          im.onerror = done;
        });
      };

      if (idoc.readyState === "complete") doPrint();
      else idoc.addEventListener("DOMContentLoaded", doPrint);
    } catch {
      // fallback
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
        w.close();
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      const params = {
        PageIndex: pageIndex,
        PageSize: pageSize,
        FileId: fileId,
      };
      if (recordTypeId) params.RecordType = recordTypeId;
      if (q) params.SearchName = q;
      const res = await baseApi.get("/MedicalRecords", {
        params,
        validateStatus: () => true,
      });
      if (res.data?.success) {
        const fetchedItems = res.data.data.items || [];
        setItems(fetchedItems);
        setTotal(res.data.data.count || 0);
      } else {
        setItems([]);
        setTotal(0);
      }
    };
    fetchData();
  }, [isOpen, pageIndex, pageSize, fileId, recordTypeId, q, editModal.open]);

  const handleEdit = (record) => {
    setEditModal({ open: true, record });
  };

  const handleDeleteClick = async (record) => {
    if (!record) {
      toast.error("خطأ: السجل غير موجود");
      return;
    }

    if (deleting) return;

    const recordId = record?.id;

    if (!recordId) {
      toast.error("خطأ: لا يوجد معرف للسجل");
      return;
    }

    // Math challenge before delete
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;
    
    const userAnswer = prompt(`للتأكيد، حل المسألة التالية:\n${num1} + ${num2} = ؟`);
    
    if (userAnswer === null) {
      // User cancelled
      return;
    }
    
    if (parseInt(userAnswer) !== correctAnswer) {
      toast.error("إجابة خاطئة! لم يتم الحذف");
      return;
    }

    setDeleting(true);
    try {
      const res = await baseApi.delete(`/MedicalRecords/${recordId}`, {
        validateStatus: () => true,
      });

      if (res.data?.success || res.status === 200 || res.status === 204) {
        toast.success("تم حذف السجل بنجاح");
        // Refresh the list
        const params = {
          PageIndex: pageIndex,
          PageSize: pageSize,
          FileId: fileId,
        };
        if (recordTypeId) params.RecordType = recordTypeId;
        if (q) params.SearchName = q;
        const refreshRes = await baseApi.get("/MedicalRecords", {
          params,
          validateStatus: () => true,
        });
        if (refreshRes.data?.success) {
          setItems(refreshRes.data.data.items || []);
          setTotal(refreshRes.data.data.count || 0);
        }
      } else {
        toast.error(res.data?.message || "تعذر الحذف");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "تعذر حذف السجل");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  const renderAllHtml = () => {
    const itemsHtml = (items || [])
      .map((it, idx) => {
        return `<section class="page">
          ${renderRecordHtml(it)}
          ${idx < items.length - 1 ? '<div class="break"></div>' : ""}
        </section>`;
      })
      .join("\n");
    return `<!DOCTYPE html>
    <html dir="rtl"><head><meta charset="utf-8" />
      <title>طباعة السجلات</title>
      <style>
        @page { size: A4; margin: 16mm; }
        *{ box-sizing: border-box }
        body{ font-family: Tahoma, Arial, sans-serif; color:#111; }
        .container{ max-width: 900px; margin: 0 auto; }
        .header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .brand{ font-size:20px; font-weight:700; color:#0f766e }
        .meta{ color:#6b7280; font-size:12px }
        .page{ page-break-inside: avoid; }
        .break{ page-break-after: always; height:0; }
        .record{ border:1px solid #e5e7eb; border-radius:12px; padding:16px; margin: 0 0 16px 0; }
        .title{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .title h3{ margin:0; color:#0f766e }
        .grid{ display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:13px }
        .lbl{ font-weight:700; min-width:90px }
        .content{ margin-top:8px; padding:12px; border:1px solid #e5e7eb; border-radius:8px; background:#fafafa; white-space:pre-wrap; line-height:1.7 }
        .imgwrap{ margin-top:10px; text-align:center }
        .imgwrap img{ max-width:100%; max-height:420px; object-fit:contain; border:1px solid #e5e7eb; border-radius:8px; }
        .caption{ font-size:12px; color:#6b7280; margin-top:4px }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">InstaHealthy</div>
          <div class="meta">تاريخ الطباعة: ${new Date().toLocaleDateString(
            "ar-EG"
          )}</div>
        </div>
        ${itemsHtml}
      </div>
    </body></html>`;
  };

  const printAll = () => {
    printHtmlViaIframe(renderAllHtml());
  };

  const printOne = (it) => {
    const html = `<html dir="rtl"><head><title>طباعة</title>
        <style>
          @page { size: A4; margin: 16mm; }
          *{ box-sizing: border-box }
          body{ font-family: Tahoma, Arial, sans-serif; color:#111; }
          .record{ border:1px solid #e5e7eb; border-radius:12px; padding:16px; margin: 0 0 16px 0; }
          .title{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
          .title h3{ margin:0; color:#0f766e }
          .grid{ display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:13px }
          .lbl{ font-weight:700; min-width:90px }
          .content{ margin-top:8px; padding:12px; border:1px solid #e5e7eb; border-radius:8px; background:#fafafa; white-space:pre-wrap; line-height:1.7 }
          .imgwrap{ margin-top:10px; text-align:center }
          .imgwrap img{ max-width:100%; max-height:420px; object-fit:contain; border:1px solid #e5e7eb; border-radius:8px; }
          .caption{ font-size:12px; color:#6b7280; margin-top:4px }
        </style>
      </head><body>${renderRecordHtml(it)}</body></html>`;
    printHtmlViaIframe(html);
  };

  const renderRecordHtml = (it) => {
    const img = buildFileUrl(
      it?.attachmentUrl ||
        it?.attachmentURL ||
        it?.attachment ||
        it?.imageUrl ||
        it?.imagePath
    );
    return `<article class="record">
      <div class="title">
        <h3>سجل طبي</h3>
        <div class="meta">${it.createdAt || "-"}</div>
      </div>
      <div class="grid">
        <div><span class="lbl">النوع:</span> ${it.recordTypeName || "-"}</div>
        <div><span class="lbl">التكلفة:</span> ${it.cost || 0}</div>
        <div><span class="lbl">الطبيب:</span> ${it.doctorName || "-"}</div>
        <div><span class="lbl">العنوان:</span> ${it.doctorAddress || "-"}</div>
      </div>
      <div class="content">${(it.content || "").replace(/\n/g, "<br/>")}</div>
      ${
        img
          ? `<div class="imgwrap"><img src="${img}" alt="attachment" /><div class="caption">صورة المرفق</div></div>`
          : ""
      }
    </article>`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col"
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center flex-col md:flex-row gap-3">
            <h3 className="text-lg font-bold">
              السجلات  {recordTypeName ? `(${recordTypeName})` : "(جميع الأنواع)"}
            </h3>
            {/* <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث"
                className="border border-gray-300 rounded pl-3 pr-8 py-2"
              />
            </div> */}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={printAll}
              className="px-3 py-2 bg-second text-white rounded flex items-center gap-2"
            >
              <FaPrint /> طباعة الكل
            </button>
            <button onClick={onClose} className="text-gray-500">
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1" ref={printRef}>
          {items.length === 0 ? (
            <p className="text-gray-600">لا توجد سجلات</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((it, index) => {
                const img = buildFileUrl(
                  it?.attachmentUrl ||
                    it?.attachmentURL ||
                    it?.attachment ||
                    it?.imageUrl ||
                    it?.imagePath
                );
                const itemId = it?.id;
                return (
                  <div
                    key={itemId}
                    className="border border-gray-300 rounded p-4 overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-second break-words">
                        {it.recordTypeName || "سجل"}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(it)}
                          className="text-sm bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-600"
                        >
                          <FaEdit /> تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteClick(it)}
                          disabled={deleting}
                          className="text-sm bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-600 disabled:opacity-50"
                        >
                          <FaTrash /> {deleting ? "جاري الحذف..." : "حذف"}
                        </button>
                        <button
                          onClick={() => printOne(it)}
                          className="text-sm bg-gray-200 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <FaPrint /> طباعة
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="break-words">
                        <b>التاريخ:</b> {it.createdAt}
                      </div>
                      <div className="break-words">
                        <b>الطبيب:</b> {it.doctorName}
                      </div>
                      <div className="break-words">
                        <b>التكلفة:</b> {it.cost}
                      </div>
                    </div>
                    <hr className="my-2 text-gray-300 " />
                    <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {it.content}
                    </div>
                    {img ? (
                      <a
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-2 px-3 py-2 bg-second text-white rounded"
                      >
                        تنزيل المرفق
                      </a>
                    ) : (
                      <div className="mt-2 h-12 w-full flex items-center justify-center rounded border border-dashed text-gray-400 bg-gray-50">
                        لا يوجد مرفق
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-3 border-t flex-shrink-0">
            <button
              disabled={pageIndex === 1}
              onClick={() => setPageIndex((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              السابق
            </button>
            <span className="text-sm">
              صفحة {pageIndex} من {totalPages}
            </span>
            <button
              disabled={pageIndex === totalPages}
              onClick={() => setPageIndex((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AddRecordModal
        isOpen={editModal.open}
        onClose={(ok) => {
          setEditModal({ open: false, record: null });
          if (ok) {
            // Refresh list will be handled by useEffect dependency
          }
        }}
        fileId={fileId}
        recordTypeId={recordTypeId}
        recordTypeName={recordTypeName}
        record={editModal.record}
      />
    </div>
  );
};

export default RecordsViewModal;
