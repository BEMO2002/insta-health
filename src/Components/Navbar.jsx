import React, { useState, useContext } from "react";
import { FaChevronDown, FaChevronUp, FaBars, FaTimes } from "react-icons/fa";
import {
  FiLock,
  FiLogIn,
  FiLogOut,
  FiUser,
  FiChevronDown as FiChevronDownIcon,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import navlogo from "../assets/Home/LOGO(INSTA HEALTH).svg";
import { toast } from "react-toastify";

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [authDropdownTimeout, setAuthDropdownTimeout] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = (itemName) => {
    clearTimeout(dropdownTimeout);
    setIsServicesOpen(itemName);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsServicesOpen(false);
    }, 300);
    setDropdownTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    clearTimeout(dropdownTimeout);
  };

  const handleDropdownMouseLeave = () => {
    setIsServicesOpen(false);
  };

  const handleAuthMouseEnter = () => {
    clearTimeout(authDropdownTimeout);
    setIsAuthDropdownOpen(true);
  };

  const handleAuthMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsAuthDropdownOpen(false);
    }, 300);
    setAuthDropdownTimeout(timeout);
  };

  const handleAuthDropdownMouseEnter = () => {
    clearTimeout(authDropdownTimeout);
  };

  const handleAuthDropdownMouseLeave = () => {
    setIsAuthDropdownOpen(false);
  };

  const toggleMobileDropdown = (itemName) => {
    setOpenMobileDropdown(openMobileDropdown === itemName ? null : itemName);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setOpenMobileDropdown(null);
  };

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح", {
      position: "top-center",
      autoClose: 3000,
      rtl: true,
      theme: "colored",
    });
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const navItems = [
    { name: "الصفحة الرئيسية", path: "/" },

    {
      name: "الخدمات الطبية",
      subItems: [
        { name: "انتساب جديد", path: "/member" },
        { name: "تجديد الانتساب", path: "/renew" },
        { name: "خدمات الترقية", path: "/title" },
        { name: "استمارة التقديم لفتح مختبر علمي و", path: "/open-lab" },
        {
          name: "استمارة التقديم لفتح مكتب استشاري طبي",
          path: "/open-office",
        },
        {
          name: "استمارة ممارسة المهنة (اجازة المراكز الطبية)",
          path: "/practice-license",
        },
      ],
    },

    { name: "اتصل بنا", path: "/contact" },
  ];
  return (
    <nav className="bg-white shadow-md  z-50 sticky top-0">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2">
        {/* Logo + Menu Toggle (for xl and below) */}
        <div className="flex justify-between  items-center h-24 xl:hidden">
          <Link to={"/"}>
            <img src={navlogo} alt="navlogo" className="w-[90px]" />
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="text-primary hover:text-second focus:outline-none"
          >
            {mobileMenuOpen ? <FaTimes size={26} /> : <FaBars size={26} />}
          </button>
        </div>

        {/* Desktop Nav (visible on xl+) */}
        <div className="hidden xl:flex justify-around p-2 h-[80px]  items-center ">
          <div className="flex items-center gap-10">
            <Link to={"/"}>
              <img src={navlogo} alt="navlogo" className="w-[80px]" />
            </Link>
            {navItems.map((item) =>
              item.subItems ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="relative text-primary p-2 text-[13px] font-[800] flex items-center flex-row-reverse rounded-md hover:bg-second hover:text-white transition-colors duration-300"
                    aria-expanded={isServicesOpen === item.name}
                  >
                    {item.name}
                    {isServicesOpen === item.name ? (
                      <FaChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <FaChevronDown className="w-4 h-4 ml-1 " />
                    )}
                  </button>
                  <div
                    className={`absolute z-10 rtl:-right-13 rtl:top-15  ltr:left-0  w-56 origin-top-right rounded-[12px] bg-white shadow-[0px_0px_4px_0px_#B5D0C5] transition-all duration-300 ease-out ${
                      isServicesOpen === item.name
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                    role="menu"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    <div className="py-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="block p-2 text-sm text-second hover:bg-second hover:text-white transition-colors duration-150"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-primary p-2 text-[14px] font-[800] rounded-md hover:bg-second hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                {/* Auth Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleAuthMouseEnter}
                  onMouseLeave={handleAuthMouseLeave}
                >
                  <butto
                    className="w-12 h-12 text-center text-second border-2 border-second  rounded-full p-3 text-[15px] font-[700] flex items-center justify-center hover:bg-second hover:text-white duration-300"
                    aria-expanded={isAuthDropdownOpen}
                  >
                    <FiUser size={20} />
                  </butto>

                  <div
                    className={`absolute z-20 rtl:-right-0 rtl:top-15 ltr:left-0 w-48 origin-top-right rounded-[12px] bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out ${
                      isAuthDropdownOpen
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                    role="menu"
                    onMouseEnter={handleAuthDropdownMouseEnter}
                    onMouseLeave={handleAuthDropdownMouseLeave}
                  >
                    <div className="py-2">
                      <Link
                        to="/signup"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-second hover:text-white transition-colors duration-150"
                      >
                        <FiLock className="ml-3" size={18} />
                        انشاء حساب
                      </Link>
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-second hover:text-white transition-colors duration-150"
                      >
                        <FiLogIn className="ml-3" size={18} />
                        تسجيل الدخول
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Provider Button - Separate */}
                <Link
                  to="/provider"
                  className="min-w-[156px] min-h-[48px] text-center bg-second text-white px-[16px] py-[8px] rounded-[8px] text-[15px] font-[700] flex items-center justify-center hover:bg-primary duration-300"
                >
                  <FiUser className="ml-2" size={20} />
                  هل انت مقدم خدمة ؟
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="min-w-[156px]  min-h-[48px] text-red-700 border-2 border-red-700 px-[16px] py-[8px] rounded-[8px] text-[15px] font-[700] flex items-center justify-center hover:bg-red-700 duration-300 hover:text-white"
                >
                  <FiLogOut className="ml-2" size={23} />
                  تسجيل الخروج
                </button>
                <Link
                  to="/provider"
                  className="min-w-[156px] min-h-[48px] text-center bg-second text-white px-[16px] py-[8px] rounded-[8px] text-[15px] font-[700] flex items-center justify-center hover:bg-primary duration-300"
                >
                  <FiUser className="ml-2" size={20} />
                  هل انت مقدم خدمة ؟
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu (shown on xl and below) */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white shadow-lg rounded-b-lg absolute top-24 left-0 right-0 z-[10000]">
            <div className="px-2 pt-2 pb-3 space-y-1 rtl:text-right">
              {navItems.map((item) =>
                item.subItems ? (
                  <div key={item.name} className="relative">
                    <button
                      onClick={() => toggleMobileDropdown(item.name)}
                      className="w-full flex justify-between items-center text-primary px-3 py-2 font-medium hover:bg-second hover:text-white rounded-md"
                    >
                      {item.name}
                      {openMobileDropdown === item.name ? (
                        <FaChevronUp className="w-4 h-4" />
                      ) : (
                        <FaChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {openMobileDropdown === item.name && (
                      <div className="pl-4">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="block px-3 py-2 text-sm bg-gray-100 text-primary hover:bg-second hover:text-white rounded-md"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block px-3 py-2 text-primary t font-medium hover:bg-second hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              )}

              <div className="flex flex-col space-y-2 mt-4 px-3">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/signup"
                      className="bg-second text-white px-4 py-2 rounded-md text-md font-medium flex items-center justify-center hover:bg-primary duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiLock className="mr-2" size={20} />
                      التسجيل
                    </Link>
                    <Link
                      to="/login"
                      className="text-second border-2 border-second rounded-md px-4 py-2 text-md font-medium flex items-center justify-center hover:bg-second hover:text-white duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiLogIn className="mr-2" size={20} />
                      تسجيل الدخول
                    </Link>
                    <Link
                      to="/provider"
                      className="bg-gradient-to-r from-second to-primary text-white px-4 py-2 rounded-md text-md font-medium flex items-center justify-center hover:bg-primary duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiUser className="mr-2" size={20} />
                      هل انت مقدم خدمة
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLogout}
                      className="text-red-700  border-2 border-red-700 rounded-md px-4 py-2 text-md font-medium flex items-center justify-center hover:bg-red-700 duration-300 hover:text-white"
                    >
                      <FiLogOut className="mr-2" size={20} />
                      تسجيل الخروج
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
