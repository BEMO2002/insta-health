import React, { useState, useEffect } from "react";
import { FaChevronDown, FaSearch, FaTimes } from "react-icons/fa";
import baseApi from "../api/baseApi";

const Filtration = ({ onFilterChange }) => {
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState({
    governorates: true,
    cities: false,
    specialities: true,
  });

  // Filter states
  const [selectedGovernorate, setSelectedGovernorate] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Dropdown states
  const [isGovernorateOpen, setIsGovernorateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isSpecialityOpen, setIsSpecialityOpen] = useState(false);

  // Fetch Governorates
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

  // Fetch Medical Specialities
  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const response = await baseApi.get("/MedicalSpecialities");
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

  // Fetch Cities when governorate changes
  useEffect(() => {
    if (selectedGovernorate) {
      const fetchCities = async () => {
        try {
          setLoading((prev) => ({ ...prev, cities: true }));
          const response = await baseApi.get(
            `/Governorates/cities/${selectedGovernorate.id}`
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

  // Apply filters when any filter changes
  useEffect(() => {
    const filters = {
      governorateId: selectedGovernorate?.id || null,
      cityId: selectedCity?.id || null,
      specialityId: selectedSpeciality?.id || null,
      searchTerm: searchTerm.trim(),
    };

    onFilterChange(filters);
  }, [
    selectedGovernorate,
    selectedCity,
    selectedSpeciality,
    searchTerm,
    onFilterChange,
  ]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsGovernorateOpen(false);
        setIsCityOpen(false);
        setIsSpecialityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGovernorateSelect = (governorate) => {
    setSelectedGovernorate(governorate);
    setSelectedCity(null);
    setIsGovernorateOpen(false);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setIsCityOpen(false);
  };

  const handleSpecialitySelect = (speciality) => {
    setSelectedSpeciality(speciality);
    setIsSpecialityOpen(false);
  };

  const clearFilters = () => {
    setSelectedGovernorate(null);
    setSelectedCity(null);
    setSelectedSpeciality(null);
    setSearchTerm("");
  };

  const Dropdown = ({
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
              ? selectedItem.arabicName || selectedItem.name
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
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="w-full px-4 py-3 text-right hover:bg-second hover:text-white transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
              >
                {item.arabicName || item.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary">فلترة النتائج</h3>
        <button
          onClick={clearFilters}
          className="flex items-center text-gray-500 hover:text-red-600 transition-colors duration-200"
        >
          <FaTimes className="ml-2" size={14} />
          مسح الفلاتر
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        searchTerm) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">الفلاتر النشطة:</span>

            {selectedSpeciality && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-second text-white">
                {selectedSpeciality.name}
                <button
                  onClick={() => setSelectedSpeciality(null)}
                  className="mr-2 hover:text-red-200"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            )}

            {selectedGovernorate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary text-white">
                {selectedGovernorate.arabicName}
                <button
                  onClick={() => setSelectedGovernorate(null)}
                  className="mr-2 hover:text-red-200"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            )}

            {selectedCity && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-600 text-white">
                {selectedCity.arabicName}
                <button
                  onClick={() => setSelectedCity(null)}
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
                  onClick={() => setSearchTerm("")}
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

export default Filtration;
