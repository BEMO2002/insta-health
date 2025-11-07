import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";

const PackageReservationDetails = () => {
  const { reservationNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservation, setReservation] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Get payment status from query parameters (webhook callback)
  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const paymentStatusFromQuery = query.get("paymentStatus");

  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservationNumber) return;
      try {
        setLoading(true);
        setError("");
        const res = await baseApi.get(`/MedicalTourismPackageReservations/${reservationNumber}`);
        if (res.data?.success && res.data?.data) {
          setReservation(res.data.data);
        } else {
          setError("تعذر تحميل بيانات الحجز");
        }
      } catch (err) {
        console.error('Error fetching reservation:', err);
        setError("تعذر تحميل بيانات الحجز");
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [reservationNumber]);

  // Auto-refresh if payment is pending
  useEffect(() => {
    if (!reservation) return;
    const status = (reservation.paymentStatus || "").toString().toLowerCase();
    if (status !== "pending") return;
    
    const intervalId = setInterval(async () => {
      try {
        const res = await baseApi.get(`/MedicalTourismPackageReservations/${reservationNumber}`);
        if (res.data?.success && res.data?.data) {
          setReservation(res.data.data);
        }
      } catch (err) {
        console.error('Error refreshing reservation:', err);
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [reservation, reservationNumber]);

  const handlePayment = async () => {
    if (!reservation) return;

    try {
      setPaymentLoading(true);
      
      // Call payment initiation endpoint
      const response = await baseApi.post(`/MedicalTourismPackageReservations/${reservationNumber}/pay`);
      
      if (response.data?.success && response.data?.data?.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error('فشل في إنشاء رابط الدفع');
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء معالجة الدفع');
    } finally {
      setPaymentLoading(false);
    }
  };

  const isPaid = reservation?.paymentStatus?.toLowerCase() === "paid";
  const isPending = reservation?.paymentStatus?.toLowerCase() === "pending";
  const isFailed = 
    reservation?.paymentStatus?.toLowerCase() === "failed" ||
    reservation?.paymentStatus?.toLowerCase() === "cancelled";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section className="py-16 bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            تفاصيل حجز الباقة الطبية
          </h1>
          <p className="text-gray-600 mt-2">
            رقم الحجز: {reservationNumber}
          </p>
          {paymentStatusFromQuery && (
            <p className="text-gray-500 mt-1">
              حالة الدفع (من مزود الخدمة): {paymentStatusFromQuery}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              to="/"
              className="inline-block px-6 py-2 rounded-lg bg-primary text-white hover:bg-second"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        ) : !reservation ? (
          <div className="bg-white p-6 rounded-xl shadow text-center text-gray-600">
            لا توجد بيانات لهذا الحجز
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow">
            {/* Payment Status Banner */}
            <div className="mb-6">
              {isPaid && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <h3 className="text-lg font-bold text-green-800">تم الدفع بنجاح</h3>
                      <p className="text-green-700 mt-1">
                        شكراً لك! تم تأكيد حجزك وسيتم التواصل معك قريباً.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {isPending && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <h3 className="text-lg font-bold text-yellow-800">في انتظار الدفع</h3>
                      <p className="text-yellow-700 mt-1">
                        يرجى إتمام عملية الدفع لتأكيد حجزك.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {isFailed && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <h3 className="text-lg font-bold text-red-800">فشل الدفع</h3>
                      <p className="text-red-700 mt-1">
                        نأسف، لم تكتمل عملية الدفع. يرجى المحاولة مرة أخرى.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reservation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border-b border-gray-200 pb-3">
                <div className="text-sm text-gray-500 mb-1">اسم العميل</div>
                <div className="font-semibold text-gray-900">{reservation.userName}</div>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="text-sm text-gray-500 mb-1">البريد الإلكتروني</div>
                <div className="font-semibold text-gray-900">{reservation.userEmail}</div>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="text-sm text-gray-500 mb-1">رقم الهاتف</div>
                <div className="font-semibold text-gray-900">{reservation.userMobile}</div>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="text-sm text-gray-500 mb-1">رقم جواز السفر</div>
                <div className="font-semibold text-gray-900">{reservation.passportId}</div>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="text-sm text-gray-500 mb-1">تاريخ الحجز</div>
                <div className="font-semibold text-gray-900">{formatDate(reservation.reservationDate)}</div>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="text-sm text-gray-500 mb-1">تاريخ الإنشاء</div>
                <div className="font-semibold text-gray-900">{formatDate(reservation.createdAt)}</div>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="text-sm text-gray-500 mb-1">حالة الدفع</div>
                <div className={`font-bold ${
                  isPaid ? "text-green-600" : 
                  isPending ? "text-yellow-600" : 
                  "text-red-600"
                }`}>
                  {reservation.paymentStatus}
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="text-sm text-gray-500 mb-1">حالة الحجز</div>
                <div className="font-semibold text-gray-900">{reservation.reservationStatus}</div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold text-lg">إجمالي التكلفة:</span>
                <span className="text-3xl font-bold text-primary">{reservation.price} ج.م</span>
              </div>
            </div>

            {/* Passport Image */}
            {reservation.passportImageUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">صورة جواز السفر</h3>
                <div className="border rounded-lg overflow-hidden max-w-md">
                  <img 
                    src={reservation.passportImageUrl} 
                    alt="Passport" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              {isPending && (
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-second transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? 'جاري المعالجة...' : 'الدفع الآن'}
                </button>
              )}
              
              <Link
                to="/medical-tourism"
                className="px-6 py-3 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-semibold"
              >
                العودة للسياحة العلاجية
              </Link>
              
              <Link
                to="/"
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
              >
                الصفحة الرئيسية
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PackageReservationDetails;
