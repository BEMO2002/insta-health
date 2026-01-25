import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import baseApi from "../api/baseApi";
import { FiArrowRight } from "react-icons/fi";

const WhyDetails = () => {
  const { slug } = useParams();
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const response = await baseApi.get(`/MedicalFeatures/${slug}`);

        if (response.data.success) {
          setFeature(response.data.data);
        } else {
          setError("لم يتم العثور على البيانات المطلوبة");
        }
      } catch (err) {
        console.error("Error fetching feature details:", err);
        setError("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchFeature();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <p className="text-xl text-red-600 mb-4">
          {error || "المحتوى غير موجود"}
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 text-primary hover:text-second font-bold"
        >
          <FiArrowRight />
          العودة
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <FiArrowRight />
            <span>العودة </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-[400px] w-full bg-gray-50 relative">
            <img
              src={feature.imageUrl}
              alt={feature.title}
              className="w-full h-full object-contain p-8 md:p-12"
            />
          </div>

          <div className="p-8 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 border-b border-gray-300 pb-4">
              {feature.title}
            </h1>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed text-lg">
              {feature.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyDetails;
