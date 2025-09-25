import React, { useContext, useEffect, useMemo, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { FaSearch, FaTimes } from "react-icons/fa";
import baseApi from "../api/baseApi";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../Context/CartContext";

const ProductCard = ({ product, onAdd }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          onClick={() =>
            navigate(`/products/${product.id}`, { state: { product } })
          }
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/600x400?text=No+Image";
          }}
        />
        {product.isBestSeller && (
          <div className="absolute top-3 right-3 bg-second text-white px-2 py-1 rounded-full text-xs font-semibold">
            الأكثر مبيعاً
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col grow" dir="rtl">
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <p className="text-sm text-gray-500 mb-3">{product.categoryName}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {product.price?.toFixed ? product.price.toFixed(2) : product.price}{" "}
            ج.م
          </span>
          <AddToCartButton product={product} onAdd={onAdd} />
        </div>
      </div>
    </div>
  );
};

const AddToCartButton = ({ product, onAdd }) => {
  const [adding, setAdding] = useState(false);
  const handleClick = async () => {
    if (adding) return;
    setAdding(true);
    try {
      await onAdd(product);
    } finally {
      setAdding(false);
    }
  };
  return (
    <button
      onClick={handleClick}
      disabled={adding}
      className="bg-second text-white px-4 py-2  hover:bg-primary/90 transition-colors duration-200 text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {adding ? (
        <span className="inline-flex items-center gap-2">
          <span className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></span>
          جاري الإضافة
        </span>
      ) : (
        <>
          <FiShoppingCart size={16} />
          أضف للسلة
        </>
      )}
    </button>
  );
};

const Products = () => {
  const { addToCart } = useContext(CartContext);
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [serverPageSize, setServerPageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [notice, setNotice] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / Math.max(1, serverPageSize)));
  }, [totalCount, serverPageSize]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        PageIndex: pageIndex,
        PageSize: serverPageSize,
      };
      if (selectedCategoryId) {
        params.CategoryId = Number(selectedCategoryId);
      }
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.trim();
        params.SearchName = q;
      }

      const res = await baseApi.get("/Products", {
        params,
      });
      if (res.data?.success) {
        const data = res.data.data || {};
        setProducts(Array.isArray(data.items) ? data.items : []);
        setTotalCount(data.count || 0);
        // Use the server-advertised page size (backend may cap it)
        if (data.pageSize && data.pageSize !== serverPageSize) {
          setServerPageSize(data.pageSize);
        }
      } else {
        setError("تعذر تحميل المنتجات");
      }
    } catch {
      setError("تعذر تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  // Read category from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryFromUrl = urlParams.get("category");
    if (categoryFromUrl) {
      setSelectedCategoryId(categoryFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, serverPageSize, selectedCategoryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await baseApi.get("/Categories");
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleAddToCart = async (product) => {
    const res = await addToCart(product, 1);
    if (res?.ok) {
      setNotice(`تم إضافة ${product.name} إلى السلة`);
    } else {
      setNotice("تعذر إضافة المنتج. تأكد من تسجيل الدخول.");
    }
    setTimeout(() => setNotice(""), 2500);
    return res;
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPageIndex(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPageButtons = () => {
    const max = 5;
    const pages = [];
    let start = Math.max(1, pageIndex - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => goToPage(pageIndex - 1)}
          disabled={pageIndex === 1}
          className="px-4 py-2 bg-second text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          السابق
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goToPage(p)}
            className={`px-4 py-2 rounded-lg ${
              p === pageIndex
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => goToPage(pageIndex + 1)}
          disabled={pageIndex === totalPages}
          className="px-4 py-2 bg-second text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          التالي
        </button>
      </div>
    );
  };

  const handleSearchClick = () => {
    if (pageIndex !== 1) {
      setPageIndex(1);
    } else {
      // Already on page 1, force a fetch
      fetchProducts();
    }
  };

  return (
    <section className="py-12 bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            المنتجات
          </h2>
          <p className="text-gray-600">استعرض أحدث المنتجات الطبية</p>
        </div>

        {/* Filters - styled similar to Filtration */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary">فلترة المنتجات</h3>
            {(selectedCategoryId || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategoryId("");
                  setSearchTerm("");
                  setPageIndex(1);
                }}
                className="flex items-center text-gray-500 hover:text-red-600 transition-colors duration-200"
              >
                <FaTimes className="ml-2" size={14} />
                مسح الفلاتر
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البحث بالاسم
              </label>
              <div className="relative flex">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSearchClick();
                    }
                  }}
                  placeholder="ابحث عن منتج..."
                  className="flex-1 pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setPageIndex(1);
                }}
                className="w-full px-4 py-3 text-right border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-second focus:border-transparent transition-colors duration-200"
              >
                <option value="">كل الفئات</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedCategoryId || searchTerm) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
                {selectedCategoryId && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-second text-white">
                    {categories.find(
                      (c) => String(c.id) === String(selectedCategoryId)
                    )?.name || "فئة"}
                    <button
                      onClick={() => setSelectedCategoryId("")}
                      className="mr-2 hover:text-red-200"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-600 text-white">
                    "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mr-2 hover:text-red-200"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {notice && (
          <div className="mb-4 text-center">
            <span className="inline-block bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
              {notice}
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-center text-red-600">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            لا توجد منتجات حاليا
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAddToCart} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                {renderPageButtons()}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default Products;
