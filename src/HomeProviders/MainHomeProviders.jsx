import React from "react";
import HomeProviders from "./HomeProviders";
import HomeContent from "./HomeContent";
import SeoHead from "../Components/SeoHead";

const MainHomeProviders = () => {
  return (
    <>
      <SeoHead
        title="خدمات الصحة المنزلية - تمريض وكشف منزلي | Insta Health"
        description="خدمات صحية منزلية متكاملة في مصر. احجز الآن تمريض منزلي، زيارة طبيب، علاج طبيعي، ورعاية كبار السن في منزلك بأعلى معايير الجودة. | Home healthcare services."
        keywords="تمريض منزلي, كشف منزلي, دكتور يجي البيت, علاج طبيعي منزلي, رعاية مسنين, سحب عينات, اشعة منزلية, home nursing, home visit doctor, elderly care, egypt"
        ogTitle="انستا هيلث - خدمات الرعاية الصحية المنزلية"
        ogDescription="رعاية صحية متكاملة تصلك إلى باب بيتك. تمريض، أطباء، وتحاليل."
        ogImage="https://insta-health.netlify.app/metalogo.jpeg"
        canonical="https://instahealth.com/home-providers"
      />
      <HomeContent slugProp="alkhdmat-almnzlyh" />
      <HomeProviders />;
    </>
  );
};

export default MainHomeProviders;
