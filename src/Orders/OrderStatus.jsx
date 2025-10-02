import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import baseApi from "../api/baseApi";

const OrderStatus = () => {
  const { merchantOrderId: merchantOrderIdFromPath } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const merchantOrderIdFromQuery = query.get("merchantOrderId");
  const paymentStatus = query.get("paymentStatus");
  const resolvedMerchantOrderId =
    merchantOrderIdFromQuery || merchantOrderIdFromPath;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!resolvedMerchantOrderId) return;
      try {
        setLoading(true);
        setError("");
        const res = await baseApi.get(`/Orders/${resolvedMerchantOrderId}`);
        if (res.data?.success && res.data?.data) {
          setOrder(res.data.data);
        } else {
          setError("تعذر تحميل بيانات الطلب");
        }
      } catch {
        setError("تعذر تحميل بيانات الطلب");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [resolvedMerchantOrderId]);

  const isPaid =
    order?.status?.toLowerCase() === "paid" ||
    order?.status?.toLowerCase() === "success";
  const isFailed =
    order?.status?.toLowerCase() === "failed" ||
    order?.status?.toLowerCase() === "canceled";

  return (
    <section className="py-16 bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            نتيجة عملية الدفع
          </h1>
          <p className="text-gray-600 mt-2">
            رقم الطلب: {resolvedMerchantOrderId}
          </p>
          {paymentStatus && (
            <p className="text-gray-500 mt-1">
              حالة الدفع (من مزود الخدمة): {paymentStatus}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded-xl shadow text-center text-red-600">
            {error}
          </div>
        ) : !order ? (
          <div className="bg-white p-6 rounded-xl shadow text-center text-gray-600">
            لا توجد بيانات لهذا الطلب
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow">
            {isPaid && (
              <div className="mb-6">
                <div className="text-green-600 text-xl font-bold mb-2">
                  تم الدفع بنجاح
                </div>
                <p className="text-gray-600">
                  شكراً لك يا {order.userName}. تم تأكيد طلبك.
                </p>
              </div>
            )}
            {isFailed && (
              <div className="mb-6">
                <div className="text-red-600 text-xl font-bold mb-2">
                  فشل في الدفع
                </div>
                <p className="text-gray-600">
                  نأسف، لم تكتمل عملية الدفع. حاول مرة أخرى.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <div className="text-gray-500">اسم العميل</div>
                <div className="font-medium">{order.userName}</div>
              </div>
              <div>
                <div className="text-gray-500">البريد الإلكتروني</div>
                <div className="font-medium">{order.userEmail}</div>
              </div>
              <div>
                <div className="text-gray-500">الهاتف</div>
                <div className="font-medium">{order.userPhoneNumber}</div>
              </div>
              <div>
                <div className="text-gray-500">الحالة</div>
                <div
                  className={`font-bold ${
                    isPaid
                      ? "text-green-600"
                      : isFailed
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </div>
              </div>
              <div>
                <div className="text-gray-500">حالة التوصيل</div>
                <div className="font-medium">{order.deliveryStatus || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">إجمالي التكلفة</div>
                <div className="font-bold text-primary">
                  {order.totalCost?.toFixed
                    ? order.totalCost.toFixed(2)
                    : order.totalCost}{" "}
                  ج.م
                </div>
              </div>
            </div>

            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  عناصر الطلب
                </h2>
                <div className="divide-y border border-gray-300 rounded-lg">
                  {order.items.map((it) => (
                    <div
                      key={`${it.productId}-${it.providerId}`}
                      className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm"
                    >
                      <div className="md:col-span-2 font-medium">
                        {it.productName}
                      </div>
                      <div>الكمية: {it.quantity}</div>
                      <div>
                        السعر:{" "}
                        {it.totalPrice?.toFixed
                          ? it.totalPrice.toFixed(2)
                          : it.totalPrice}{" "}
                        ج.م
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                الصفحة الرئيسية
              </Link>
              <Link
                to="/products"
                className="px-4 py-2 rounded-lg bg-second text-white hover:bg-primary"
              >
                تسوق المزيد
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderStatus;
