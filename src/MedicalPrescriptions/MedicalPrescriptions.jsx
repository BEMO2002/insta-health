import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiDownload, FiEye } from "react-icons/fi";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";

const MedicalPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await baseApi.get("/MedicalPrescriptions", {
        params: {
          PageIndex: pageIndex,
          PageSize: pageSize,
        },
      });

      if (response.data.success && response.data.data) {
        setPrescriptions(response.data.data.items || []);
        setTotalCount(response.data.data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("حدث خطأ في تحميل الوصفات الطبية");
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPageIndex(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPageButtons = () => {
    const max = 5;
    const pages = [];
    let start = Math.max(1, pageIndex - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          aria-label="Previous Page"
          onClick={() => goToPage(pageIndex - 1)}
          disabled={pageIndex === 1}
          className="px-4 py-2 bg-second text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors"
        >
          السابق
        </button>
        {pages.map((p) => (
          <button
            aria-label={`Page ${p}`}
            key={p}
            onClick={() => goToPage(p)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              p === pageIndex
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          aria-label="Next Page"
          onClick={() => goToPage(pageIndex + 1)}
          disabled={pageIndex === totalPages}
          className="px-4 py-2 bg-second text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors"
        >
          التالي
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-second text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            الوصفات الطبية
          </h1>
          <div className="w-24 h-1 bg-white mx-auto rounded-full mb-4"></div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            تصفح مجموعة من الخدمات والوصفات الطبية المتاحة لدينا
          </p>
        </div>
      </div>

      <section className="py-12 max-w-7xl mx-auto px-4">
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-xl font-semibold mb-2">{error}</p>
            <button
              onClick={fetchPrescriptions}
              className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-second transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : prescriptions.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FiFileText className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              لا توجد وصفات طبية متاحة حالياً
            </h3>
            <p className="text-gray-500">يرجى المحاولة مرة أخرى لاحقاً</p>
          </div>
        ) : (
          <>
            {/* Prescriptions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={prescription.attachment}
                      alt={prescription.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%234b5563" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3Eوصفة طبية%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-primary font-bold text-sm">
                        #{prescription.id}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {prescription.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 text-sm mb-4 flex-1  leading-relaxed">
                      {prescription.content}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          navigate(`/medical-prescriptions/${prescription.id}`)
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-second text-white py-3 rounded-lg font-bold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <FiEye className="text-lg" />
                        <span>عرض التفاصيل</span>
                      </button>
                      <a
                        
                        href={prescription.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary py-3 px-4 rounded-lg font-bold hover:bg-primary hover:text-white transition-all duration-300"
                        title="تحميل المرفق"
                      >
                        <FiDownload className="text-lg" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <div className="text-gray-600 text-sm">
                    عرض{" "}
                    <span className="font-bold text-primary">
                      {prescriptions.length}
                    </span>{" "}
                    من أصل{" "}
                    <span className="font-bold text-primary">{totalCount}</span>{" "}
                    وصفة طبية
                  </div>
                  <div className="text-gray-600 text-sm">
                    الصفحة{" "}
                    <span className="font-bold text-primary">{pageIndex}</span>{" "}
                    من{" "}
                    <span className="font-bold text-primary">{totalPages}</span>
                  </div>
                </div>
                {renderPageButtons()}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default MedicalPrescriptions;
