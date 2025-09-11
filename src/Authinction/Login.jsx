import React, { useState, useEffect, useContext } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../Context/AuthContext";
import logo from "../assets/Home/insta health 1.png";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    validateField("email", formData.email);
    validateField("password", formData.password);
  }, [formData]);

  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "email":
        if (!value) {
          error = "";
        } else if (!value.includes("@") || !value.includes(".")) {
          error = "البريد الإلكتروني غير صالح يجب ان يشابه name@gmail.com";
        }
        break;
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
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const validations = [
      validateField("email", formData.email),
      validateField("password", formData.password),
    ];
    return validations.every((valid) => valid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await baseApi.post("/Accounts/login", {
        email: formData.email,
        password: formData.password,
      });

      const apiData = response?.data?.data ?? response?.data ?? {};
      const token =
        apiData.token || apiData.accessToken || apiData.jwt || apiData.id_token;
      const userData = apiData.user || apiData.profile || null;

      if (!token) {
        throw new Error("Token not returned by API");
      }

      // Attach token to baseApi for subsequent requests
      baseApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      login(token, userData, formData.rememberMe);

      toast.success("تم تسجيل الدخول بنجاح", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        rtl: true,
        theme: "colored",
      });

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || "";
      if (
        status === 401 &&
        message.toLowerCase().includes("email not confirmed")
      ) {
        toast.info("بريدك لم يتم تفعيله بعد. تم تحويلك لإرسال رابط التفعيل.", {
          position: "top-center",
          autoClose: 4000,
          rtl: true,
          theme: "colored",
        });
        navigate("/authenticate-email", {
          state: { email: formData.email, autoSend: false },
        });
      } else {
        toast.error(
          "فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور",
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            rtl: true,
          }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputBorderClass = (fieldName) => {
    if (!formData[fieldName]) return "border-[#9E9E9E]";
    if (errors[fieldName]) return "border-red-500";
    return "border-primary";
  };
  return (
    <div className=" pt-30 flex items-center justify-center p-4 bg-white">
      <div className="flex flex-col max-w-2xl  items-center justify-center w-full gap-10 rounded-xl overflow-hidden">
        <div className="w-full  p-8 rtl:text-right">
          <Link to={"/"} className="cursor-pointer ">
            <img src={logo} alt="Logo" className="w-[90px] mx-auto " />
          </Link>
          <h2 className="text-3xl text-center  font-bold text-gray-800 mb-2">
            تسجيل الدخول
          </h2>
          <p className="text-gray-700 text-center  mb-8 text-sm font-medium">
            سجل الدخول للوصول إلى حسابك
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`w-full px-[16px] py-[8px] h-[54px]  border rounded-md focus:outline-none  peer ${getInputBorderClass(
                  "email"
                )}`}
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder=" "
              />
              <label
                htmlFor="email"
                className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                  focusedField === "email" || formData.email
                    ? "-top-2 text-xs bg-white px-2 text-primary"
                    : "top-3.5 text-gray-500"
                }`}
              >
                البريد الإلكتروني
              </label>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className={`w-full px-[16px] py-[8px] h-[54px] border rounded-md focus:outline-none  peer pr-10 ${getInputBorderClass(
                  "password"
                )}`}
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder=" "
              />
              <label
                htmlFor="password"
                className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                  focusedField === "password" || formData.password
                    ? "-top-2 text-xs bg-white px-2 text-primary"
                    : "top-3.5 text-gray-500"
                }`}
              >
                كلمة المرور
              </label>
              <button
                type="button"
                className="absolute left-3 top-4 text-gray-800"
                onClick={togglePasswordVisibility}
                aria-label={
                  showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                }
              >
                {showPassword ? <BsEye size={24} /> : <BsEyeSlash size={24} />}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-700">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="w-5 h-5 text-primary focus:ring-0"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                </div>
                <label htmlFor="rememberMe" className="mr-3">
                  تذكرني
                </label>
              </div>
              <Link to="/forget" className="text-red-600 hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-primary hover:bg-primary/80 text-white font-medium rounded-md transition duration-200 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </div>

            <p className="text-sm text-gray-700 mt-1 text-center">
              ليس لديك حساب؟{" "}
              <Link
                to="/signup"
                className="text-primary font-semibold hover:underline"
              >
                إنشاء حساب
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
