import React, { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import baseApi from "../api/baseApi";

const MotionDiv = motion.div;

const Faq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await baseApi.get("/FQs");
        if (response.data.success) {
          setFaqs(response.data.data.items);
          if (
            !response.data.data.items ||
            response.data.data.items.length === 0
          ) {
            setError("لا توجد أسئلة متاحة حالياً");
          }
        } else {
          setError("تعذر تحميل الأسئلة الشائعة");
        }
      } catch {
        setError("تعذر تحميل الأسئلة الشائعة");
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              الأسئلة الشائعة
            </h2>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-second font-bold  mb-4">
            الأسئلة الشائعة
          </h2>
        </div>

        {error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-center text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <MotionDiv
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`border border-gray-200 rounded-lg transition-all duration-300 ${
                  expandedId === faq.id
                    ? "bg-white"
                    : "bg-white hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full px-6 py-4 text-right flex items-center justify-between focus:outline-none"
                >
                  <span
                    className={`text-lg font-semibold ${
                      expandedId === faq.id ? "text-gray-800" : "text-gray-800"
                    }`}
                  >
                    {faq.title}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiChevronDown
                      className={`w-5 h-5 transition-colors duration-300 ${
                        expandedId === faq.id
                          ? "text-gray-500"
                          : "text-gray-500"
                      }`}
                    />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pt-6 pb-6 bg-second">
                        <p className="text-white leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </MotionDiv>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Faq;
