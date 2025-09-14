import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaCity,
  FaBuilding,
  FaCodeBranch,
  FaUser,
} from "react-icons/fa";
import baseApi from "../api/baseApi";
import Filtration from "../Components/Filtration";

const Providers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDataChanging, setIsDataChanging] = useState(false);
  const pageSize = 5;

  // Ref for fetchProviders to prevent re-creation
  const fetchProvidersRef = useRef();

  // Filters state
  const [filters, setFilters] = useState({
    governorateId: null,
    cityId: null,
    specialityId: null,
    searchTerm: "",
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const specialityId = searchParams.get("speciality");
    const governorateId = searchParams.get("governorate");
    const cityId = searchParams.get("city");
    const searchTerm = searchParams.get("search");

    setFilters({
      specialityId: specialityId ? parseInt(specialityId) : null,
      governorateId: governorateId ? parseInt(governorateId) : null,
      cityId: cityId ? parseInt(cityId) : null,
      searchTerm: searchTerm || "",
    });
  }, [searchParams]);

  // Fetch providers function
  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setIsDataChanging(true);

      const params = {
        PageIndex: pageIndex,
        PageSize: pageSize,
      };

      // Add filters to API parameters
      if (filters.specialityId) {
        params.MedicalSpecialityId = filters.specialityId;
      }
      if (filters.governorateId) {
        params.GovernorateId = filters.governorateId;
      }
      if (filters.cityId) {
        params.CityId = filters.cityId;
      }
      if (filters.searchTerm) {
        params.SearchName = filters.searchTerm;
      }

      const response = await baseApi.get("/ServicesProviders", { params });

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
      setLoading(false);
    }
  }, [
    pageIndex,
    filters.specialityId,
    filters.governorateId,
    filters.cityId,
    filters.searchTerm,
    pageSize,
  ]);

  // Update ref when fetchProviders changes
  useEffect(() => {
    fetchProvidersRef.current = fetchProviders;
  }, [fetchProviders]);

  // Fetch data when filters or page changes
  useEffect(() => {
    fetchProvidersRef.current();
  }, [
    pageIndex,
    filters.specialityId,
    filters.governorateId,
    filters.cityId,
    filters.searchTerm,
    pageSize,
  ]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters) => {
      // Check if filters actually changed
      const filtersChanged =
        newFilters.specialityId !== filters.specialityId ||
        newFilters.governorateId !== filters.governorateId ||
        newFilters.cityId !== filters.cityId ||
        newFilters.searchTerm !== filters.searchTerm;

      setFilters(newFilters);

      // Only reset to page 1 if filters actually changed
      if (filtersChanged) {
        setPageIndex(1);
      }

      // Update URL parameters
      const newParams = {};
      if (newFilters.specialityId) {
        newParams.speciality = newFilters.specialityId.toString();
      }
      if (newFilters.governorateId) {
        newParams.governorate = newFilters.governorateId.toString();
      }
      if (newFilters.cityId) {
        newParams.city = newFilters.cityId.toString();
      }
      if (newFilters.searchTerm) {
        newParams.search = newFilters.searchTerm;
      }

      setSearchParams(newParams, { replace: true });
    },
    [
      setSearchParams,
      filters.specialityId,
      filters.governorateId,
      filters.cityId,
      filters.searchTerm,
    ]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= Math.ceil(totalCount / pageSize)) {
        setPageIndex(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalCount, pageSize]
  );

  // Generate page numbers for pagination
  const getPageNumbers = useCallback(() => {
    const totalPages = Math.ceil(totalCount / pageSize);
    const maxPagesToShow = 5;
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

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
          </div>
        </div>
      </section>
    );
  }

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
    filters.specialityId ||
    filters.governorateId ||
    filters.cityId ||
    filters.searchTerm;

  if (providers.length === 0 && !loading && !hasActiveFilters) {
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
            مقدمي الخدمات الطبية
          </h2>
          <p className="text-gray-600 text-lg">
            اكتشف أفضل مقدمي الخدمات الطبية المتاحين
          </p>
        </div>

        <Filtration
          onFilterChange={handleFilterChange}
          initialSpecialityId={filters.specialityId}
          initialGovernorateId={filters.governorateId}
          initialCityId={filters.cityId}
          initialSearchTerm={filters.searchTerm}
        />

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-500 ${
            isDataChanging ? "opacity-50 scale-95" : "opacity-100 scale-100"
          }`}
        >
          {providers.map((provider, index) => (
            <div
              key={provider.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="relative">
                <img
                  src={provider.imageCover}
                  alt={provider.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x200?text=No+Image";
                  }}
                />
                <div className="absolute top-4 right-4 bg-second text-white px-3 py-1 rounded-full text-sm font-medium">
                  {provider.specialityName}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-2">
                  {provider.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {provider.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-second ml-2" size={14} />
                    <span className="font-medium ml-2">العنوان:</span>
                    <span>{provider.address}</span>
                  </div>

                  <div className="flex items-center">
                    <FaCity className="text-second ml-2" size={14} />
                    <span className="font-medium ml-2">المدينة:</span>
                    <span>{provider.cityName}</span>
                  </div>

                  <div className="flex items-center">
                    <FaBuilding className="text-second ml-2" size={14} />
                    <span className="font-medium ml-2">المحافظة:</span>
                    <span>{provider.goverorateName}</span>
                  </div>

                  {provider.branches && (
                    <div className="flex items-center">
                      <FaCodeBranch className="text-second ml-2" size={14} />
                      <span className="font-medium ml-2">الفروع:</span>
                      <span>{provider.branches}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center">
                      <FaUser className="text-gray-400 ml-2" size={14} />
                      مالك: {provider.ownerName}
                    </span>
                    <button
                      onClick={() => navigate(`/providers/${provider.id}`)}
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

        {providers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              لا توجد نتائج مطابقة للفلاتر المحددة
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalCount > pageSize && (
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
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

export default Providers;
