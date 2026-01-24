import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaStar, FaUser, FaGraduationCap, FaBriefcase } from "react-icons/fa";
import baseApi from "../api/baseApi";
import Filter from "./Filter";

const HomeProviders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDataChanging, setIsDataChanging] = useState(false);
  const pageSize = 8;

  // Ref for fetchProviders to prevent re-creation
  const fetchProvidersRef = useRef();

  // Filters state
  const [filters, setFilters] = useState({
    governorateSlug: null,
    citySlug: null,
    specialitySlug: null,
    subSpecialitySlug: null,
    searchTerm: "",
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const specialitySlug = searchParams.get("speciality");
    const governorateSlug = searchParams.get("governorate");
    const citySlug = searchParams.get("city");
    const subSpecialitySlug = searchParams.get("subSpeciality");
    const searchTerm = searchParams.get("search");

    setFilters({
      specialitySlug: specialitySlug || null,
      governorateSlug: governorateSlug || null,
      citySlug: citySlug || null,
      subSpecialitySlug: subSpecialitySlug || null,
      searchTerm: searchTerm || "",
    });
  }, [searchParams]);

  // Fetch providers function
  const fetchProviders = useCallback(async () => {
    try {
      setProvidersLoading(true);
      setIsDataChanging(true);

      const params = {
        PageIndex: pageIndex,
        PageSize: pageSize,
      };

      // Add filters to API parameters
      if (filters.specialitySlug) {
        params.SpecialitySlug = filters.specialitySlug;
      }
      if (filters.subSpecialitySlug) {
        params.SubSpecialitySlug = filters.subSpecialitySlug;
      }
      if (filters.governorateSlug) {
        params.GovernorateSlug = filters.governorateSlug;
      }
      if (filters.citySlug) {
        params.CitySlug = filters.citySlug;
      }
      if (filters.searchTerm) {
        params.SearchName = filters.searchTerm;
      }

      const response = await baseApi.get("/HomeProviders", { params });

      if (response.data.success) {
        // Add delay for smooth transition
        setTimeout(() => {
          setProviders(response.data.data.items);
          setTotalCount(response.data.data.count);
          setIsDataChanging(false);
        }, 300);
      } else {
        setError("فشل في تحميل البيانات");
        setIsDataChanging(false);
      }
    } catch (err) {
      setError("حدث خطأ في تحميل البيانات");
      console.error("Error fetching providers:", err);
      setIsDataChanging(false);
    } finally {
      setProvidersLoading(false);
    }
  }, [pageIndex, filters, pageSize]);

  // Update ref when fetchProviders changes
  useEffect(() => {
    fetchProvidersRef.current = fetchProviders;
  }, [fetchProviders]);

  // Fetch data when filters or page changes
  useEffect(() => {
    if (fetchProvidersRef.current) {
      fetchProvidersRef.current();
    }
  }, [
    pageIndex,
    filters.specialitySlug,
    filters.subSpecialitySlug,
    filters.governorateSlug,
    filters.citySlug,
    filters.searchTerm,
    pageSize,
  ]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters) => {
      // Check if filters actually changed
      const filtersChanged =
        newFilters.specialitySlug !== filters.specialitySlug ||
        newFilters.subSpecialitySlug !== filters.subSpecialitySlug ||
        newFilters.governorateSlug !== filters.governorateSlug ||
        newFilters.citySlug !== filters.citySlug ||
        newFilters.searchTerm !== filters.searchTerm;

      setFilters(newFilters);

      // Only reset to page 1 if filters actually changed
      if (filtersChanged) {
        setPageIndex(1);
      }

      // Update URL parameters
      const newParams = {};
      if (newFilters.specialitySlug) {
        newParams.speciality = newFilters.specialitySlug;
      }
      if (newFilters.subSpecialitySlug) {
        newParams.subSpeciality = newFilters.subSpecialitySlug;
      }
      if (newFilters.governorateSlug) {
        newParams.governorate = newFilters.governorateSlug;
      }
      if (newFilters.citySlug) {
        newParams.city = newFilters.citySlug;
      }
      if (newFilters.searchTerm) {
        newParams.search = newFilters.searchTerm;
      }

      // Reset page to 1 when filters change
      if (filtersChanged) {
        newParams.page = "1";
      }

      setSearchParams(newParams, { replace: true });
    },
    [setSearchParams, filters],
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= Math.ceil(totalCount / pageSize)) {
        setPageIndex(newPage);

        // Update URL with new page
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", newPage.toString());
        setSearchParams(newParams, { replace: true });

        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalCount, pageSize, searchParams, setSearchParams],
  );

  // Generate page numbers for pagination
  const getPageNumbers = useCallback(() => {
    const totalPages = Math.ceil(totalCount / pageSize);
    const maxPagesToShow = 3;
    const pages = [];
    let startPage = Math.max(1, pageIndex - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [pageIndex, totalCount, pageSize]);

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Check if there are any active filters
  const hasActiveFilters =
    filters.specialitySlug ||
    filters.subSpecialitySlug ||
    filters.governorateSlug ||
    filters.citySlug ||
    filters.searchTerm;

  if (providers.length === 0 && !providersLoading && !hasActiveFilters) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p>لا توجد مقدمي خدمات متاحين حالياً</p>
          </div>
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            مزودي الخدمات المنزلية
          </h2>
          <p className="text-gray-600 text-lg">
            اكتشف أفضل مزودي الخدمات الطبية المنزلية المتاحين
          </p>
        </div>

        <Filter
          onFilterChange={handleFilterChange}
          initialSpecialitySlug={filters.specialitySlug}
          initialSubSpecialitySlug={filters.subSpecialitySlug}
          initialGovernorateSlug={filters.governorateSlug}
          initialCitySlug={filters.citySlug}
          initialSearchTerm={filters.searchTerm}
        />

        {/* Loading overlay for providers only */}
        {providersLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch transition-all duration-500 ${
            isDataChanging ? "opacity-50 scale-95" : "opacity-100 scale-100"
          } ${providersLoading ? "hidden" : "block"}`}
        >
          {providers.map((provider, index) => (
            <div
              key={provider.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 h-auto flex flex-col overflow-hidden animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="relative">
                <img
                  src={provider.imageUrl}
                  alt={provider.name}
                  className="w-full h-60 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x200?text=No+Image";
                  }}
                />
                <div className="absolute top-4 left-4 flex items-center bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                  <FaStar className="ml-1" size={12} />
                  {provider.rate}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-2">
                  {provider.name}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FaGraduationCap className="text-second ml-2" size={14} />
                    <span className="font-medium ml-2">الدرجة العلمية:</span>
                    <span>{provider.academicDegree}</span>
                  </div>

                  <div className="flex items-center">
                    <FaBriefcase className="text-second ml-2" size={14} />
                    <span className="font-medium ml-2">الخبرة:</span>
                    <span className="line-clamp-1">{provider.expirence}</span>
                  </div>

                  <div className="flex items-center">
                    <FaUser className="text-second ml-2" size={14} />
                    <span className="font-medium ml-2">الهاتف:</span>
                    <span>{provider.mobile}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <FaStar
                            key={i}
                            className={`${
                              i < Math.floor(provider.rate)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            size={14}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 mr-2">
                        ({provider.rate})
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/home-providers/${provider.slug}`)
                      }
                      className="bg-second text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors duration-300"
                    >
                      تفاصيل الخدمه
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {providers.length === 0 && !providersLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              لا توجد نتائج مطابقة للفلاتر المحددة
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalCount > pageSize && !providersLoading && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(pageIndex - 1)}
              disabled={pageIndex === 1}
              className="px-4 py-2 bg-second text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg ${
                  page === pageIndex
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pageIndex + 1)}
              disabled={pageIndex === totalPages}
              className="px-4 py-2 bg-second text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </section>
  );
};

export default HomeProviders;
