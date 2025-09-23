import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart, FiChevronRight } from "react-icons/fi";
import baseApi from "../api/baseApi";
import { CartContext } from "../Context/CartContext";

const ProductsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Zoom lens state
  const imageWrapRef = useRef(null);
  const [isZooming, setIsZooming] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [lensStyle, setLensStyle] = useState({
    left: 0,
    top: 0,
    bgPos: "50% 50%",
  });
  const LENS_SIZE = 200;
  const ZOOM = 5;

  const handleMouseMove = (e) => {
    if (!imageWrapRef.current) return;
    const rect = imageWrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const half = LENS_SIZE / 2;
    const clampedX = Math.max(half, Math.min(rect.width - half, x));
    const clampedY = Math.max(half, Math.min(rect.height - half, y));

    const bgX = ((clampedX / rect.width) * 100).toFixed(2);
    const bgY = ((clampedY / rect.height) * 100).toFixed(2);

    setLensStyle({
      left: clampedX - half,
      top: clampedY - half,
      bgPos: `${bgX}% ${bgY}%`,
    });
  };

  const priceText = useMemo(() => {
    if (!product?.price && product?.price !== 0) return "";
    return product.price?.toFixed ? product.price.toFixed(2) : product.price;
  }, [product]);

  useEffect(() => {
    // Prefer product passed via navigation state to avoid wrong fetches
    if (location.state?.product) {
      setProduct(location.state.product);
      setPageLoading(false);
      return;
    }

    const fetchById = async () => {
      try {
        setPageLoading(true);
        setError("");
        // Assuming details endpoint follows /Products/{id}
        const res = await baseApi.get(`/Products/${id}`);
        if (res.data?.success && res.data.data) {
          // Some backends return a single object, others return { items: [...] }
          const data = res.data.data;
          if (Array.isArray(data?.items)) {
            const found = data.items.find((p) => String(p.id) === String(id));
            if (found) {
              setProduct(found);
            } else {
              setError("تعذر العثور على المنتج");
            }
          } else {
            setProduct(data);
          }
        } else {
          setError("تعذر تحميل بيانات المنتج");
        }
      } catch {
        setError("تعذر تحميل بيانات المنتج");
      } finally {
        setPageLoading(false);
      }
    };

    if (id) fetchById();
  }, [id, location.state]);

  useEffect(() => {
    if (product?.imageUrl) {
      setImageSrc(product.imageUrl);
    }
  }, [product?.imageUrl]);

  const { addToCart } = useContext(CartContext);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!product || adding) return;
    setAdding(true);
    try {
      const res = await addToCart(product, 1);
      if (!res.ok) {
        setNotice("تعذر إضافة المنتج. تأكد من تسجيل الدخول.");
        setTimeout(() => setNotice(""), 2500);
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="py-14 bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <button
            onClick={() => navigate("/products")}
            className="hover:text-primary"
          >
            المنتجات
          </button>
          <FiChevronRight className="mx-2" />
          <span className="text-gray-700">تفاصيل المنتج</span>
        </div>

        {pageLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-center text-red-600">{error}</p>
          </div>
        ) : !product ? (
          <div className="text-center py-12 text-gray-600">لا يوجد منتج</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            {/* Left: Image */}
            <div className="order-1">
              <div className="bg-white rounded-xl shadow overflow-hidden h-full">
                <div
                  ref={imageWrapRef}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleMouseMove}
                  className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center p-6"
                >
                  <img
                    src={imageSrc || product.imageUrl}
                    alt={product.name}
                    className="w-[500px] object-contain"
                    onError={(e) => {
                      const placeholder =
                        "https://via.placeholder.com/800x600?text=No+Image";
                      e.currentTarget.src = placeholder;
                      setImageSrc(placeholder);
                    }}
                    onLoad={(e) => setImageSrc(e.currentTarget.src)}
                  />
                  {isZooming && (
                    <div
                      className="pointer-events-none absolute rounded-full border-2 border-primary shadow-lg"
                      style={{
                        width: `${LENS_SIZE}px`,
                        height: `${LENS_SIZE}px`,
                        left: `${lensStyle.left}px`,
                        top: `${lensStyle.top}px`,
                        backgroundImage: `url(${imageSrc || product.imageUrl})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: lensStyle.bgPos,
                        backgroundSize: `${ZOOM * 100}% ${ZOOM * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-2 h-full">
              <div className="bg-white rounded-xl shadow p-8 h-full flex flex-col">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {product.name}
                </h1>
                {product.categoryName && (
                  <p className="text-sm text-gray-500 mb-4">
                    الفئة: {product.categoryName}
                  </p>
                )}

                {product.isBestSeller && (
                  <span className="inline-block w-fit bg-second text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
                    الأكثر مبيعاً
                  </span>
                )}

                {product.description && (
                  <p className="text-gray-700 leading-8 mb-6 whitespace-pre-line">
                    {product.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                  {product.providerName && (
                    <div className="text-gray-600">
                      <span className="text-gray-500">المقدم:</span>{" "}
                      {product.providerName}
                    </div>
                  )}
                  {typeof product.quantity === "number" && (
                    <div className="text-gray-600">
                      <span className="text-gray-500">الكمية المتاحة:</span>{" "}
                      {product.quantity}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center flex-col gap-4 md:flex-row justify-between">
                  <div>
                    <div className="text-gray-500 text-sm">السعر</div>
                    <div className="text-3xl font-extrabold text-primary">
                      {priceText} ج.م
                    </div>
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={adding}
                    className={`bg-second text-white px-7 py-3 rounded-lg hover:bg-primary transition-colors duration-200 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {adding ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                        جاري الإضافة
                      </span>
                    ) : (
                      <>
                        <FiShoppingCart size={18} />
                        أضف للسلة
                      </>
                    )}
                  </button>
                </div>

                {notice && (
                  <div className="mt-4">
                    <span className="inline-block bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                      {notice}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsDetails;
