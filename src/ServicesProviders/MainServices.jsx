import React from "react";
import Providers from "./Providers";
import SeoHead from "../Components/SeoHead";

const MainServices = () => {
  return (
    <>
      <SeoHead
        title="مقدمي الخدمات الطبية - ابحث عن أفضل الأطباء والمراكز | Insta Health"
        description="تصفح دليل انستا هيلث الشامل لمقدمي الخدمات الطبية. ابحث عن أفضل الأطباء، العيادات، المستشفيات، ومراكز الأشعة والتحاليل في مصر. احجز موعدك بسهولة."
        keywords="دليل أطباء, حجز موعد دكتور, عيادات, مستشفيات, مراكز أشعة, معامل تحاليل, انستا هيلث, doctors directory, book doctor, medical centers, egypt"
        ogTitle="دليل مقدمي الخدمات الطبية - انستا هيلث"
        ogDescription="ابحث عن أفضل مقدمي الرعاية الصحية في مصر واحجز موعدك أونلاين."
        ogImage="https://instahealth.com/share/providers-og.jpg"
        canonical="https://instahealth.com/providers"
      />
      <Providers />
    </>
  );
};

export default MainServices;
