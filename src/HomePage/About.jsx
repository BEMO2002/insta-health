import React from "react";
import AboutTwoImage from "../assets/Home/about.png";
import looder4 from "../assets/Home/Polygon 3.png";

const AboutTwo = () => {
  return (
    <div className="relative py-16 md:py-24">
      <img
        src={looder4}
        alt=""
        className="absolute hidden lg:block opacity-30 lg:opacity-60 md:opacity-100 left-0 top-30  z-5"
      />
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center lg:gap-20 gap-10 py-8 px-4 md:px-12 relative">
        {/* Left Side: Image */}
        <div className="flex-1 flex justify-center mb-6 md:mb-0">
          <img
            src={AboutTwoImage}
            alt="About Two"
            className=" rounded-lg  object-cover shadow-lg"
          />
        </div>
        {/* Right Side: Text */}
        <div className="flex-1  text-base md:text-lg font-normal">
          <h2 className="font-bold text-2xl md:text-3xl text-second mb-4">
            عن المنصة
          </h2>
          <p className="mb-5 leading-relaxed ">
            تهدف انستا هيلث إلى نقل خدمات الرعاية الصحية في منطقة الشرق الأوسط
            وشمال إفريقيا إلى آفاق جديدة من خلال الاستفادة من التكنولوجيا لجمع
            أكبر عدد من
          </p>
          <p className="leading-relaxed ">
            الأطباء،والممرضون، وأخصائيي العلاج الطبيعي، ومراكز الأشعة والتحاليل
            في منصة واحدة لتقديم خدماتهم في المنزل لمن يحتاجون للرعاية. و تسهل
            الحصول على هذه الخدمات من خلال الإنترنت.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutTwo;
