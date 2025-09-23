/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useContext(AuthContext);

  // Stable user key: prefer email or a stable user id; fallback to guest
  const stableUserKey = useMemo(
    () =>
      isAuthenticated && (user?.email || user?.id)
        ? user.email || `user_${user.id}`
        : "guest",
    [isAuthenticated, user?.email, user?.id]
  );

  const cartKey = useMemo(() => `cart_items_${stableUserKey}`, [stableUserKey]);
  const didHydrateRef = useRef(false);

  // Rehydrate cart from storage on first load / when user changes (with legacy key migration)
  useEffect(() => {
    try {
      const storedCurrent = localStorage.getItem(cartKey);

      const legacyKey = "cart_items"; // old global key
      const storedLegacy = localStorage.getItem(legacyKey);
      // Old token-based key migration (some sessions saved with token)
      const oldToken = (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        ""
      ).trim();
      const tokenKey = oldToken ? `cart_items_${oldToken}` : null;
      const storedTokenKey = tokenKey ? localStorage.getItem(tokenKey) : null;

      // Check for guest cart if user is authenticated
      const guestKey = "cart_items_guest";
      const storedGuestKey = localStorage.getItem(guestKey);

      if (storedCurrent) {
        const parsed = JSON.parse(storedCurrent);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
        didHydrateRef.current = true;
      } else if (storedTokenKey) {
        const parsedToken = JSON.parse(storedTokenKey);
        if (Array.isArray(parsedToken)) {
          setItems(parsedToken);
          localStorage.setItem(cartKey, storedTokenKey);
        }
        didHydrateRef.current = true;
      } else if (storedLegacy) {
        const parsedLegacy = JSON.parse(storedLegacy);
        if (Array.isArray(parsedLegacy)) {
          setItems(parsedLegacy);
          // migrate to new key and clean legacy
          localStorage.setItem(cartKey, storedLegacy);
          localStorage.removeItem(legacyKey);
          didHydrateRef.current = true;
        }
      } else if (isAuthenticated && storedGuestKey) {
        // Migrate guest cart to authenticated user
        const parsedGuest = JSON.parse(storedGuestKey);
        if (Array.isArray(parsedGuest) && parsedGuest.length > 0) {
          setItems(parsedGuest);
          localStorage.setItem(cartKey, storedGuestKey);
          localStorage.removeItem(guestKey);
          didHydrateRef.current = true;
        } else {
          didHydrateRef.current = true;
        }
      } else if (isAuthenticated) {
        // User is authenticated but no local cart found - will fetch from API
        didHydrateRef.current = true;
      } else {
        didHydrateRef.current = true;
      }
    } catch {
      // ignore
    }
  }, [cartKey, isAuthenticated]);

  // Persist cart whenever it changes
  useEffect(() => {
    try {
      if (!didHydrateRef.current) return;
      const current = localStorage.getItem(cartKey);
      const next = JSON.stringify(items);
      if (current !== next) {
        localStorage.setItem(cartKey, next);
      }
    } catch {
      // ignore
    }
  }, [items, cartKey]);

  const totalCount = useMemo(
    () => items.reduce((sum, it) => sum + (it.quantity || 0), 0),
    [items]
  );

  // Fetch cart from API when user logs in
  const fetchCartFromAPI = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await baseApi.get("/Carts");
      if (response.data && Array.isArray(response.data)) {
        setItems(response.data);
        // Save to localStorage for persistence
        const cartKey = `cart_items_${stableUserKey}`;
        localStorage.setItem(cartKey, JSON.stringify(response.data));
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated, stableUserKey]);

  // Fetch cart from API when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && didHydrateRef.current) {
      fetchCartFromAPI();
    }
  }, [isAuthenticated, fetchCartFromAPI]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product?.id) return { ok: false, message: "Invalid product" };
      if (!isAuthenticated) {
        const msg = "يجب تسجيل الدخول لإضافة منتجات إلى السلة";
        setError(msg);
        toast.error(msg);
        return { ok: false };
      }
      try {
        setLoading(true);
        setError("");
        const payload = {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        };
        const res = await baseApi.post("/Carts", payload);
        if (res.status >= 200 && res.status < 300) {
          setItems((prev) => {
            const map = new Map(prev.map((i) => [i.productId, i]));
            const current = map.get(product.id);
            const nextQty = (current?.quantity || 0) + quantity;
            map.set(product.id, {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: nextQty,
              imageUrl: product.imageUrl,
            });
            return Array.from(map.values());
          });
          toast.success("تمت إضافة المنتج إلى السلة");
          return { ok: true };
        }
        setError("فشل إضافة المنتج إلى السلة");
        toast.error("فشل إضافة المنتج إلى السلة");
        return { ok: false };
      } catch (e) {
        const status = e?.response?.status;
        const msg =
          e?.response?.data?.message ||
          (status === 401 || status === 403
            ? "يجب تسجيل الدخول لإضافة منتجات إلى السلة"
            : "حدث خطأ غير متوقع");
        setError(msg);
        toast.error(msg);
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!productId) return { ok: false };
      if (!isAuthenticated) {
        const msg = "يجب تسجيل الدخول";
        setError(msg);
        toast.error(msg);
        return { ok: false };
      }
      try {
        setLoading(true);
        setError("");
        const res = await baseApi.put("/Carts", { productId, quantity });
        if (res.status >= 200 && res.status < 300) {
          setItems((prev) =>
            prev.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            )
          );
          toast.success("تم تحديث الكمية");
          return { ok: true };
        }
        setError("فشل تحديث الكمية");
        toast.error("فشل تحديث الكمية");
        return { ok: false };
      } catch (e) {
        const status = e?.response?.status;
        const msg =
          e?.response?.data?.message ||
          (status === 401 || status === 403
            ? "يجب تسجيل الدخول"
            : "حدث خطأ غير متوقع");
        setError(msg);
        toast.error(msg);
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (!productId) return { ok: false };
      if (!isAuthenticated) {
        const msg = "يجب تسجيل الدخول";
        setError(msg);
        toast.error(msg);
        return { ok: false };
      }
      try {
        setLoading(true);
        setError("");
        const res = await baseApi.delete(`/Carts/${productId}`);
        if (res.status >= 200 && res.status < 300) {
          setItems((prev) => prev.filter((i) => i.productId !== productId));
          toast.success("تم حذف المنتج من السلة");
          return { ok: true };
        }
        setError("فشل حذف المنتج من السلة");
        toast.error("فشل حذف المنتج من السلة");
        return { ok: false };
      } catch (e) {
        const status = e?.response?.status;
        const msg =
          e?.response?.data?.message ||
          (status === 401 || status === 403
            ? "يجب تسجيل الدخول"
            : "حدث خطأ غير متوقع");
        setError(msg);
        toast.error(msg);
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
