import React, { useState, useEffect, useCallback } from "react";
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
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await baseApi.get("/ServicesProviders");

        if (response.data.success) {
          setProviders(response.data.data.items);
          setFilteredProviders(response.data.data.items);
        } else {
          setError("فشل في تحميل البيانات");
        }
      } catch (err) {
        setError("حدث خطأ في تحميل البيانات");
        console.error("Error fetching providers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Filter providers based on selected filters
  useEffect(() => {
    let filtered = [...providers];

    // Filter by search term
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (provider) =>
          provider.name
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          provider.description
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filter by speciality
    if (filters.specialityId) {
      filtered = filtered.filter(
        (provider) => provider.specialityId === filters.specialityId
      );
    }

    // Filter by governorate
    if (filters.governorateId) {
      filtered = filtered.filter(
        (provider) =>
          provider.cityId &&
          provider.goverorateName === getGovernorateName(filters.governorateId)
      );
    }

    // Filter by city
    if (filters.cityId) {
      filtered = filtered.filter(
        (provider) => provider.cityId === filters.cityId
      );
    }

    setFilteredProviders(filtered);
  }, [providers, filters]);

  const getGovernorateName = () => {
    // This would need to be implemented based on your governorate data
    // For now, we'll use the existing governorateName from the provider data
    return null;
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

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

  if (providers.length === 0) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
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

        {filteredProviders.length === 0 && providers.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              لا توجد نتائج مطابقة للفلاتر المحددة
            </p>
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
      `}</style>
    </section>
  );
};

export default Providers;
