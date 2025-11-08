import React from 'react';
import { FiStar, FiX } from 'react-icons/fi';

const DoctorsPopup = ({ isOpen, onClose, specialty, doctors, onBookDoctor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-30 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{specialty?.name}</h3>
            <p className="text-sm opacity-90 mt-1">الأطباء المتاحون</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:text-primary rounded-full p-2 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Doctors List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {doctors && doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div 
                  key={doctor.id} 
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Doctor Image */}
                  <div className="relative h-48">
                    <img
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e5e7eb" width="300" height="200"/%3E%3Ctext fill="%234b5563" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3Eدكتور%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Doctor Info */}
                  <div className="p-4">
                    <h5 className="text-lg font-bold text-gray-800 mb-1">{doctor.name}</h5>
                    <p className="text-sm text-second font-medium mb-2">{doctor.speciality}</p>
                    
                    {/* Rating */}
                    {doctor.rate && (
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              className={`w-4 h-4 ${
                                star <= doctor.rate
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 mr-2">({doctor.rate}/5)</span>
                      </div>
                    )}

                    {/* Experience */}
                    {doctor.expirence && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{doctor.expirence}</p>
                    )}

                    {/* Price */}
                    {doctor.reservationPrice && (
                      <div className="mb-3 bg-primary/10 p-2 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 font-semibold">رسوم الاستشارة:</span>
                          <span className="text-lg font-bold text-primary">{doctor.reservationPrice} $</span>
                        </div>
                      </div>
                    )}

                    {/* Booking Button */}
                    <button
                      onClick={() => onBookDoctor(doctor)}
                      className="w-full bg-primary hover:bg-second text-white py-2 rounded-lg font-semibold transition-colors duration-300"
                    >
                      احجز استشارة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">لا يوجد أطباء متاحون حالياً في هذا التخصص</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPopup;
