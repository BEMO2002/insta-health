import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart, FiChevronRight } from "react-icons/fi";
import baseApi from "../api/baseApi";
import { CartContext } from "../Context/CartContext";

const ProductsDetails = () => {
  const { slug } = useParams();
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

  const hasDiscount = useMemo(() => {
    const discountPrice = product?.discountPrice;
    const price = product?.price;
    if (discountPrice == null || price == null) return false;
    const discountNumber = Number(discountPrice);
    const priceNumber = Number(price);
    if (Number.isNaN(discountNumber) || Number.isNaN(priceNumber)) return false;
    return discountNumber < priceNumber;
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!hasDiscount) return 0;
    const discountNumber = Number(product.discountPrice);
    const priceNumber = Number(product.price);
    return Math.round(100 - (discountNumber / priceNumber) * 100);
  }, [hasDiscount, product]);

  const formattedPrice = useMemo(() => {
    if (product?.price == null) return "";
    return product.price?.toFixed ? product.price.toFixed(2) : product.price;
  }, [product]);

  const formattedDiscountPrice = useMemo(() => {
    if (product?.discountPrice == null) return "";
    return product.discountPrice?.toFixed
      ? product.discountPrice.toFixed(2)
      : product.discountPrice;
  }, [product]);

  useEffect(() => {
    // Prefer product passed via navigation state to avoid wrong fetches
    if (location.state?.product) {
      setProduct(location.state.product);
      setPageLoading(false);
      return;
    }

    const fetchBySlug = async () => {
      try {
        setPageLoading(true);
        setError("");

        // Fetch using slug as requested
        // If the backend assumes /Products/{id}, this might need adjustment if slug is not accepted
        // But given the request, we assume /Products/{slug} or list filtering
        const res = await baseApi.get(`/Products/${slug}`);
        if (res.data?.success && res.data.data) {
          const data = res.data.data;

          if (Array.isArray(data?.items)) {
            // If it returns a list, find by slug
            const found = data.items.find((p) => p.slug === slug);
            if (found) {
              setProduct(found);
            } else {
              setError("تعذر العثور على المنتج");
            }
          } else {
            // Single object response
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

    if (slug) fetchBySlug();
  }, [slug, location.state]);

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
            aria-label="Go Back to Products"
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
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-6 py-1 rounded-full text-xs font-extrabold shadow">
                      خصم {discountPercent}%
                    </div>
                  )}
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
                  <div className="flex flex-col">
                    {hasDiscount ? (
                      <>
                        <span className="text-3xl font-extrabold text-red-600">
                          {formattedDiscountPrice} ج.م
                        </span>
                        <span className="text-sm text-gray-500 line-through -mt-1">
                          {formattedPrice} ج.م
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {formattedPrice} ج.م
                      </span>
                    )}
                  </div>
                  <button
                    aria-label="Add to Cart"
                    onClick={handleAdd}
                    disabled={adding}
                    className={`bg-second text-white px-10 py-3 rounded-full  hover:bg-primary transition-colors duration-200 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
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
