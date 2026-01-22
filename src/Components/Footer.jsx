import React, { useEffect, useState } from "react";
import footimage from "../assets/Home/footimage.png";
import playStore from "../assets/Home/google.png";
import appStore from "../assets/Home/apple (1).png";
import baseApi from "../api/baseApi";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaSnapchatGhost,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
  FaPhoneAlt,
} from "react-icons/fa";

const Footer = () => {
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await baseApi.get("/ContactInfos");
        if (response.data.success) {
          setContactInfo(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <footer
      className="relative py-16 md:py-8 lg:py-10 xl:py-16 overflow-hidden "
      style={{
        backgroundImage: `url(${footimage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-7xl mx-auto px-8 py-8 relative ">
        <div
          className="flex flex-col lg:flex-row items-start gap-8 lg:gap-40 text-center lg:text-right"
          dir="rtl"
        >
          {/* Content Section */}
          <div className="w-full lg:w-1/2">
            {/* Brand Name */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              انستا هيلث
            </h2>

            {/* Service Description */}
            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
              هي منصة لحجز خدمات الرعاية الصحية في منزلك بحيث تربط المرضى
              بالعديد من الخدمات الطبية من خلال نخبة من أفضل مقدمي الرعاية
              الصحية من المستشفيات والمراكز الطبية إما من خلال الزيارات المنزلية
              أو الاستشارات الطبية
            </p>

            {/* Call to Action */}
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
              حمل التطبيق الأن
            </h3>

            {/* App Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <a
                href="#"
                className="inline-block"
                aria-label="تحميل من App Store"
              >
                <img
                  src={appStore}
                  alt="تحميل من App Store"
                  className="h-12 md:h-14 w-auto mx-auto lg:mx-0"
                />
              </a>
              <a
                href="#"
                className="inline-block"
                aria-label="تحميل من Google Play"
              >
                <img
                  src={playStore}
                  alt="تحميل من Google Play"
                  className="h-12 md:h-14 w-auto mx-auto lg:mx-0"
                />
              </a>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-white ">
            {contactInfo && (
              <>
                <h3 className="text-2xl font-bold mb-6">تواصل معنا</h3>

                {/* Social Media Links */}
                <div className="flex gap-4 mb-6 text-xl flex-wrap justify-center lg:justify-start">
                  {contactInfo.facebookUrl && (
                    <a
                      href={
                        contactInfo.facebookUrl.startsWith("http")
                          ? contactInfo.facebookUrl
                          : `https://${contactInfo.facebookUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1877F2] hover:bg-[#1877F2]/90 p-3 rounded-full transition-all hover:scale-110 text-white"
                      title="Facebook"
                    >
                      <FaFacebookF />
                    </a>
                  )}
                  {contactInfo.instgramUrl && (
                    <a
                      href={
                        contactInfo.instgramUrl.startsWith("http")
                          ? contactInfo.instgramUrl
                          : `https://${contactInfo.instgramUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 p-3 rounded-full transition-all hover:scale-110 text-white"
                      title="Instagram"
                    >
                      <FaInstagram />
                    </a>
                  )}
                  {contactInfo.tiktokUrl && (
                    <a
                      href={
                        contactInfo.tiktokUrl.startsWith("http")
                          ? contactInfo.tiktokUrl
                          : `https://${contactInfo.tiktokUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black hover:bg-gray-800 p-3 rounded-full transition-all hover:scale-110 text-white"
                      title="TikTok"
                    >
                      <FaTiktok />
                    </a>
                  )}
                  {contactInfo.snapChatUrl && (
                    <a
                      href={
                        contactInfo.snapChatUrl.startsWith("http")
                          ? contactInfo.snapChatUrl
                          : `https://${contactInfo.snapChatUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#FFFC00] hover:bg-[#FFFC00]/90 p-3 rounded-full transition-all hover:scale-110 text-black"
                      title="Snapchat"
                    >
                      <FaSnapchatGhost />
                    </a>
                  )}
                  {contactInfo.linkedinUrl && (
                    <a
                      href={
                        contactInfo.linkedinUrl.startsWith("http")
                          ? contactInfo.linkedinUrl
                          : `https://${contactInfo.linkedinUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0077b5] hover:bg-[#0077b5]/90 p-3 rounded-full transition-all hover:scale-110 text-white"
                      title="LinkedIn"
                    >
                      <FaLinkedinIn />
                    </a>
                  )}
                  {contactInfo.twiterUrl && (
                    <a
                      href={
                        contactInfo.twiterUrl.startsWith("http")
                          ? contactInfo.twiterUrl
                          : `https://${contactInfo.twiterUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black hover:bg-gray-800 p-3 rounded-full transition-all hover:scale-110 text-white"
                      title="X (Twitter)"
                    >
                      <FaTwitter />
                    </a>
                  )}
                  {contactInfo.whatsAppUrl && (
                    <a
                      href={
                        contactInfo.whatsAppUrl.startsWith("http")
                          ? contactInfo.whatsAppUrl
                          : `https://${contactInfo.whatsAppUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#25D366]/90 p-3 rounded-full transition-all hover:scale-110 text-white"
                      title="WhatsApp"
                    >
                      <FaWhatsapp />
                    </a>
                  )}
                </div>

                {/* Hotlines */}
                {contactInfo.hotLines && contactInfo.hotLines.length > 0 && (
                  <div className="w-full">
                    <h4 className="text-xl font-semibold mb-4 text-center lg:text-right">
                      الخطوط الساخنة
                    </h4>
                    <div className="flex flex-col gap-2 items-center lg:items-start">
                      {contactInfo.hotLines.map((line) => (
                        <a
                          key={line.id}
                          href={
                            line.url
                              ? line.url
                              : `https://wa.me/20${
                                  line.phoneNumber.startsWith("0")
                                    ? line.phoneNumber.slice(1)
                                    : line.phoneNumber
                                }`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-lg dir-ltr hover:text-gray-300 transition-colors"
                        >
                          <FaPhoneAlt className="text-sm" />
                          <span dir="ltr">{line.phoneNumber}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
