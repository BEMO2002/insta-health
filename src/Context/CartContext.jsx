/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";
import baseApi from "../api/baseApi";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  // Total count
  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Get cart
  const getCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const res = await baseApi.get("/Carts", { validateStatus: () => true });

      const data = res.data;
      if (res.status >= 200 && res.status < 300) {
        if (data?.success && Array.isArray(data.data?.items)) {
          setItems(data.data.items);
        }
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add to cart
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!isAuthenticated) {
        toast.error("يجب تسجيل الدخول لإضافة منتجات");
        // Ensure a consistent return shape for callers
        return { ok: false, status: 401 };
      }

      try {
        setLoading(true);
        // Build payload to satisfy backend requirements (ImageUrl is required)
        const payload = {
          productId: product.id,
          quantity,
        };
        if (product?.imageUrl) payload.ImageUrl = product.imageUrl;
        if (product?.name) payload.name = product.name;
        if (product?.price != null) payload.price = product.price;
        if (product?.discountPrice != null)
          payload.discountPrice = product.discountPrice;

        const res = await baseApi.post("/Carts", payload, {
          validateStatus: () => true,
        });

        const ok = res.status >= 200 && res.status < 300;
        if (ok) {
          setItems((prev) => {
            const exists = prev.find((i) => i.productId === product.id);
            if (exists) {
              return prev.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              );
            }
            return [
              ...prev,
              {
                ...product,
                productId: product.id,
                quantity,
                discountPrice: product.discountPrice,
                price: product.price,
              },
            ];
          });
          toast.success("تمت إضافة المنتج", {
            theme: "colored",
          });
        } else {
          toast.error("فشل إضافة المنتج");
        }

        // Return a response-like object so callers can branch on ok/status
        return { ok, status: res.status, data: res.data };
      } catch (err) {
        toast.error("حدث خطأ");
        return { ok: false, status: 0, error: err };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated],
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!isAuthenticated) return;

      try {
        const res = await baseApi.put(
          "/Carts",
          { productId, quantity },
          { validateStatus: () => true },
        );

        if (res.status >= 200 && res.status < 300) {
          setItems((prev) =>
            prev.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            ),
          );
          toast.success("تم تحديث الكمية", {
            theme: "colored",
          });
        }
      } catch (err) {}
    },
    [isAuthenticated],
  );

  // Remove
  const removeFromCart = useCallback(
    async (productId) => {
      if (!isAuthenticated) return;

      try {
        const res = await baseApi.delete(`/Carts/${productId}`, {
          validateStatus: () => true,
        });

        if (res.status >= 200 && res.status < 300) {
          setItems((prev) => prev.filter((i) => i.productId !== productId));
          toast.success("تم الحذف");
        }
      } catch (err) {}
    },
    [isAuthenticated],
  );

  // Load cart on auth change
  useEffect(() => {
    if (isAuthenticated) getCart();
    else setItems([]);
  }, [isAuthenticated, getCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        getCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
