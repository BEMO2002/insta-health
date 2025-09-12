import React from "react";
import footimage from "../assets/Home/footimage.png";
import playStore from "../assets/Home/google.png";
import appStore from "../assets/Home/apple (1).png";

const Footer = () => {
  return (
    <footer
      className="relative py-16 md:py-20 overflow-hidden"
      style={{
        backgroundImage: `url(${footimage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-7xl mx-auto px-8 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Content Section */}
          <div className="w-full text-center lg:text-right" dir="rtl">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
        </div>

        {/* Bottom Border */}
        {/* <div className="mt-16 pt-8 border-t border-white">
          <div className="text-center text-white/70">
            <p className="text-sm md:text-base">
              © 2025 انستا هيلث. جميع الحقوق محفوظة.
            </p>
          </div>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
