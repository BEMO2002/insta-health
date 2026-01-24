import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaChevronDown, FaSearch, FaTimes } from "react-icons/fa";
import baseApi from "../api/baseApi";

const Filter = ({
  onFilterChange,
  initialSpecialitySlug,
  initialSubSpecialitySlug,
  initialGovernorateSlug,
  initialCitySlug,
  initialSearchTerm,
}) => {
  // Data states
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [subSpecialities, setSubSpecialities] = useState([]);
  const [loading, setLoading] = useState({
    governorates: true,
    cities: false,
    specialities: true,
    subSpecialities: false,
  });

  // Filter states
  const [selectedGovernorate, setSelectedGovernorate] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);
  const [selectedSubSpeciality, setSelectedSubSpeciality] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");
  const [isFiltering, setIsFiltering] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // Dropdown states
  const [isGovernorateOpen, setIsGovernorateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isSpecialityOpen, setIsSpecialityOpen] = useState(false);
  const [isSubSpecialityOpen, setIsSubSpecialityOpen] = useState(false);

  // Refs
  const searchTimeoutRef = useRef(null);
  const onFilterChangeRef = useRef(onFilterChange);

  // Update ref when onFilterChange changes
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Fetch Governorates - only once
  useEffect(() => {
    const fetchGovernorates = async () => {
      try {
        const response = await baseApi.get("/Governorates");
        if (response.data.success) {
          setGovernorates(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching governorates:", error);
      } finally {
        setLoading((prev) => ({ ...prev, governorates: false }));
      }
    };

    fetchGovernorates();
  }, []);

  // Fetch Medical Specialities Home - only once
  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const response = await baseApi.get("/MedicalSpecialities/home");
        if (response.data.success) {
          setSpecialities(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching specialities:", error);
      } finally {
        setLoading((prev) => ({ ...prev, specialities: false }));
      }
    };

    fetchSpecialities();
  }, []);

  // Fetch Sub Specialities when speciality changes
  useEffect(() => {
    if (selectedSpeciality?.id) {
      const fetchSubSpecialities = async () => {
        try {
          setLoading((prev) => ({ ...prev, subSpecialities: true }));
          // Get sub specialities from the MedicalSpecialities endpoint
          const response = await baseApi.get(
            `/MedicalSpecialities/${selectedSpeciality.id}`,
          );
          if (response.data.success && response.data.data.subSpecialities) {
            setSubSpecialities(response.data.data.subSpecialities);
          } else {
            setSubSpecialities([]);
          }
        } catch (error) {
          console.error("Error fetching sub specialities:", error);
          setSubSpecialities([]);
        } finally {
          setLoading((prev) => ({ ...prev, subSpecialities: false }));
        }
      };

      fetchSubSpecialities();
    } else {
      setSubSpecialities([]);
      setSelectedSubSpeciality(null);
    }
  }, [selectedSpeciality]);

  // Fetch Cities when governorate changes
  useEffect(() => {
    if (selectedGovernorate?.id) {
      const fetchCities = async () => {
        try {
          setLoading((prev) => ({ ...prev, cities: true }));
          const response = await baseApi.get(
            `/Governorates/cities/${selectedGovernorate.id}`,
          );
          if (response.data.success) {
            setCities(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
        } finally {
          setLoading((prev) => ({ ...prev, cities: false }));
        }
      };

      fetchCities();
    } else {
      setCities([]);
      setSelectedCity(null);
    }
  }, [selectedGovernorate]);

  // Initialize filters from props - only when data is loaded
  useEffect(() => {
    if (loading.governorates || loading.specialities) {
      return;
    }

    // Set speciality
    if (initialSpecialitySlug && specialities.length > 0) {
      const speciality = specialities.find(
        (item) => item.slug === initialSpecialitySlug,
      );
      if (speciality) {
        setSelectedSpeciality(speciality);
      }
    }

    // Set governorate
    if (initialGovernorateSlug && governorates.length > 0) {
      const governorate = governorates.find(
        (item) => item.slug === initialGovernorateSlug,
      );
      if (governorate) {
        setSelectedGovernorate(governorate);
      }
    }

    // Set search term
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [
    initialSpecialitySlug,
    initialGovernorateSlug,
    initialSearchTerm,
    specialities,
    governorates,
    loading.governorates,
    loading.specialities,
  ]);

  // Set sub speciality after sub specialities are loaded
  // Set sub speciality after sub specialities are loaded
  useEffect(() => {
    if (initialSubSpecialitySlug && subSpecialities.length > 0) {
      const subSpeciality = subSpecialities.find(
        (item) => item.slug === initialSubSpecialitySlug,
      );
      if (subSpeciality) {
        setSelectedSubSpeciality(subSpeciality);
      }
    }
  }, [initialSubSpecialitySlug, subSpecialities]);

  useEffect(() => {
    if (initialCitySlug && cities.length > 0) {
      const city = cities.find((item) => item.slug === initialCitySlug);
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [initialCitySlug, cities]);

  // Apply filters with debounce
  useEffect(() => {
    const filters = {
      governorateSlug: selectedGovernorate?.slug || null,
      citySlug: selectedCity?.slug || null,
      specialitySlug: selectedSpeciality?.slug || null,
      subSpecialitySlug: selectedSubSpeciality?.slug || null,
      searchTerm: searchTerm.trim(),
    };

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Show loading with smooth transition
    setIsFiltering(true);
    setTimeout(() => setShowLoading(true), 100);

    searchTimeoutRef.current = setTimeout(() => {
      if (onFilterChangeRef.current) {
        onFilterChangeRef.current(filters);
      }
      // Hide loading with smooth transition
      setTimeout(() => {
        setShowLoading(false);
        setTimeout(() => setIsFiltering(false), 300);
      }, 600);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [
    selectedGovernorate?.slug,
    selectedCity?.slug,
    selectedSpeciality?.slug,
    selectedSubSpeciality?.slug,
    searchTerm,
  ]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsGovernorateOpen(false);
        setIsCityOpen(false);
        setIsSpecialityOpen(false);
        setIsSubSpecialityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Event handlers
  const handleGovernorateSelect = useCallback((governorate) => {
    setSelectedGovernorate(governorate);
    setSelectedCity(null);
    setIsGovernorateOpen(false);
  }, []);

  const handleCitySelect = useCallback((city) => {
    setSelectedCity(city);
    setIsCityOpen(false);
  }, []);

  const handleSpecialitySelect = useCallback((speciality) => {
    setSelectedSpeciality(speciality);
    setSelectedSubSpeciality(null);
    setIsSpecialityOpen(false);
  }, []);

  const handleSubSpecialitySelect = useCallback((subSpeciality) => {
    setSelectedSubSpeciality(subSpeciality);
    setIsSubSpecialityOpen(false);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedGovernorate(null);
    setSelectedCity(null);
    setSelectedSpeciality(null);
    setSelectedSubSpeciality(null);
    setSearchTerm("");
    setIsGovernorateOpen(false);
    setIsCityOpen(false);
    setIsSpecialityOpen(false);
    setIsSubSpecialityOpen(false);
  }, []);

  // Dropdown component
  const Dropdown = useCallback(
    ({
      isOpen,
      setIsOpen,
      selectedItem,
      items,
      onSelect,
      placeholder,
      loading: isLoading,
      disabled = false,
    }) => (
      <div className="relative dropdown-container">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-3 text-right border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent transition-colors duration-200 ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between">
            <FaChevronDown
              className={`text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
            <span
              className={`${selectedItem ? "text-gray-900" : "text-gray-500"}`}
            >
              {selectedItem
                ? selectedItem.arabicName || selectedItem.name || "غير محدد"
                : placeholder}
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-second mx-auto"></div>
              </div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="w-full px-4 py-3 text-right hover:bg-second hover:text-white transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                >
                  {item.arabicName || item.name || "غير محدد"}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                لا توجد عناصر متاحة
              </div>
            )}
          </div>
        )}
      </div>
    ),
    [],
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-primary">فلترة النتائج</h3>
          {isFiltering && (
            <div
              className={`flex items-center gap-2 text-sm text-gray-500 transition-all duration-300 ${
                showLoading
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2"
              }`}
            >
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
              <span>جاري التحديث...</span>
            </div>
          )}
        </div>
        <button
          onClick={clearFilters}
          className="flex items-center text-gray-500 hover:text-red-600 transition-colors duration-200"
        >
          <FaTimes className="ml-2" size={14} />
          مسح الفلاتر
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البحث بالاسم
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن اسم الخدمة..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent"
            />
            {isFiltering && searchTerm && (
              <div
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  showLoading ? "opacity-100 scale-100" : "opacity-0 scale-75"
                }`}
              >
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Speciality Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الخدمة
          </label>
          <Dropdown
            isOpen={isSpecialityOpen}
            setIsOpen={setIsSpecialityOpen}
            selectedItem={selectedSpeciality}
            items={specialities}
            onSelect={handleSpecialitySelect}
            placeholder="اختر نوع الخدمة"
            loading={loading.specialities}
          />
        </div>

        {/* Sub Speciality Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التخصص الفرعي
          </label>
          <Dropdown
            isOpen={isSubSpecialityOpen}
            setIsOpen={setIsSubSpecialityOpen}
            selectedItem={selectedSubSpeciality}
            items={subSpecialities}
            onSelect={handleSubSpecialitySelect}
            placeholder="اختر التخصص الفرعي"
            loading={loading.subSpecialities}
            disabled={!selectedSpeciality}
          />
        </div>

        {/* Governorate Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المحافظة
          </label>
          <Dropdown
            isOpen={isGovernorateOpen}
            setIsOpen={setIsGovernorateOpen}
            selectedItem={selectedGovernorate}
            items={governorates}
            onSelect={handleGovernorateSelect}
            placeholder="اختر المحافظة"
            loading={loading.governorates}
          />
        </div>

        {/* City Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المدينة
          </label>
          <Dropdown
            isOpen={isCityOpen}
            setIsOpen={setIsCityOpen}
            selectedItem={selectedCity}
            items={cities}
            onSelect={handleCitySelect}
            placeholder="اختر المدينة"
            loading={loading.cities}
            disabled={!selectedGovernorate}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedGovernorate ||
        selectedCity ||
        selectedSpeciality ||
        selectedSubSpeciality ||
        searchTerm) &&
        !loading.governorates &&
        !loading.specialities &&
        !loading.cities &&
        !loading.subSpecialities && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">الفلاتر النشطة:</span>

              {selectedSpeciality?.name && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-second text-white">
                  {selectedSpeciality.name}
                  <button
                    onClick={() => {
                      setSelectedSpeciality(null);
                      setSelectedSubSpeciality(null);
                      setIsSpecialityOpen(false);
                    }}
                    className="mr-2 hover:text-red-200"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}

              {selectedSubSpeciality?.name && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500 text-white">
                  {selectedSubSpeciality.name}
                  <button
                    onClick={() => {
                      setSelectedSubSpeciality(null);
                      setIsSubSpecialityOpen(false);
                    }}
                    className="mr-2 hover:text-red-200"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}

              {selectedGovernorate?.arabicName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary text-white">
                  {selectedGovernorate.arabicName}
                  <button
                    onClick={() => {
                      setSelectedGovernorate(null);
                      setSelectedCity(null);
                      setIsGovernorateOpen(false);
                    }}
                    className="mr-2 hover:text-red-200"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}

              {selectedCity?.arabicName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-600 text-white">
                  {selectedCity.arabicName}
                  <button
                    onClick={() => {
                      setSelectedCity(null);
                      setIsCityOpen(false);
                    }}
                    className="mr-2 hover:text-red-200"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-600 text-white">
                  "{searchTerm}"
                  <button
                    onClick={() => {
                      setSearchTerm("");
                    }}
                    className="mr-2 hover:text-red-200"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default Filter;
