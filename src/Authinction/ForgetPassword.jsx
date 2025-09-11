import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";
import logo from "../assets/Home/insta health 1.png";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setIsSending(true);
      await baseApi.post("/Accounts/forget-password", {
        email,
        clientUrl: `${window.location.origin}/reset-password`,
      });
      toast.success("تم إرسال رابط استعادة كلمة المرور إلى بريدك");
    } catch (error) {
      console.error("Forget password error:", error);
      toast.error("تعذر إرسال رابط الاستعادة. تحقق من البريد");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className=" pt-30 flex items-center justify-center p-4 bg-white">
      <div className="flex flex-col max-w-2xl  items-center justify-center w-full gap-10 rounded-xl overflow-hidden">
        <div className="w-full  p-8 rtl:text-right">
          <Link to={"/"} className="cursor-pointer ">
            <img src={logo} alt="Logo" className="w-[90px] mx-auto " />
          </Link>
          <h2 className="text-3xl text-center  font-bold text-gray-800 mb-2">
            استعادة كلمة المرور
          </h2>
          <p className="text-gray-700 text-center  mb-8 text-sm font-medium">
            ادخل بريدك الإلكتروني لإرسال رابط الاستعادة
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`w-full px-[16px] py-[8px] h-[54px]  border rounded-md focus:outline-none  peer border-[#9E9E9E]`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label
                htmlFor="email"
                className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                  email
                    ? "-top-2 text-xs bg-white px-2 text-primary"
                    : "top-3.5 text-gray-500"
                }`}
              >
                البريد الإلكتروني
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending}
                className={`w-full py-3 px-4 bg-primary hover:bg-primary/80 text-white font-medium rounded-md transition duration-200 ${
                  isSending ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSending ? "جاري الإرسال..." : "إرسال الرابط"}
              </button>
            </div>

            <p className="text-sm text-gray-700 mt-1 text-center">
              تذكرت كلمة المرور؟{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
