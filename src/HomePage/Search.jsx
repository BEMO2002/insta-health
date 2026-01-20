import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import baseApi from "../api/baseApi";

const Search = () => {
  const [specialities, setSpecialities] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [isSpecialityOpen, setIsSpecialityOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const specialityRef = useRef(null);

  // Fetch medical specialities
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
        setLoading(false);
      }
    };

    fetchSpecialities();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        specialityRef.current &&
        !specialityRef.current.contains(event.target)
      ) {
        setIsSpecialityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedSpeciality) params.append("speciality", selectedSpeciality);
    navigate(`/providers?${params.toString()}`);
  };

  const getSpecialityName = (id) => {
    const spec = specialities.find((s) => s.id === parseInt(id));
    return spec ? spec.name : "اختر التخصص";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="" dir="rtl">
      <div className=" mx-auto ">
        <div className="max-w-xl mx-auto">
          <div className=" rounded-lg p-4 items-start relative z-50">
            <div className="flex flex-row items-start gap-4 text-right">
              {/* Speciality Dropdown */}
              <div className="relative flex-1" ref={specialityRef}>
                <button
                  onClick={() => setIsSpecialityOpen(!isSpecialityOpen)}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-primary transition-colors text-right"
                >
                  <span className="text-gray-700">
                    {getSpecialityName(selectedSpeciality)}
                  </span>
                  <FiChevronDown className="text-gray-500" />
                </button>

                {isSpecialityOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedSpeciality("");
                        setIsSpecialityOpen(false);
                      }}
                      className="w-full text-right p-3 hover:bg-gray-100 text-gray-700"
                    >
                      جميع التخصصات
                    </button>
                    {specialities.map((spec) => (
                      <button
                        key={spec.id}
                        onClick={() => {
                          setSelectedSpeciality(spec.id);
                          setIsSpecialityOpen(false);
                        }}
                        className="w-full text-right p-3 hover:bg-gray-100 text-gray-700"
                      >
                        {spec.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center text-right"
              >
                <FiSearch className="text-lg" />
                بحث
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
