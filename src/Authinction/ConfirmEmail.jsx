import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import baseApi from "../api/baseApi";

const ConfirmEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [status, setStatus] = useState("pending");
  const didNavigateRef = useRef(false);
  const didEffectRunRef = useRef(false);
  const didToastRef = useRef(false);

  useEffect(() => {
    if (didEffectRunRef.current) return;
    didEffectRunRef.current = true;
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    const token = params.get("token");

    const confirm = async () => {
      if (!email || !token) {
        setStatus("missing");
        setIsVerifying(false);
        return;
      }
      try {
        setIsVerifying(true);
        await baseApi.post("/Accounts/confirm-email", { email, token });
        setStatus("success");
        if (!didToastRef.current) {
          didToastRef.current = true;
          toast.success("تم تفعيل البريد الإلكتروني بنجاح");
        }
      } catch (error) {
        console.error("Confirm email error:", error);
        setStatus("error");
        toast.error("فشل تفعيل البريد الإلكتروني");
      } finally {
        setIsVerifying(false);
      }
    };

    confirm();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white shadow rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-[#313131]">
          تأكيد البريد الإلكتروني
        </h1>
        {isVerifying && <p>جاري التحقق...</p>}
        {!isVerifying && status === "success" && (
          <>
            <p className="mb-6">تم التفعيل بنجاح. يمكنك الآن تسجيل الدخول.</p>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-md bg-[#116845] text-white hover:bg-[#0e5638]"
            >
              الذهاب لتسجيل الدخول
            </button>
          </>
        )}
        {!isVerifying && status === "error" && (
          <p className="text-red-600">
            حدث خطأ أثناء التفعيل. تأكد من صحة الرابط.
          </p>
        )}
        {!isVerifying && status === "missing" && (
          <p className="text-red-600">
            الرابط غير مكتمل. مفقود البريد أو الرمز.
          </p>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
