import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import baseApi from "../api/baseApi";

const AuthenticateEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState("");
  const didAutoSendRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromStateEmail = location.state?.email;
    const emailFromQuery = params.get("email");
    const resolvedEmail = fromStateEmail || emailFromQuery || "";
    setEmail(resolvedEmail);

    const shouldAutoSend = Boolean(location.state?.autoSend);
    if (resolvedEmail && shouldAutoSend && !didAutoSendRef.current) {
      didAutoSendRef.current = true; // Guard against StrictMode double invoke
      // Avoid auto-resend if we already sent for this email in this session
      const alreadySent = sessionStorage.getItem(
        `authEmailSent:${resolvedEmail}`
      );
      if (!alreadySent) {
        sendEmail(resolvedEmail);
      }
    }
  }, [location]);

  const sendEmail = async (targetEmail) => {
    try {
      setIsSending(true);
      await baseApi.post("/Accounts/authnticate-email", {
        email: targetEmail,
        clientUrl: `${window.location.origin}/confirm-email`,
      });
      sessionStorage.setItem(`authEmailSent:${targetEmail}`, "1");
      toast.success("تم إرسال رابط تفعيل البريد الإلكتروني");
    } catch (error) {
      console.error("Send authenticate email error:", error);
      toast.error("تعذر إرسال التفعيل. حاول مرة أخرى");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white shadow rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-2 text-[#313131]">
          تفعيل البريد الإلكتروني
        </h1>
        <p className="text-[#313131] mb-6">
          لقد تم إنشاء حسابك بنجاح. تم إرسال بريد يحتوي على رابط لتفعيل حسابك
          إلى:{" "}
          <span className="font-semibold">{email || "البريد الإلكتروني"}</span>
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-md border border-primary bg-primary text-white hover:bg-white hover:text-primary duration-300"
          >
            الذهاب لتسجيل الدخول
          </button>
          <button
            onClick={() => sendEmail(email)}
            disabled={isSending || !email}
            className={`px-4 py-2 rounded-md bg-primary border border-primary text-white hover:bg-white hover:text-primary duration-300  ${
              isSending || !email ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isSending ? "جارٍ الإرسال..." : "إعادة إرسال البريد"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthenticateEmail;
