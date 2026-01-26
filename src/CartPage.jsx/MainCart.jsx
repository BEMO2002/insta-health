import React, { useContext, useMemo, useState } from "react";
import { CartContext } from "../Context/CartContext";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import OrderButton from "../Components/OrderButton";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SeoHead from "../Components/SeoHead";

const MainCart = () => {
  const { items, updateQuantity, removeFromCart, error, loading } =
    useContext(CartContext);

  // Local loading states for each operation
  const [loadingStates, setLoadingStates] = useState({});

  // Calculate total price
  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  // Calculate original total (before discount)
  const originalTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  // Calculate total savings
  const totalSavings = useMemo(() => {
    return originalTotal - totalPrice;
  }, [originalTotal, totalPrice]);

  // Handle quantity update with individual loading
  const handleQuantityUpdate = async (productId, newQuantity, type) => {
    const key = `qty_${productId}_${type}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Handle remove with individual loading
  const handleRemove = async (productId) => {
    setLoadingStates((prev) => ({ ...prev, [`remove_${productId}`]: true }));
    try {
      await removeFromCart(productId);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`remove_${productId}`]: false }));
    }
  };

  return (
    <>
      <SeoHead
        title="سلة التسوق - استكمال طلبك | Insta Health"
        description="راجع منتجاتك المختارة في سلة التسوق الخاصة بك. استكمل عملية الشراء بأمان وسهولة من انستا هيلث."
        keywords="سلة التسوق, دفع الكتروني, شراء منتجات طبية, اتمام الطلب, انستا هيلث, shopping cart, checkout, buy medical products, medical ecommerce, egypt"
        ogTitle="سلة مشترياتك - انستا هيلث"
        ogDescription="أنت على بعد خطوة واحدة من استلام منتجاتك الطبية. استكمل طلبك الآن."
        ogImage="https://instahealth.com/share/cart-og.jpg"
        canonical="https://instahealth.com/cart"
      />
      <section className="py-10 md:py-20 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              سلة التسوق
            </h1>
            <p className="text-gray-600">مراجعة طلباتك قبل الدفع</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <FiShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                سلة التسوق فارغة
              </h3>
              <p className="text-gray-500">
                ابدأ بإضافة بعض المنتجات إلى سلة التسوق
              </p>
              <Link
                to="/products"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-300"
              >
                اذهب للتسوق
                <FiArrowLeft />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-4 md:p-6 border-b border-gray-300">
                    <h2 className="text-lg font-semibold text-gray-900">
                      العناصر ({items.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-300">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Image - Centered on mobile */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
                          onError={(e) =>
                            (e.currentTarget.src =
                              "https://via.placeholder.com/80x80?text=No+Image")
                          }
                        />

                        {/* Details - Full width on mobile */}
                        <div className="flex-1 min-w-0 text-center sm:text-right w-full">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <div className="flex flex-col mt-1">
                            {item.discountPrice ? (
                              <>
                                <span className="text-lg font-bold text-red-600">
                                  {item.discountPrice.toFixed(2)} ج.م
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {item.price.toFixed(2)} ج.م
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-semibold text-gray-900">
                                {item.price.toFixed(2)} ج.م
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls - Full width on mobile */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              disabled={
                                loadingStates[`qty_${item.productId}_dec`]
                              }
                              onClick={() =>
                                handleQuantityUpdate(
                                  item.productId,
                                  Math.max(1, item.quantity - 1),
                                  "dec",
                                )
                              }
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingStates[`qty_${item.productId}_dec`] ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FiMinus className="w-4 h-4" />
                              )}
                            </button>
                            <span className="px-4 py-2 min-w-[3rem] text-center font-medium bg-white">
                              {item.quantity}
                            </span>
                            <button
                              disabled={
                                loadingStates[`qty_${item.productId}_inc`]
                              }
                              onClick={() =>
                                handleQuantityUpdate(
                                  item.productId,
                                  item.quantity + 1,
                                  "inc",
                                )
                              }
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingStates[`qty_${item.productId}_inc`] ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FiPlus className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <button
                            disabled={loadingStates[`remove_${item.productId}`]}
                            onClick={() => handleRemove(item.productId)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingStates[`remove_${item.productId}`] ? (
                              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FiTrash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkout Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm sticky top-4">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      ملخص الطلب
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">عدد العناصر:</span>
                        <span className="font-medium">{items.length}</span>
                      </div>
                      {totalSavings > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              المجموع الأصلي:
                            </span>
                            <span className="font-medium line-through text-gray-500">
                              {originalTotal.toFixed(2)} ج.م
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600">الخصم:</span>
                            <span className="font-medium text-green-600">
                              -{totalSavings.toFixed(2)} ج.م
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">المجموع الفرعي:</span>
                        <span className="font-medium">
                          {totalPrice.toFixed(2)} ج.م
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">الضريبة:</span>
                        <span className="font-medium">0.00 ج.م</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>المجموع الكلي:</span>
                          <span className="text-primary">
                            {totalPrice.toFixed(2)} ج.م
                          </span>
                        </div>
                      </div>
                    </div>
                    <OrderButton className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MainCart;
