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

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated } = useContext(AuthContext);

  // API base URL
  const API_BASE = "https://instahealthy.runasp.net/api";

  // Cookie-based auth (HttpOnly). No token on client.

  // Calculate total count
  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Get cart from API
  const getCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/Carts`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Cart response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Cart data received:", responseData);
        if (
          responseData &&
          responseData.success &&
          responseData.data &&
          Array.isArray(responseData.data.items)
        ) {
          setItems(responseData.data.items);
        }
      } else if (response.status === 401 || response.status === 403) {
        console.log("Unauthorized - clearing cart");
        setItems([]);
        toast.error("يجب تسجيل الدخول");
      } else {
        console.log("Error response:", response.status);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add product to cart
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
          imageUrl: product.imageUrl,
          quantity,
        };

        console.log("Adding to cart:", payload);

        const response = await fetch(`${API_BASE}/Carts`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log("Add to cart response status:", response.status);

        if (response.ok) {
          // Update local state
          setItems((prev) => {
            const map = new Map(prev.map((item) => [item.productId, item]));
            const current = map.get(product.id);
            const nextQty = (current?.quantity || 0) + quantity;
            map.set(product.id, {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: nextQty,
              imageUrl: product.imageUrl,
            });
            const newItems = Array.from(map.values());
            console.log("Cart updated locally:", newItems.length, "items");
            return newItems;
          });
          toast.success("تمت إضافة المنتج إلى السلة");
          return { ok: true };
        } else if (response.status === 401 || response.status === 403) {
          console.log("Unauthorized when adding to cart");
          toast.error("يجب تسجيل الدخول لإضافة منتجات إلى السلة");
          return { ok: false };
        } else {
          console.log("Error adding to cart:", response.status);
          toast.error("فشل إضافة المنتج إلى السلة");
          return { ok: false };
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("حدث خطأ غير متوقع");
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Update product quantity
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
        const response = await fetch(`${API_BASE}/Carts`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, quantity }),
        });

        if (response.ok) {
          setItems((prev) =>
            prev.map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            )
          );
          toast.success("تم تحديث الكمية");
          return { ok: true };
        } else if (response.status === 401 || response.status === 403) {
          toast.error("يجب تسجيل الدخول");
          return { ok: false };
        } else {
          toast.error("فشل تحديث الكمية");
          return { ok: false };
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast.error("حدث خطأ غير متوقع");
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Remove product from cart
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
        const response = await fetch(`${API_BASE}/Carts/${productId}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setItems((prev) =>
            prev.filter((item) => item.productId !== productId)
          );
          toast.success("تم حذف المنتج من السلة");
          return { ok: true };
        } else if (response.status === 401 || response.status === 403) {
          toast.error("يجب تسجيل الدخول");
          return { ok: false };
        } else {
          toast.error("فشل حذف المنتج من السلة");
          return { ok: false };
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        toast.error("حدث خطأ غير متوقع");
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Fetch cart when user becomes authenticated
  useEffect(() => {
    console.log("Auth state changed:", isAuthenticated);
    if (isAuthenticated) {
      console.log("User authenticated, fetching cart...");
      getCart();
    } else {
      console.log("User not authenticated, clearing cart");
      setItems([]);
    }
  }, [isAuthenticated, getCart]);

  // Fetch cart on component mount if user is already authenticated
  useEffect(() => {
    console.log("Component mounted, checking auth...");
    if (isAuthenticated) {
      getCart();
    }
  }, [isAuthenticated, getCart]);

  const value = {
    items,
    totalCount,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    getCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
