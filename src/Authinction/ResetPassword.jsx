import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";
import logo from "../assets/Home/LOGO(INSTA HEALTH).svg";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import SeoHead from "../Components/SeoHead";
const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const presetEmail = params.get("email") || "";
  const presetToken = params.get("token") || "";

  const [email] = useState(presetEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token] = useState(presetToken);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [focusedField, setFocusedField] = useState(null);

  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "password":
        if (!value) {
          error = "";
        } else if (
          !value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/)
        ) {
          error =
            "كلمة المرور يجب أن تحتوي على حرف صغير، حرف كبير، رقم، حرف خاص (!@#$%^&*) وتكون 6 أحرف على الأقل";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "";
        } else if (value !== password) {
          error = "كلمة المرور وتأكيدها غير متطابقين";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  const getInputBorderClass = (fieldName) => {
    if (!password && fieldName === "password") return "border-[#9E9E9E]";
    if (!confirmPassword && fieldName === "confirmPassword")
      return "border-[#9E9E9E]";
    return errors[fieldName] ? "border-red-500" : "border-green-500";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validations = [
      validateField("password", password),
      validateField("confirmPassword", confirmPassword),
    ];

    if (!validations.every((valid) => valid)) {
      return;
    }
    try {
      setIsSubmitting(true);
      await baseApi.post("/Accounts/reset-password", {
        email,
        password,
        confirmPassword,
        token,
      });
      toast.success("تم تعيين كلمة مرور جديدة بنجاح");
      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("تعذر تعيين كلمة المرور. تحقق من الرابط والبيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SeoHead
        title="تعيين كلمة مرور جديدة - Insta Health"
        description="تعيين كلمة مرور جديدة لحسابك."
        keywords="تعيين كلمة مرور جديدة, Insta Health"
        ogTitle="تعيين كلمة مرور جديدة - Insta Health"
        ogDescription="تعيين كلمة مرور جديدة لحسابك."
        ogImage="https://instahealth.com/share/reset-password-og.jpg"
        canonical="https://instahealth.com/reset-password"
      />
      <div className=" pt-30 flex items-center justify-center p-4 bg-white">
        <div className="flex flex-col max-w-2xl  items-center justify-center w-full gap-10 rounded-xl overflow-hidden">
          <div className="w-full  p-8 rtl:text-right">
            <Link to={"/"} className="cursor-pointer ">
              <img src={logo} alt="Logo" className="w-[100px] mx-auto " />
            </Link>
            <h2 className="text-3xl text-center  font-bold text-gray-800 mb-2">
              تعيين كلمة مرور جديدة
            </h2>
            <p className="text-gray-700 text-center  mb-8 text-sm font-medium">
              أدخل كلمة المرور الجديدة لتحديث حسابك
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full px-[16px] py-[8px] h-[54px]  border rounded-md focus:outline-none  peer pr-10 ${
                    errors.password
                      ? "focus:ring-red-500"
                      : "focus:ring-green-500"
                  } ${getInputBorderClass("password")}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder=" "
                />
                <label
                  htmlFor="password"
                  className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                    focusedField === "password" || password
                      ? "-top-2 text-xs bg-white px-2 text-primary"
                      : "top-3.5 text-gray-500"
                  }`}
                >
                  كلمة المرور الجديدة
                </label>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <button
                  type="button"
                  className="absolute left-3 top-4 text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                  }
                >
                  {showPassword ? (
                    <BsEye size={24} />
                  ) : (
                    <BsEyeSlash size={24} />
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`w-full px-[16px] py-[8px] h-[54px]  border rounded-md focus:outline-none  peer pr-10 ${
                    errors.confirmPassword
                      ? "focus:ring-red-500"
                      : "focus:ring-green-500"
                  } ${getInputBorderClass("confirmPassword")}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder=" "
                />
                <label
                  htmlFor="confirmPassword"
                  className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                    focusedField === "confirmPassword" || confirmPassword
                      ? "-top-2 text-xs bg-white px-2 text-primary"
                      : "top-3.5 text-gray-500"
                  }`}
                >
                  تأكيد كلمة المرور
                </label>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
                <button
                  type="button"
                  className="absolute left-3 top-4 text-gray-800"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "إخفاء تأكيد كلمة المرور"
                      : "إظهار تأكيد كلمة المرور"
                  }
                >
                  {showConfirmPassword ? (
                    <BsEye size={24} />
                  ) : (
                    <BsEyeSlash size={24} />
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 bg-primary hover:bg-primary/80 text-white font-medium rounded-md transition duration-200 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
