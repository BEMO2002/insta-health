import React, { useState, useEffect } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import baseApi from "../api/baseApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/Home/LOGO(INSTA HEALTH).svg";

import { FaCamera } from "react-icons/fa";
import Cropper from "react-easy-crop";
import Modal from "react-modal";
import SeoHead from "../Components/SeoHead";
const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    isMember: null,
    agreeToTerms: false,
    image: null,
    EnglishName: "",
    nationalId: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    isMember: "",
    agreeToTerms: "",
    EnglishName: "",
    nationalId: "",
  });

  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null); // صورة مؤقتة للقص

  useEffect(() => {
    validateField("fullName", formData.fullName);
    validateField("email", formData.email);
    validateField("mobile", formData.mobile);
    validateField("password", formData.password);
    validateField("confirmPassword", formData.confirmPassword);
    validateField("EnglishName", formData.EnglishName);
  }, [formData]);

  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "fullName":
        if (!value) {
          error = "";
        } else if (!value.match(/^[\u0600-\u06FF\s]+$/)) {
          error =
            "الاسم الثلاثي يجب أن يحتوي على أحرف عربية فقط بدون ارقام او رموز";
        }
        break;
      case "email":
        if (!value) {
          error = "";
        } else if (!value.includes("@") || !value.includes(".")) {
          error = "البريد الإلكتروني غير صالح يجب ان يشابه name@gmail.com";
        }
        break;
      case "mobile":
        if (!value) {
          error = "";
        } else if (!value.match(/^\d{10,}$/)) {
          error = "رقم الهاتف يجب أن يحتوي على 10 أرقام على الأقل";
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
      case "confirmPassword":
        if (!value) {
          error = "";
        } else if (value !== formData.password) {
          error = "كلمة المرور وتأكيدها غير متطابقين";
        }
        break;
      case "EnglishName":
        if (!value) {
          error = "";
        } else if (!value.match(/^[a-zA-Z\s]+$/)) {
          error = "الاسم باللغة الإنجليزية يجب أن يحتوي على أحرف إنجليزية فقط";
        }
        break;
      case "nationalId":
        if (!value) {
          error = "";
        } else if (!value.match(/^\d{6,}$/)) {
          error = "رقم الهوية يجب أن يحتوي على أرقام فقط";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });
  }

  const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setTempImage(ev.target.result);
          setShowCropModal(true);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const validateForm = () => {
    const validations = [
      validateField("fullName", formData.fullName),
      validateField("email", formData.email),
      validateField("mobile", formData.mobile),
      validateField("password", formData.password),
      validateField("confirmPassword", formData.confirmPassword),
      validateField("EnglishName", formData.EnglishName),
      validateField("nationalId", formData.nationalId),
    ];

    return validations.every((valid) => valid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();
      const englishParts = (formData.EnglishName || "").trim().split(/\s+/);
      const firstName = englishParts[0] || "";
      const lastName = englishParts.slice(1).join(" ") || "";

      formDataToSend.append("Email", formData.email);
      formDataToSend.append("Password", formData.password);
      formDataToSend.append("ConfirmPassword", formData.confirmPassword);
      formDataToSend.append("FirstName", firstName);
      formDataToSend.append("LastName", lastName);
      formDataToSend.append("Mobile", formData.mobile);
      formDataToSend.append("ArabicName", formData.fullName);
      formDataToSend.append("NationalId", formData.nationalId);
      if (formData.image) {
        formDataToSend.append("Image", formData.image);
      }

      // eslint-disable-next-line no-unused-vars
      const response = await baseApi.post(
        "/Accounts/register",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("تم التسجيل بنجاح! يرجى تفعيل بريدك الإلكتروني.", {
        position: "top-center",
        theme: "colored",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        rtl: true,
      });

      navigate("/authenticate-email", {
        state: { email: formData.email, autoSend: true },
      });
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = "حدث خطأ أثناء التسجيل";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        if (err.response.data.message.includes("BadRequest")) {
          errorMessage =
            "الطلب غير صحيح. من فضلك جرب إيميل جديد (غير مستخدم من قبل) أو تأكد من صيغة البيانات.";
        }
      } else if (err.response?.data?.errors) {
        if (err.response.data.errors.includes("Email already exists")) {
          errorMessage =
            "البريد الإلكتروني مسجل بالفعل، جرب بريدًا إلكترونيًا آخر";
        } else {
          errorMessage = err.response.data.errors.join(", ");
        }
      } else {
        errorMessage = err.message;
      }

      toast.error(errorMessage, {
        position: "top-center",
        theme: "colored",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        rtl: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getInputBorderClass = (fieldName) => {
    if (!formData[fieldName]) return "border-[#9E9E9E]";
    return errors[fieldName] ? "border-red-500" : "border-green-500";
  };

  return (
    <>
      <SeoHead
        title=" انشاء حساب جديد | Insta Health"
        description="سجل الدخول للوصول إلى حسابك في انستا هيلث."
        keywords=" انشاء حساب جديد, حسابات, انستا هيلث, signup, account, shopping cart, checkout, buy medical products, medical ecommerce, egypt"
        ogTitle=" انشاء حساب جديد - انستا هيلث"
        ogDescription=" انشاء حساب جديد للوصول إلى حسابك في انستا هيلث."
        ogImage="https://instahealth.com/share/cart-og.jpg"
        canonical="https://instahealth.com/signup"
      />
      <div className="min-h-screen auth-container flex items-center justify-center p-2">
        <div className="w-full lg:max-w-3xl   mx-auto rounded-xl overflow-hidden">
          <div className=" p-8 rtl:text-right">
            <Link to={"/"}>
              <img
                src={logo}
                alt="Logo"
                className="mt-0 mb-2 mx-auto w-[100px]"
              />
            </Link>
            <h2 className="text-[36px] text-center  font-bold text-[#313131] mb-2">
              إنشاء حساب
            </h2>
            <p className="text-[#313131] text-center mb-5 lg:text-[15px] text-[12px]  font-[500]">
              ليبدأ إنشاء حسابك للوصول إلى بياناتك الشخصية
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-[30px] form-container p-6 rounded-xl"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative w-full lg:w-1/2">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className={`w-full px-[16px] py-[8px] h-[54px] border-1 rounded-md focus:outline-none focus:ring-1 ${
                      errors.fullName
                        ? "focus:ring-red-500"
                        : "focus:ring-primary"
                    } ${getInputBorderClass("fullName")} peer`}
                    value={formData.fullName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                  />
                  <label
                    htmlFor="fullName"
                    className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                      focusedField === "fullName" || formData.fullName
                        ? "-top-2 text-xs bg-white px-2 text-primary"
                        : "top-3.5 text-gray-500"
                    }`}
                  >
                    الإسم الثلاثي باللغه العربيه
                  </label>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div className="relative w-full lg:w-1/2">
                  <input
                    id="EnglishName"
                    name="EnglishName"
                    type="text"
                    required
                    className={`w-full px-[16px] py-[8px] h-[54px] border-1 rounded-md focus:outline-none focus:ring-1 ${
                      errors.EnglishName
                        ? "focus:ring-red-500"
                        : "focus:ring-primary"
                    } ${getInputBorderClass("EnglishName")} peer`}
                    value={formData.EnglishName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("EnglishName")}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                  />
                  <label
                    htmlFor="EnglishName"
                    className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                      focusedField === "EnglishName" || formData.EnglishName
                        ? "-top-2 text-xs bg-white px-2 text-primary"
                        : "top-3.5 text-gray-500"
                    }`}
                  >
                    الاسم باللغة الإنجليزية
                  </label>
                  {errors.EnglishName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.EnglishName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative w-full lg:w-1/2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`w-full px-[16px] py-[8px] h-[54px] border-1 rounded-md focus:outline-none focus:ring-1 ${
                      errors.email ? "focus:ring-red-500" : "focus:ring-primary"
                    } ${getInputBorderClass("email")} peer`}
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
                <div className="relative w-full lg:w-1/2">
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    className={`w-full px-[16px] py-[8px] h-[54px] border-1 rounded-md focus:outline-none focus:ring-1 ${
                      errors.mobile
                        ? "focus:ring-red-500"
                        : "focus:ring-primary"
                    } ${getInputBorderClass("mobile")} peer`}
                    value={formData.mobile}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("mobile")}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                  />
                  <label
                    htmlFor="mobile"
                    className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                      focusedField === "mobile" || formData.mobile
                        ? "-top-2 text-xs bg-white px-2 text-primary"
                        : "top-3.5 text-gray-500"
                    }`}
                  >
                    رقم الهاتف
                  </label>
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                  )}
                </div>
              </div>

              {/* National ID */}
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    required
                    className={`w-full px-[16px] py-[8px] h-[54px] border-1 rounded-md focus:outline-none focus:ring-1 ${
                      errors.nationalId
                        ? "focus:ring-red-500"
                        : "focus:ring-primary"
                    } ${getInputBorderClass("nationalId")} peer`}
                    value={formData.nationalId}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("nationalId")}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                  />
                  <label
                    htmlFor="nationalId"
                    className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                      focusedField === "nationalId" || formData.nationalId
                        ? "-top-2 text-xs bg-white px-2 text-primary"
                        : "top-3.5 text-gray-500"
                    }`}
                  >
                    رقم الهوية الوطنية
                  </label>
                  {errors.nationalId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.nationalId}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative w-full lg:w-1/2">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`w-full px-[16px] py-[8px] h-[54px] border-1 rounded-md focus:outline-none focus:ring-1 ${
                      errors.password
                        ? "focus:ring-red-500"
                        : "focus:ring-primary"
                    } ${getInputBorderClass("password")} peer pr-10`}
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
                    className="absolute left-3 top-4 text-[#292D32]"
                    onClick={togglePasswordVisibility}
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
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="relative w-full lg:w-1/2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className={`w-full px-[16px] py-[8px] h-[54px] border-1 rounded-md focus:outline-none focus:ring-1 ${
                      errors.confirmPassword
                        ? "focus:ring-red-500"
                        : "focus:ring-primary"
                    } ${getInputBorderClass("confirmPassword")} peer pr-10`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                  />
                  <label
                    htmlFor="confirmPassword"
                    className={`absolute right-3 transition-all duration-200 pointer-events-none ${
                      focusedField === "confirmPassword" ||
                      formData.confirmPassword
                        ? "-top-2 text-xs bg-white px-2 text-primary"
                        : "top-3.5 text-gray-500"
                    }`}
                  >
                    تأكيد كلمة المرور
                  </label>
                  <button
                    type="button"
                    className="absolute left-3 top-4 text-[#292D32]"
                    onClick={toggleConfirmPasswordVisibility}
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
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* حقل رفع الصورة */}
              <div className="relative flex flex-col items-center mb-2">
                <label
                  htmlFor="image"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  صورة شخصية
                </label>
                <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-2 border-dashed border-[#9E9E9E] bg-gray-50 overflow-hidden cursor-pointer group">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="معاينة الصورة"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FaCamera className="text-3xl text-gray-400 group-hover:text-primary transition" />
                  )}
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleChange}
                  />
                </div>
                {formData.image && (
                  <p className="mt-1 text-xs text-green-700">
                    تم اختيار: {formData.image.name}
                  </p>
                )}
              </div>

              <Modal
                isOpen={showCropModal}
                onRequestClose={() => setShowCropModal(false)}
                contentLabel="قص الصورة"
                ariaHideApp={false}
                style={{
                  content: { maxWidth: 400, margin: "auto", height: 500 },
                }}
              >
                <div
                  style={{ position: "relative", width: "100%", height: 350 }}
                >
                  <Cropper
                    image={tempImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, croppedAreaPixels) =>
                      setCroppedAreaPixels(croppedAreaPixels)
                    }
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setShowCropModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={async () => {
                      const croppedBlob = await getCroppedImg(
                        tempImage,
                        croppedAreaPixels,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        image: new File([croppedBlob], "cropped.jpg", {
                          type: "image/jpeg",
                        }),
                      }));
                      setImagePreview(URL.createObjectURL(croppedBlob));
                      setShowCropModal(false);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded"
                  >
                    حفظ الصورة
                  </button>
                </div>
              </Modal>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.agreeToTerms}
                </p>
              )}
              <div className="mt-[32px]">
                <button
                  type="submit"
                  className={`w-full px-[16px] py-[8px] h-[50px] bg-primary hover:bg-primary/80 text-white font-medium rounded-md transition duration-200 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  } flex items-center justify-center`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      جاري التسجيل...
                    </>
                  ) : (
                    "إنشاء حساب"
                  )}
                </button>
              </div>
              <p className="text-[14px] text-[#313131] mt-1 text-center">
                لديك حساب بالفعل?
                <Link
                  to={"/login"}
                  className="text-primary font-semibold hover:underline"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
