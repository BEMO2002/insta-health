import React, { useState, useEffect } from "react";
import baseApi from "../api/baseApi";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const HomePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [popupData, setPopupData] = useState(null);

  useEffect(() => {
    // Check if the popup has been closed previously
    const hasClosedPopup = localStorage.getItem("homePopupClosed");

    if (!hasClosedPopup) {
      fetchPopupData();
    }
  }, []);

  const fetchPopupData = async () => {
    try {
      const response = await baseApi.get("/Advertisments");
      if (response.data && response.data.success) {
        // Filter for placement 'Popup'
        const popups = response.data.data.filter(
          (ad) => ad.placement === "Popup",
        );

        // If we have at least one popup, show the first one
        if (popups.length > 0) {
          setPopupData(popups[0]);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Set flag in localStorage so it doesn't appear again
    localStorage.setItem("homePopupClosed", "true");
  };

  if (!isVisible || !popupData) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleClose} // Close when clicking outside
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full transition-colors shadow-lg"
            >
              <FiX size={24} />
            </button>

            {/* Content */}
            <div className="flex flex-col">
              {popupData.imageUrl && (
                <div className="w-full relative">
                  {popupData.redirectUrl ? (
                    <a
                      href={
                        popupData.redirectUrl.startsWith("http")
                          ? popupData.redirectUrl
                          : `https://${popupData.redirectUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <img
                        src={popupData.imageUrl}
                        alt={popupData.description || "Advertisement"}
                        className="w-full h-auto max-h-[50vh] object-contain bg-gray-50"
                      />
                    </a>
                  ) : (
                    <img
                      src={popupData.imageUrl}
                      alt={popupData.description || "Advertisement"}
                      className="w-full h-auto max-h-[50vh] object-contain bg-gray-50"
                    />
                  )}

                  {/* Description */}
                  <div>
                    <p className="text-right text-sm font-semibold p-4 pb-0 text-gray-800">
                      {popupData.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {popupData.redirectUrl && (
                <div className="p-4 flex justify-center pb-6">
                  <a
                    href={
                      popupData.redirectUrl.startsWith("http")
                        ? popupData.redirectUrl
                        : `https://${popupData.redirectUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-6 py-2 rounded-2xl font-semibold hover:bg-opacity-90 transition-all shadow-lg text-md min-w-[150px] text-center"
                  >
                    اضغط هنا للتفاصيل
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomePopup;
